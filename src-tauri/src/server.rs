use crate::models::CompetitionState;
use parking_lot::Mutex;
use std::io::{self, Cursor, Read};
use std::path::{Path, PathBuf};
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};

#[cfg(debug_assertions)]
use std::io::Write;
#[cfg(debug_assertions)]
use std::net::TcpStream;

const BIND_ADDR: &str = "127.0.0.1:4567";
const VITE_DEV_ORIGIN: &str = "http://localhost:5177";

pub struct SseBroadcaster {
    subscribers: Mutex<Vec<Sender<String>>>,
}

impl SseBroadcaster {
    pub fn new() -> Self {
        Self {
            subscribers: Mutex::new(Vec::new()),
        }
    }

    pub fn subscribe(&self) -> Receiver<String> {
        let (tx, rx) = mpsc::channel();
        self.subscribers.lock().push(tx);
        rx
    }

    pub fn broadcast(&self, payload: &str) {
        let mut subscribers = self.subscribers.lock();
        subscribers.retain(|tx| tx.send(payload.to_string()).is_ok());
    }
}

pub struct SharedState {
    pub competition: Mutex<CompetitionState>,
    pub broadcaster: SseBroadcaster,
    pub data_path: PathBuf,
    pub static_dir: PathBuf,
}

pub fn start(shared: Arc<SharedState>) {
    thread::spawn(move || {
        let server = match Server::http(BIND_ADDR) {
            Ok(server) => server,
            Err(err) => {
                eprintln!("[overlay-server] failed to bind {BIND_ADDR}: {err}");
                return;
            }
        };

        eprintln!("[overlay-server] listening on http://{BIND_ADDR}");

        for request in server.incoming_requests() {
            let shared = Arc::clone(&shared);
            thread::spawn(move || {
                if let Err(err) = handle_request(request, &shared) {
                    eprintln!("[overlay-server] request error: {err}");
                }
            });
        }
    });
}

fn handle_request(request: Request, shared: &SharedState) -> io::Result<()> {
    let method = request.method().clone();
    let url = request.url().to_string();
    let path = url.split('?').next().unwrap_or("/");

    if method == Method::Options {
        return respond_cors(request, Response::empty(204));
    }

    match (method, path) {
        (Method::Get, "/api/state") => {
            let state = shared.competition.lock().clone();
            let body = serde_json::to_vec(&state).unwrap_or_else(|_| b"{}".to_vec());
            let response = Response::from_data(body)
                .with_status_code(StatusCode(200))
                .with_header(header("Content-Type", "application/json; charset=utf-8"));
            respond_cors(request, response)
        }
        (Method::Get, "/api/events") => handle_sse(request, shared),
        (Method::Get, _) => serve_static_or_proxy(request, path, &shared.static_dir),
        _ => {
            let response = Response::from_string("Not Found").with_status_code(StatusCode(404));
            respond_cors(request, response)
        }
    }
}

fn handle_sse(request: Request, shared: &SharedState) -> io::Result<()> {
    let rx = shared.broadcaster.subscribe();
    let initial = {
        let state = shared.competition.lock().clone();
        serde_json::to_string(&state).unwrap_or_else(|_| "{}".to_string())
    };

    let stream = SseBody::new(rx, initial);
    let response = Response::new(
        StatusCode(200),
        vec![
            header("Content-Type", "text/event-stream; charset=utf-8"),
            header("Cache-Control", "no-cache"),
            header("Connection", "keep-alive"),
            header("Access-Control-Allow-Origin", "*"),
        ],
        stream,
        None,
        None,
    );

    request.respond(response)
}

fn serve_static_or_proxy(request: Request, path: &str, static_dir: &Path) -> io::Result<()> {
    // In dev, always proxy to Vite so OBS gets live CSS/JS (never a stale dist build).
    #[cfg(debug_assertions)]
    {
        let _ = static_dir;
        return proxy_to_vite(request, path);
    }

    #[cfg(not(debug_assertions))]
    {
        let relative = if path == "/" {
            "index.html"
        } else {
            path.trim_start_matches('/')
        };
        let candidate = static_dir.join(relative);

        if candidate.is_file() {
            return respond_file(request, &candidate);
        }

        let index = static_dir.join("index.html");
        if index.is_file() {
            return respond_file(request, &index);
        }

        let response = Response::from_string("Frontend assets not found. Rebuild the app.")
            .with_status_code(StatusCode(404));
        respond_cors(request, response)
    }
}

