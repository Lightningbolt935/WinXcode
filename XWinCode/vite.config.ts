import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

function devCorpusServer() {
  return {
    name: "dev-corpus-server",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith("/__dev/")) return next();
        const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const currentDir = import.meta.dirname || path.resolve(".");
        const repoRoot = path.resolve(currentDir, "..");

        if (parsed.pathname === "/__dev/file") {
          const rawPath = parsed.searchParams.get("path");
          if (!rawPath) {
            res.statusCode = 400;
            res.end("Missing path parameter");
            return;
          }
          const fullPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(repoRoot, rawPath);
          try {
            const data = await fs.promises.readFile(fullPath, "utf-8");
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end(data);
          } catch (err: any) {
            res.statusCode = 404;
            res.end(String(err?.message || err));
          }
          return;
        }

        if (parsed.pathname === "/__dev/list_files") {
          const dir = parsed.searchParams.get("dir") || ".";
          const fullDir = path.isAbsolute(dir) ? dir : path.resolve(repoRoot, dir);
          try {
            const entries = await fs.promises.readdir(fullDir, { recursive: true, withFileTypes: true });
            const files = entries
              .filter((e) => e.isFile())
              .map((e) => {
                const parent = (e as any).parentPath || (e as any).path || fullDir;
                return path.relative(fullDir, path.join(parent, e.name)).replace(/\\/g, "/");
              });
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(files));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err?.message || err) }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devCorpusServer()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 6000,
  },
});
