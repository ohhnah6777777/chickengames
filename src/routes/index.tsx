import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import games from "@/lib/games.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chicken Games — Free Browser Games" },
      { name: "description", content: "A simple collection of browser games you can play instantly." },
      { property: "og:title", content: "Chicken Games — Free Browser Games" },
      { property: "og:description", content: "A simple collection of browser games you can play instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const pretty = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Icon({ name, icon }: { name: string; icon: string | null }) {
  const base = `https://gitlab.com/3kh0/3kh0-assets/-/raw/main/${encodeURIComponent(name)}/`;
  const srcs = icon ? [base + icon.split("/").map(encodeURIComponent).join("/")] : [];
  const [i, setI] = useState(0);
  if (i >= srcs.length)
    return <div className="flex h-full w-full items-center justify-center font-display text-3xl text-primary">{name[0]?.toUpperCase()}</div>;
  return <img src={srcs[i]} alt="" loading="lazy" onError={() => setI(i + 1)} className="h-full w-full object-cover" />;
}

function Index() {
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const list = (games as { id: string; icon: string | null }[]).filter(({ id: g }) => g.toLowerCase().includes(q.toLowerCase()));

  if (playing)
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-4 border-b border-border px-4 py-3">
          <button onClick={() => setPlaying(null)} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">← Back</button>
          <h2 className="font-display text-xl">{pretty(playing)}</h2>
        </div>
        <iframe src={`/g/${playing}/index.html`} title={playing} className="w-full flex-1 border-0" allowFullScreen />
      </div>
    );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="flex items-center gap-3 font-display text-4xl text-primary"><img src="/favicon.png" alt="" className="h-12 w-12" />CHICKEN GAMES</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${games.length} games…`}
          className="w-full rounded-md border border-input bg-card px-4 py-2 outline-none focus:ring-2 focus:ring-ring sm:w-72" />
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {list.map(({ id: g, icon }) => (
          <button key={g} onClick={() => setPlaying(g)} className="group text-left">
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-card transition group-hover:-translate-y-1 group-hover:border-primary">
              <Icon name={g} icon={icon} />
            </div>
            <p className="mt-2 truncate text-sm text-muted-foreground group-hover:text-foreground">{pretty(g)}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