#[cfg(debug_assertions)]
fn proxy_to_vite(request: Request, path: &str) -> io::Result<()> {
    let target = format!("{VITE_DEV_ORIGIN}{path}");
    match ureq_get(&target) {
        Ok((status, content_type, body)) => {
            let mut response = Response::from_data(body).with_status_code(StatusCode(status));
            if let Some(ct) = content_type {
                response = response.with_header(header("Content-Type", &ct));
            }
            respond_cors(request, response)
        }
        Err(err) => {
            let message = format!(
                "Dev proxy failed for {target}: {err}. Is Vite running on {VITE_DEV_ORIGIN}?"
            );
            let response = Response::from_string(message).with_status_code(StatusCode(502));
            respond_cors(request, response)
        }
    }
}

#[cfg(debug_assertions)]
fn ureq_get(url: &str) -> io::Result<(u16, Option<String>, Vec<u8>)> {
    let parsed = url.trim_start_matches("http://");
    let (host_port, path) = parsed.split_once('/').unwrap_or((parsed, ""));
    let path = if path.is_empty() {
        "/".to_string()
    } else {
        format!("/{path}")
    };

    let mut stream = TcpStream::connect(host_port)?;
    stream.set_read_timeout(Some(Duration::from_secs(5)))?;
    stream.set_write_timeout(Some(Duration::from_secs(5)))?;

    let request = format!(
        "GET {path} HTTP/1.1\r\nHost: {host_port}\r\nConnection: close\r\n\r\n"
    );
    stream.write_all(request.as_bytes())?;

    let mut raw = Vec::new();
    stream.read_to_end(&mut raw)?;
    let raw_str = String::from_utf8_lossy(&raw);
    let (header_part, body_part) = raw_str.split_once("\r\n\r\n").unwrap_or((&raw_str, ""));

    let status = header_part
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|code| code.parse::<u16>().ok())
        .unwrap_or(502);

    let content_type = header_part
        .lines()
        .find(|line| line.to_ascii_lowercase().starts_with("content-type:"))
        .map(|line| line.split_once(':').map(|(_, v)| v.trim().to_string()).unwrap_or_default());

    let header_bytes = header_part.len() + 4;
    let body = if raw.len() > header_bytes {
        raw[header_bytes..].to_vec()
    } else {
        body_part.as_bytes().to_vec()
    };

    Ok((status, content_type, body))
}

#[cfg(not(debug_assertions))]
fn respond_file(request: Request, path: &Path) -> io::Result<()> {
    let data = std::fs::read(path)?;
    let content_type = mime_for_path(path);
    let response = Response::from_data(data)
        .with_status_code(StatusCode(200))
        .with_header(header("Content-Type", content_type));
    respond_cors(request, response)
}

fn respond_cors<R: Read>(request: Request, response: Response<R>) -> io::Result<()> {
    let response = response
        .with_header(header("Access-Control-Allow-Origin", "*"))
        .with_header(header("Access-Control-Allow-Methods", "GET, OPTIONS"))
        .with_header(header("Access-Control-Allow-Headers", "Content-Type"));
    request.respond(response)
}

fn header(name: &str, value: &str) -> Header {
    Header::from_bytes(name.as_bytes(), value.as_bytes()).expect("valid header")
}

#[cfg(not(debug_assertions))]
fn mime_for_path(path: &Path) -> &'static str {
    match path.extension().and_then(|ext| ext.to_str()).unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "js" => "application/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json; charset=utf-8",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        _ => "application/octet-stream",
    }
}

struct SseBody {
    rx: Receiver<String>,
    buffer: Cursor<Vec<u8>>,
    closed: bool,
}

impl SseBody {
    fn new(rx: Receiver<String>, initial_json: String) -> Self {
        let initial = format!("event: state\ndata: {initial_json}\n\n");
        Self {
            rx,
            buffer: Cursor::new(initial.into_bytes()),
            closed: false,
        }
    }

    fn fill_buffer(&mut self) -> io::Result<()> {
        if self.closed {
            return Ok(());
        }

        match self.rx.recv_timeout(Duration::from_secs(15)) {
            Ok(payload) => {
                let chunk = format!("event: state\ndata: {payload}\n\n");
                self.buffer = Cursor::new(chunk.into_bytes());
                Ok(())
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                self.buffer = Cursor::new(b": heartbeat\n\n".to_vec());
                Ok(())
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => {
                self.closed = true;
                Ok(())
            }
        }
    }
}

impl Read for SseBody {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        loop {
            let read = self.buffer.read(buf)?;
            if read > 0 {
                return Ok(read);
            }

            if self.closed {
                return Ok(0);
            }

            self.fill_buffer()?;
            if self.closed && self.buffer.position() >= self.buffer.get_ref().len() as u64 {
                return Ok(0);
            }
        }
    }
}
