import { createFileRoute } from "@tanstack/react-router";

// Wrapper page that gives each game persistent save progress.
// The game runs in a nested same-origin iframe; this wrapper restores the
// game's localStorage from a per-game snapshot before it starts, then
// periodically writes the game's localStorage back into that snapshot.
export const Route = createFileRoute("/play/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat ?? "";
        const m = /^(gh|gz|3kh0)\/(.+)$/.exec(splat);
        if (!m) return new Response("Not found", { status: 404 });
        const source = m[1];
        const rest = m[2] ?? "";
        if (rest.includes("..") || rest.includes('"') || rest.includes("<"))
          return new Response("Not found", { status: 404 });
        const real = source === "gh" ? `/o/${rest}` : source === "gz" ? `/z/${rest}` : `/g/${rest}`;
        const key = `cg-save:${source}:${rest}`;
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><script>
var KEY=${JSON.stringify(key)},REAL=${JSON.stringify(real)};
try{var saved=JSON.parse(localStorage.getItem(KEY)||"null");
if(saved)for(var k in saved)localStorage.setItem(k,saved[k]);}catch(e){}
var f=document.createElement("iframe");
f.src=REAL;f.allow="fullscreen; autoplay; gamepad";f.allowFullscreen=true;
document.body.appendChild(f);
setInterval(function(){try{var s=f.contentWindow.localStorage,d={};
for(var i=0;i<s.length;i++){var k=s.key(i);if(k.indexOf("cg-")!==0)d[k]=s.getItem(k);}
localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}},3000);
</script></body></html>`;
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
