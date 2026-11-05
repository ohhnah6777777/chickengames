import { createFileRoute, Link } from "@tanstack/react-router";
import { CommentBox, ReportButton } from "@/components/game-social";
import { useEffect, useMemo, useRef, useState } from "react";
import gamesData from "@/lib/games.json";
import { CATEGORIES, gameInfo, gameUrl, isTrending, pretty, relatedGames, tagsFor, type Game } from "@/lib/game-utils";
import { ArrowLeft, ChevronRight, Clock, Flame, Heart, Info, Maximize, RotateCw, Search, Settings, Shuffle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { useAccount } from "@/components/account-provider";
import { SiteFooter } from "@/components/site-footer";
import { Suggestions } from "@/components/suggestions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kootz Games — Free Browser Games" },
      { name: "description", content: "Kootz Games: over a thousand browser games you can play instantly, no downloads." },
      { property: "og:title", content: "Kootz Games — Free Browser Games" },
      { property: "og:description", content: "Kootz Games: over a thousand browser games you can play instantly, no downloads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const games = gamesData as Game[];
const byId = new Map(games.map((g) => [g.id, g]));
const iconSrc = (g: Game) => (g.src === "gh" ? `/icons-o/${g.id}.webp` : g.src === "gz" ? `/icons-z/${g.id}.webp` : `/icons/${g.id}.webp`);
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
  const [catScrolled, setCatScrolled] = useState(false);
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
  const [warp, setWarp] = useState(false);
  const surprise = () => {
    if (warp) return;
    const pool = games.filter((g) => g.id !== playing);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;
    setWarp(true);
    setTimeout(() => start(pick.id), 380);
    setTimeout(() => setWarp(false), 800);
  };
  const more = useMemo(() => (playing ? relatedGames(playing, recent, games, 46) : []), [playing]);
  const top = TOP.flatMap((id) => byId.get(id) ?? []);
  const base = view === "liked" ? games.filter((g) => likes.includes(g.id)) : view === "recent" ? recent.flatMap((id) => byId.get(id) ?? []) : games;
  const list = base.filter((g) => (!tag || tagsFor(g.id).includes(tag)) && pretty(g.id).toLowerCase().includes(q.toLowerCase()));
  const plain = !q && !tag && view === "all";
  const shown = plain ? [...top, ...list.filter((g) => !TOP.includes(g.id))] : list;

  const tile = (g: Game, i: number, size = "") => (
    <div key={g.id} className={`game-tile group ${size}`}>
      <button type="button" aria-label={pretty(g.id)} title={pretty(g.id)} onClick={() => start(g.id)} className="block h-full w-full bg-card">
        <Icon game={g} />
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
      {!playing && <header className="flex flex-col items-center gap-3 px-4 pb-2 pt-6">
        <button type="button" className="flex items-center gap-2" onClick={() => { setPlaying(null); setView("all"); setQ(""); setTag(null); setPanel(null); }} aria-label="Kootz Games home">
          <img src="/kootz-logo.png" alt="" width={1280} height={640} className="h-12 w-auto object-contain drop-shadow-[0_0_12px_var(--glow)] sm:h-14" />
          <span className="brand-title text-4xl sm:text-5xl" style={{ backgroundImage: "none", filter: "none", textShadow: "0 0 14px var(--glow)" }}><span className="glass-word">Kootz</span> <span className="text-primary [-webkit-text-fill-color:currentColor]">Games</span></span>
        </button>
        <div className="flex w-full max-w-xl items-center gap-2">
          <label className="flex flex-1 items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5">
            <Search className="size-4 opacity-60" />
            <input aria-label="Search games" placeholder="What are you playing today?" value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
          </label>
          <Button variant="secondary" size="icon" className="size-10 rounded-full" aria-label="Search filters" onClick={() => setPanel("search")}><Search className="size-4" /></Button>
          <Button variant="secondary" size="icon" className="size-10 rounded-full" aria-label="Account" onClick={() => setPanel("account")}><User className="size-4" /></Button>
          <Button className="surprise-btn h-10 rounded-full px-4 font-display font-bold" aria-label="Surprise me with a random game" onClick={surprise}><span aria-hidden className="text-lg">🎲</span><span className="max-sm:hidden">Surprise Me!</span></Button>
        </div>
        <div className="relative w-full max-w-[56rem]">
          <nav aria-label="Game categories" className="cat-bar" onScroll={(e) => setCatScrolled(e.currentTarget.scrollLeft > 4)}>
            <button type="button" aria-pressed={!tag} onClick={() => setTag(null)} className={`cat-pill ${!tag ? "is-active" : ""}`}><span aria-hidden>✨</span>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.tag} type="button" aria-pressed={tag === c.tag} title={`${c.label} games`} onClick={() => setTag(tag === c.tag ? null : c.tag)} className={`cat-pill ${tag === c.tag ? "is-active" : ""}`}>
                <span aria-hidden>{c.emoji}</span>{c.label}
              </button>
            ))}
          </nav>
          <span aria-hidden className={`cat-fade cat-fade-left ${catScrolled ? "" : "hidden"}`} />
          <span aria-hidden className="cat-fade" />
        </div>
      </header>}

      {/* Full-page search that drops from the top */}
      <section aria-hidden={panel !== "search"} className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-md transition-transform duration-300 ${panel === "search" ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">Top Games</h2>
            <Button variant="secondary" size="icon" className="rounded-full" aria-label="Close search" onClick={() => setPanel(null)}><ArrowLeft className="size-4 rotate-90" /></Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {top.map((g) => <button key={g.id} type="button" onClick={() => start(g.id)} className="w-28 shrink-0 overflow-hidden rounded-xl bg-card text-left shadow-[0_0_14px_var(--glow)]"><div className="size-28"><Icon game={g} /></div><p className="truncate px-2 py-1.5 text-xs font-bold">{pretty(g.id)}</p></button>)}
          </div>
          <label className="flex items-center gap-3 rounded-lg border-2 border-primary bg-card px-4 py-3 shadow-[0_0_18px_var(--glow)]">
            <input autoFocus={panel === "search"} aria-label="Search games" placeholder="Search Kootz Games" value={q} onChange={(e) => { setQ(e.target.value); setPlaying(null); }} onKeyDown={(e) => e.key === "Enter" && setPanel(null)} className="w-full bg-transparent text-lg outline-none" />
            <Search className="size-5" />
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => <button key={c.tag} type="button" onClick={() => { setTag(tag === c.tag ? null : c.tag); setPlaying(null); }} className={`rounded-md px-4 py-2 text-xs font-extrabold uppercase ${tag === c.tag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c.emoji} {c.label}</button>)}
          </div>
          <div className="grid gap-1.5 rounded-xl bg-card p-3">
            {["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((r) => <div key={r} className="flex justify-center gap-1.5">{r.split("").map((k) => <button key={k} type="button" onClick={() => { setQ(q + k.toLowerCase()); setPlaying(null); }} className="h-10 min-w-0 flex-1 max-w-14 rounded-md bg-secondary font-bold text-secondary-foreground hover:ring-2 hover:ring-primary">{k}</button>)}</div>)}
            <div className="flex gap-1.5"><button type="button" onClick={() => setQ(q + " ")} className="h-10 flex-1 rounded-md bg-secondary text-secondary-foreground">Space</button><button type="button" onClick={() => setQ(q.slice(0, -1))} className="h-10 w-24 rounded-md bg-secondary text-secondary-foreground">Delete</button><button type="button" onClick={() => setPanel(null)} className="h-10 w-24 rounded-md bg-primary font-bold text-primary-foreground">{list.length} games</button></div>
          </div>
        </div>
      </section>

      {/* Yellow slide-out panel */}
      {(panel === "account" || panel === "settings") && <button type="button" aria-label="Close panel" className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[1px]" onClick={() => setPanel(null)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(400px,90vw)] flex-col overflow-y-auto bg-panel text-panel-foreground shadow-2xl transition-transform duration-200 ${panel === "account" || panel === "settings" ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!(panel === "account" || panel === "settings")}>
        <div className="flex items-center gap-3 border-b border-panel-foreground/10 px-4 py-4">
          <button type="button" aria-label="Back" className="flex size-9 items-center justify-center rounded-full bg-secondary/70" onClick={() => setPanel(panel === "settings" ? "account" : null)}><ArrowLeft className="size-4" /></button>
          <h2 className="font-display text-xl font-bold">{panel === "settings" ? "Settings" : "Account"}</h2>
        </div>
        <div className="grid gap-4 p-5">
          {panel === "account" && <>
            <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
              <img src="/mascot-thumbs.webp" alt="" width={56} height={56} className="size-14 object-contain" />
              <div className="min-w-0"><p className="font-bold">{user ? profile?.display_name ?? "Player" : "Local player"}</p><p className="text-xs opacity-70">{user ? "Your likes are saved to your account." : "Local account · not saved to an account"}</p></div>
            </div>
            <Link to="/profile" className="panel-row"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><User className="size-4" /></span><span className="flex-1">Profile</span><ChevronRight className="size-4" /></Link>
            <AccountMenu className="panel-row"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><User className="size-4" /></span><span className="flex-1">{user ? "Account settings" : "Log in / Sign up"}</span><ChevronRight className="size-4" /></AccountMenu>
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
        <main className="mx-auto flex max-w-[1600px] gap-3 px-3 pb-10 pt-3">
          <aside aria-label="More games" className="side-rail">{more.slice(0, 8).map((g, i) => tile(g, i))}</aside>
          <div className="min-w-0 flex-1">
          <div ref={player} className="flex aspect-video min-h-[340px] flex-col overflow-hidden rounded-2xl bg-card shadow-xl max-sm:h-[65dvh]">
            <iframe key={`${playing}-${reload}`} src={gameUrl(playingGame)} title={pretty(playing)} className="min-h-0 w-full flex-1 border-0" allow="fullscreen; autoplay; gamepad" allowFullScreen />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-panel px-4 py-3 text-panel-foreground">
            <Button variant="ghost" size="icon" aria-label="Back to games" onClick={() => setPlaying(null)}><ArrowLeft /></Button>
            <h1 className="mr-auto min-w-0 break-words font-display text-xl font-bold">{pretty(playing)}</h1>
            <Button variant="ghost" size="icon" aria-label={likes.includes(playing) ? "Unlike game" : "Like game"} onClick={() => toggle(playing)}><Heart fill={likes.includes(playing) ? "currentColor" : "none"} /></Button>
            <ReportButton gameId={playing} />
            <Button variant="ghost" size="icon" aria-label="Surprise me with a random game" onClick={surprise}><span aria-hidden className="text-lg">🎲</span></Button>
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
          <CommentBox gameId={playing} />
          <h2 className="mb-2 mt-6 font-display text-lg font-bold">More games</h2>
          <div className="game-grid">{more.slice(16).map((g, i) => tile(g, i))}</div>
          </div>
          <aside aria-label="More games" className="side-rail">{more.slice(8, 16).map((g, i) => tile(g, i))}</aside>
        </main>
      ) : (
        <main>
          {plain && <Suggestions recent={recent} onPlay={start} />}
          {!plain && <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:pl-[130px]">
            <h1 className="font-display text-xl font-bold">{view === "liked" ? "Liked games" : view === "recent" ? "Recently played" : q ? `Results for "${q}"` : `${tag} games`}</h1>
            <Button size="sm" className="rounded-full" onClick={() => { setView("all"); setQ(""); setTag(null); }}>Show all</Button>
          </div>}
          {list.length ? (
            <div className="mosaic">
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
      {warp && <div aria-hidden className="warp-overlay"><span>🎲</span></div>}
      <SiteFooter count={games.length} />
    </div>
  );
}
