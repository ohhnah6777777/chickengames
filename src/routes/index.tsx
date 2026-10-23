import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gamesData from "@/lib/games.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chicken Games — Free Browser Games" },
      { name: "description", content: "Chicken Games: hundreds of browser games you can play instantly." },
      { property: "og:title", content: "Chicken Games — Free Browser Games" },
      { property: "og:description", content: "Chicken Games: hundreds of browser games you can play instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Game = { id: string; icon: boolean };
const games = gamesData as Game[];
const pretty = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Icon({ game }: { game: Game }) {
  const [bad, setBad] = useState(false);
  if (!game.icon || bad)
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary font-display text-3xl text-primary">
        {game.id[0]?.toUpperCase()}
      </div>
    );
  return <img src={`/icons/${game.id}.webp`} alt="" loading="lazy" width={160} height={160} onError={() => setBad(true)} className="h-full w-full object-cover" />;
}

function useLikes() {
  const [likes, setLikes] = useState<string[]>([]);
  useEffect(() => {
    try { setLikes(JSON.parse(localStorage.getItem("cg-likes") || "[]")); } catch { /* ignore */ }
  }, []);
  const toggle = (id: string) =>
    setLikes((l) => {
      const n = l.includes(id) ? l.filter((x) => x !== id) : [...l, id];
      localStorage.setItem("cg-likes", JSON.stringify(n));
      return n;
    });
  return { likes, toggle };
}

const btn = "rounded-md border-2 border-foreground px-3 py-1.5 text-sm font-bold transition hover:-translate-y-0.5";

function Index() {
  const [q, setQ] = useState("");
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const { likes, toggle } = useLikes();
  const frame = useRef<HTMLIFrameElement>(null);

  const list = games.filter((g) => g.id.toLowerCase().includes(q.toLowerCase()) && (!onlyLiked || likes.includes(g.id)));

  if (playing) {
    const liked = likes.includes(playing);
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex flex-wrap items-center gap-3 border-b-2 border-border px-4 py-3">
          <button onClick={() => setPlaying(null)} className={`${btn} bg-primary text-primary-foreground`}>← Back</button>
          <h2 className="mr-auto font-display text-lg">{pretty(playing)}</h2>
          <button onClick={() => toggle(playing)} className={`${btn} ${liked ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            {liked ? "♥ Liked" : "♡ Like"}
          </button>
          <button onClick={() => frame.current?.contentWindow?.location.reload()} className={`${btn} bg-card`}>↻ Reload</button>
          <button onClick={() => frame.current?.requestFullscreen()} className={`${btn} bg-secondary`}>⛶ Fullscreen</button>
        </div>
        <iframe ref={frame} src={`/g/${playing}/index.html`} title={playing} className="w-full flex-1 border-0" allowFullScreen />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 font-display text-3xl text-primary">
          <img src="/favicon.png" alt="" width={48} height={48} className="h-12 w-12 [image-rendering:pixelated]" />
          CHICKEN GAMES
        </h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${games.length} games…`}
          className="w-full rounded-md border-2 border-input bg-card px-4 py-2 outline-none focus:ring-2 focus:ring-ring sm:w-72" />
      </header>
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setOnlyLiked(false)} className={`${btn} ${!onlyLiked ? "bg-primary text-primary-foreground" : "bg-card"}`}>All games</button>
        <button onClick={() => setOnlyLiked(true)} className={`${btn} ${onlyLiked ? "bg-primary text-primary-foreground" : "bg-card"}`}>♥ Liked ({likes.length})</button>
        <button onClick={() => setPlaying(games[Math.floor(Math.random() * games.length)]?.id ?? null)} className={`${btn} bg-secondary`}>🎲 Random game</button>
      </div>
      {list.length === 0 && <p className="text-muted-foreground">{onlyLiked ? "No liked games yet — tap ♡ on any game." : "No games found."}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((g) => (
          <div key={g.id} className="group relative">
            <button onClick={() => setPlaying(g.id)} className="block w-full text-left">
              <div className="aspect-square overflow-hidden rounded-lg border-2 border-border bg-card transition group-hover:-translate-y-1 group-hover:border-primary">
                <Icon game={g} />
              </div>
              <p className="mt-2 truncate text-sm text-muted-foreground group-hover:text-foreground">{pretty(g.id)}</p>
            </button>
            <button onClick={() => toggle(g.id)} aria-label="Like"
              className="absolute right-2 top-2 rounded-full bg-card px-2 py-0.5 text-primary shadow">
              {likes.includes(g.id) ? "♥" : "♡"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
