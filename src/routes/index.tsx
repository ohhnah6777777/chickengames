import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gamesData from "@/lib/games.json";
import { gameInfo, gameUrl, isTrending, pretty, tagsFor, type Game } from "@/lib/game-utils";
import { ArrowLeft, ChevronRight, Clock, Flame, Heart, Info, Maximize, RotateCw, Search, Settings, Shuffle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { useAccount } from "@/components/account-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blues Games — Free Browser Games" },
      { name: "description", content: "Blues Games: over a thousand browser games you can play instantly, no downloads." },
      { property: "og:title", content: "Blues Games — Free Browser Games" },
      { property: "og:description", content: "Blues Games: over a thousand browser games you can play instantly, no downloads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const games = gamesData as Game[];
const byId = new Map(games.map((g) => [g.id, g]));
const iconSrc = (g: Game) => (g.src === "gh" ? `/icons-o/${g.id}.webp` : g.src === "gz" ? `/icons-z/${g.id}.webp` : `/icons/${g.id}.webp`);
const FILTER_TAGS = ["Arcade", "Puzzle", "Racing", "Sports", "Action", "Idle", "Horror", "Sandbox", "Strategy", "IO"];
const TOP = ["slope", "minecraft", "retro-bowl", "basketball-stars", "cookie-clicker", "subway-surfers", "run-3", "geometry-dash", "drive-mad", "1v1-lol"];
// Every Nth tile in the mosaic is shown bigger, like the reference layout.
const sizeFor = (i: number) => (i === 1 || i % 37 === 9 ? "huge" : i % 11 === 4 ? "big" : "");

function Icon({ game }: { game: Game }) {
  const [bad, setBad] = useState(false);
  if (!game.icon || bad)
    return <div className="flex h-full w-full items-center justify-center bg-card p-2 text-center font-display text-sm font-semibold text-foreground">{pretty(game.id)}</div>;
  return <img src={iconSrc(game)} alt="" loading="lazy" width={160} height={160} onError={() => setBad(true)} className="h-full w-full object-cover" />;
}

function useLocalList(key: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(s)) setList(s.filter((x) => typeof x === "string")); } catch { /* ignore */ }
  }, [key]);
  const save = (next: string[]) => { setList(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ } };
  return [list, save] as const;
}

function useLikes() {
  const { user, profile, saveProfile } = useAccount();
  const [localLikes, saveLocal] = useLocalList("cg-likes");
  const [error, setError] = useState("");
  const likes = user ? profile?.liked_games ?? [] : localLikes;
  const toggle = (id: string) => {
    const next = likes.includes(id) ? likes.filter((x) => x !== id) : [...likes, id];
    setError("");
    if (user) void saveProfile({ liked_games: next }).catch(() => setError("Could not save your like. Please try again."));
    else saveLocal(next);
  };
  return { likes, toggle, error };
}

type Panel = null | "search" | "account" | "settings";

