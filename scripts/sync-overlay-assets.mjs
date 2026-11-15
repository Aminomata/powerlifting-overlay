import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "dist");
const target = join(root, "src-tauri", "resources", "dist");

mkdirSync(dirname(target), { recursive: true });

if (!existsSync(source)) {
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, "index.html"), "<!doctype html><html><body>Build pending</body></html>\n");
  console.log(`[sync:overlay-assets] created placeholder at ${target}`);
  process.exit(0);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`[sync:overlay-assets] copied ${source} -> ${target}`);
