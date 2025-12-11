// Stub pino-pretty so Stagehand won't fail if transport resolution runs in production.
// This creates a minimal module that Pino can resolve and use as a no-op transport.
import { Writable } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(__dirname, "..", "node_modules", "pino-pretty");
const targetFile = path.join(targetDir, "index.js");
const targetPkg = path.join(targetDir, "package.json");

const stubCode = `
// Auto-generated stub for pino-pretty (no-op transport)
import { Writable } from "node:stream";
export default function pinoPretty() {
  return new Writable({
    write(_chunk, _enc, cb) {
      cb();
    }
  });
}
export function prettifier() {
  return (line) => line;
}
`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetFile, stubCode, "utf8");
fs.writeFileSync(
  targetPkg,
  JSON.stringify(
    {
      name: "pino-pretty",
      version: "0.0.0-stub",
      type: "module",
      main: "./index.js",
      module: "./index.js",
      exports: {
        ".": "./index.js",
      },
    },
    null,
    2
  ),
  "utf8"
);

console.log("[postinstall] Stubbed pino-pretty with no-op transport");