function Index() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "liked" | "recent">("all");
  const [panel, setPanel] = useState<Panel>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const { likes, toggle, error } = useLikes();
  const [recent, saveRecent] = useLocalList("cg-recent");
  const player = useRef<HTMLDivElement>(null);
  const [reload, setReload] = useState(0);
  const [playerError, setPlayerError] = useState("");
  const { user, profile } = useAccount();

  const start = (id: string) => {
    setPlaying(id); setPanel(null); setPlayerError("");
    saveRecent([id, ...recent.filter((x) => x !== id)].slice(0, 24));
    window.scrollTo({ top: 0 });
  };
  const playingGame = playing ? byId.get(playing) : undefined;
  const top = TOP.flatMap((id) => byId.get(id) ?? []);
  const base = view === "liked" ? games.filter((g) => likes.includes(g.id)) : view === "recent" ? recent.flatMap((id) => byId.get(id) ?? []) : games;
  const list = base.filter((g) => (!tag || tagsFor(g.id).includes(tag)) && pretty(g.id).toLowerCase().includes(q.toLowerCase()));
  const plain = !q && !tag && view === "all";
  const shown = plain ? [...top, ...list.filter((g) => !TOP.includes(g.id))] : list;

  const tile = (g: Game, i: number, size = "") => (
    <div key={g.id} className={`game-tile group ${size}`}>
      <button type="button" aria-label={pretty(g.id)} title={pretty(g.id)} onClick={() => start(g.id)} className="block h-full w-full bg-card">
        <Icon game={g} />
        {isTrending(g.id) && <span className="tile-badge"><Flame className="size-2.5" />Hot</span>}
        <span className="tile-name truncate">{pretty(g.id)}</span>
      </button>
      <Button variant="secondary" size="icon" aria-label={`${likes.includes(g.id) ? "Unlike" : "Like"} ${pretty(g.id)}`} onClick={() => toggle(g.id)} className="absolute right-1.5 top-1.5 size-7 rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <Heart className="size-3.5" fill={likes.includes(g.id) ? "currentColor" : "none"} />
      </Button>
    </div>
  );

  const row = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <button type="button" className="panel-row" onClick={onClick}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">{icon}</span>
      <span className="flex-1">{label}</span><ChevronRight className="size-4" />
    </button>
  );

  return (
    <div className="min-h-dvh">
      {/* Floating logo card */}
      <div className="fixed left-3 top-3 z-30 w-[104px] overflow-hidden rounded-2xl bg-secondary text-secondary-foreground shadow-lg">
        <button type="button" className="flex w-full flex-col items-center gap-0.5 px-2 pb-1 pt-2" onClick={() => { setPlaying(null); setView("all"); setQ(""); setTag(null); setPanel(null); }} aria-label="Blues Games home">
          <img src="/mascot.webp" alt="" width={48} height={48} className="size-12 object-contain" />
          <span className="font-display text-[13px] font-bold leading-none text-card">Blues Games</span>
        </button>
        <div className="grid grid-cols-2 border-t border-border/40 bg-card text-foreground">
          <button type="button" aria-label="Account" title="Account" className="flex h-9 items-center justify-center hover:bg-accent" onClick={() => setPanel("account")}><User className="size-4" /></button>
          <button type="button" aria-label="Search" title="Search" className="flex h-9 items-center justify-center hover:bg-accent" onClick={() => setPanel("search")}><Search className="size-4" /></button>
        </div>
      </div>

      {/* Yellow slide-out panel */}
      {panel && <button type="button" aria-label="Close panel" className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[1px]" onClick={() => setPanel(null)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(400px,90vw)] flex-col overflow-y-auto bg-panel text-panel-foreground shadow-2xl transition-transform duration-200 ${panel ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!panel}>
        <div className="flex items-center gap-3 border-b border-panel-foreground/10 px-4 py-4">
          <button type="button" aria-label="Back" className="flex size-9 items-center justify-center rounded-full bg-secondary/70" onClick={() => setPanel(panel === "settings" ? "account" : null)}><ArrowLeft className="size-4" /></button>
          <h2 className="font-display text-xl font-bold">{panel === "search" ? "Search" : panel === "settings" ? "Settings" : "Account"}</h2>
        </div>
        <div className="grid gap-4 p-5">
          {panel === "search" && <>
            <label className="flex items-center gap-3 rounded-full bg-secondary px-4 py-3 text-secondary-foreground shadow-sm">
              <Search className="size-4 opacity-60" />
              <input autoFocus aria-label="Search games" placeholder="What are you playing today?" value={q} onChange={(e) => { setQ(e.target.value); setPlaying(null); }} className="w-full bg-transparent text-sm outline-none" />
            </label>
            <div className="flex flex-wrap gap-2">
              {FILTER_TAGS.map((t) => <button key={t} type="button" onClick={() => { setTag(tag === t ? null : t); setPlaying(null); }} className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase shadow-sm ${tag === t ? "bg-card text-foreground" : "bg-secondary text-secondary-foreground"}`}>{t}</button>)}
            </div>
            <p className="text-sm font-semibold">{list.length} games {q || tag ? "match" : "in the library"}</p>
            <h3 className="font-display text-xl font-bold">Top Games</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {top.map((g) => <button key={g.id} type="button" title={pretty(g.id)} onClick={() => start(g.id)} className="size-24 shrink-0 overflow-hidden rounded-xl shadow-md"><Icon game={g} /></button>)}
            </div>
          </>}
          {panel === "account" && <>
            <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
              <img src="/mascot-thumbs.webp" alt="" width={56} height={56} className="size-14 object-contain" />
              <div className="min-w-0"><p className="font-bold">{user ? profile?.display_name ?? "Player" : "Local player"}</p><p className="text-xs opacity-70">{user ? "Your likes are saved to your account." : "Local account · not saved to an account"}</p></div>
            </div>
            <AccountMenu className="panel-row"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><User className="size-4" /></span><span className="flex-1">Profile</span><ChevronRight className="size-4" /></AccountMenu>
            {row(<Heart className="size-4" />, `Liked games (${likes.length})`, () => { setView("liked"); setPlaying(null); setPanel(null); })}
            {row(<Clock className="size-4" />, "Recently played", () => { setView("recent"); setPlaying(null); setPanel(null); })}
            {row(<Shuffle className="size-4" />, "Random game", () => start(games[Math.floor(Math.random() * games.length)]?.id ?? "2048"))}
            {row(<Settings className="size-4" />, "Settings", () => setPanel("settings"))}
          </>}
          {panel === "settings" && <>
            <div className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">Game progress and recently played games are saved in this browser automatically.</div>
            <Button variant="outline" className="h-12 rounded-xl bg-secondary text-secondary-foreground" onClick={() => { saveRecent([]); }}>Clear recently played</Button>
          </>}
        </div>
      </aside>

      {error && <p role="status" className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">{error}</p>}

      {playing && playingGame ? (
        <main className="mx-auto max-w-6xl px-3 pb-10 pt-3 sm:pl-[130px]">
          <div ref={player} className="flex aspect-video min-h-[340px] flex-col overflow-hidden rounded-2xl bg-card shadow-xl max-sm:mt-28 max-sm:h-[65dvh]">
            <iframe key={`${playing}-${reload}`} src={gameUrl(playingGame)} title={pretty(playing)} className="min-h-0 w-full flex-1 border-0" allow="fullscreen; autoplay; gamepad" allowFullScreen />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-panel px-4 py-3 text-panel-foreground">
            <h1 className="mr-auto min-w-0 break-words font-display text-xl font-bold">{pretty(playing)}</h1>
            <Button variant="ghost" size="icon" aria-label={likes.includes(playing) ? "Unlike game" : "Like game"} onClick={() => toggle(playing)}><Heart fill={likes.includes(playing) ? "currentColor" : "none"} /></Button>
            <Button variant="ghost" size="icon" aria-label="Reload game" onClick={() => setReload((n) => n + 1)}><RotateCw /></Button>
            <Button size="icon" className="bg-card text-foreground hover:bg-card/90" aria-label="Fullscreen" onClick={() => { void player.current?.requestFullscreen().catch(() => setPlayerError("Fullscreen is not available in this browser.")); }}><Maximize /></Button>
          </div>
          {playerError && <p role="status" className="mt-2 text-sm">{playerError}</p>}
          <div className="mt-3 rounded-2xl bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2"><Info className="size-4 text-primary" /><h2 className="text-sm font-bold">About this game</h2>
              {tagsFor(playing).map((t) => <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">{t}</span>)}
              {isTrending(playing) && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Hot</span>}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{gameInfo(playingGame)}</p>
          </div>
          <h2 className="mb-2 mt-6 font-display text-lg font-bold">More games</h2>
          <div className="game-grid">{games.filter((g) => g.id !== playing).slice(0, 30).map((g, i) => tile(g, i))}</div>
        </main>
      ) : (
        <main>
          {!plain && <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:pl-[130px]">
            <h1 className="font-display text-xl font-bold">{view === "liked" ? "Liked games" : view === "recent" ? "Recently played" : q ? `Results for "${q}"` : `${tag} games`}</h1>
            <Button size="sm" className="rounded-full" onClick={() => { setView("all"); setQ(""); setTag(null); }}>Show all</Button>
          </div>}
          {list.length ? (
            <div className="mosaic">
              <div aria-hidden className="pointer-events-none" style={{ gridRow: "span 2", aspectRatio: "auto" }} />
              {shown.map((g, i) => tile(g, i, plain && g.icon ? sizeFor(i + 1) : ""))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <img src="/mascot-cookie.webp" alt="" width={120} height={120} className="size-28 object-contain" />
              <p className="font-display text-lg font-semibold">{view === "liked" ? "No liked games yet." : view === "recent" ? "Nothing played yet." : "No games found."}</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
