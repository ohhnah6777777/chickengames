import { createFileRoute } from "@tanstack/react-router";

const RAW = "https://gitlab.com/3kh0/3kh0-assets/-/raw/main/";
const MIME: Record<string, string> = {
  html: "text/html; charset=utf-8", htm: "text/html; charset=utf-8",
  js: "application/javascript", mjs: "application/javascript", css: "text/css",
  json: "application/json", wasm: "application/wasm", png: "image/png",
  jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml",
  webp: "image/webp", ico: "image/x-icon", mp3: "audio/mpeg", ogg: "audio/ogg",
  wav: "audio/wav", mp4: "video/mp4", woff: "font/woff", woff2: "font/woff2",
  ttf: "font/ttf", xml: "application/xml", txt: "text/plain",
};

export const Route = createFileRoute("/g/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let path = params._splat ?? "";
        if (!path || path.endsWith("/")) path += "index.html";
        const upstream = await fetch(RAW + path.split("/").map(encodeURIComponent).join("/"));
        if (!upstream.ok) return new Response("Not found", { status: 404 });
        const ext = path.split(".").pop()?.toLowerCase() ?? "";
        return new Response(upstream.body, {
          headers: {
            "content-type": MIME[ext] ?? "application/octet-stream",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
