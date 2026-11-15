import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function applyOverlayModeEarly(): void {
  const isOverlay = window.location.hash.includes("/overlay");
  document.documentElement.classList.toggle("overlay-mode", isOverlay);
  document.body.classList.toggle("overlay-mode", isOverlay);
}

applyOverlayModeEarly();
window.addEventListener("hashchange", applyOverlayModeEarly);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
