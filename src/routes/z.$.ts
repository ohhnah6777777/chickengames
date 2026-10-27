import { createFileRoute } from "@tanstack/react-router";

const RAW = "https://raw.githubusercontent.com/ohhnah6777777/genizymath.github.io/main/iframe/";

export const Route = createFileRoute("/z/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[A-Za-z0-9._-]+\.html?$/.test(path))
          return new Response("Not found", { status: 404 });
        const upstream = await fetch(RAW + encodeURIComponent(path));
        if (!upstream.ok) return new Response("Not found", { status: upstream.status });
        return new Response(upstream.body, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
