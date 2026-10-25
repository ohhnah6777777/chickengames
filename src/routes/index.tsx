import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gamesData from "@/lib/games.json";
import { ArrowLeft, Heart, Maximize, RotateCw, Shuffle, Search, Grid2X2, Puzzle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountMenu } from '@/components/account-menu';
import { useAccount } from '@/components/account-provider';

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
  const { user, profile, saveProfile } = useAccount();
  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem("cg-likes") || "[]"); if (Array.isArray(stored)) setLocalLikes(stored.filter(x => typeof x === 'string')); } catch { /* ignore */ }
  }, []);
  const likes = user ? profile?.liked_games ?? [] : localLikes;
  const toggle = (id: string) => {
    const next = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id];
    setError('');
    if (user) { void saveProfile({ liked_games: next }).catch(() => setError('Could not save your like. Please try again.')); }
    else { setLocalLikes(next); try { localStorage.setItem('cg-likes', JSON.stringify(next)); } catch { setError('Your browser could not save this like.'); } }
  };
  return { likes, toggle, error };
}

function Index() {
  const [q, setQ] = useState('');
  const [view, setView] = useState<'home' | 'all' | 'liked' | 'puzzle' | 'arcade'>('home');
  const [playing, setPlaying] = useState<string | null>(null);
  const { likes, toggle, error } = useLikes();
  const player = useRef<HTMLDivElement>(null);
  const [reload, setReload] = useState(0);
  const [playerError, setPlayerError] = useState('');
  const puzzle = games.filter(g => /2048|tetris|chess|sudoku|word|minesweep|connect|solitaire|mahjong|puzzle|hextris/.test(g.id));
  const arcade = games.filter(g => /slope|run|jump|dash|flappy|snake|pacman|ball|retro|doodle/.test(g.id));
  const picks = ['slope','2048','minecraft','retro-bowl','run-3','cookie-clicker','basketball-stars','subway-surfers','geometry-dash','bitlife','flappy-bird','tetris'].flatMap(id => games.filter(g => g.id === id));
  const start = (id: string) => { setPlaying(id); setPlayerError(''); };
  const tiles = (items: Game[]) => <div className="game-grid">{items.map(g => <div key={g.id} className="game-tile group">
    <Button variant="ghost" aria-label={pretty(g.id)} title={pretty(g.id)} onClick={() => start(g.id)} className="relative block h-auto w-full overflow-hidden rounded-md p-0">
      <div className="aspect-square w-full bg-card"><Icon game={g} /></div><span className="tile-name truncate">{pretty(g.id)}</span>
    </Button>
    <Button variant="secondary" size="icon" aria-label={`${likes.includes(g.id) ? 'Unlike' : 'Like'} ${pretty(g.id)}`} title="Like game" onClick={() => toggle(g.id)} className="absolute right-1 top-1 size-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"><Heart className="size-3" fill={likes.includes(g.id) ? 'currentColor' : 'none'} /></Button>
  </div>)}</div>;
  const shelf = (title: string, items: Game[], target: typeof view) => <section className="mb-6"><div className="mb-2 flex items-center gap-3"><h2 className="text-sm font-bold">{title}</h2><Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => setView(target)}>View more ›</Button></div>{tiles(items)}</section>;
  const base = view === 'liked' ? games.filter(g => likes.includes(g.id)) : view === 'puzzle' ? puzzle : view === 'arcade' ? arcade : games;
  const list = base.filter(g => pretty(g.id).toLowerCase().includes(q.toLowerCase()));
  return <>
    <header className="border-b border-border bg-background"><div className="library-shell flex flex-wrap items-center gap-3 py-3">
      {playing && <Button variant="ghost" size="icon" aria-label="Back to games" title="Back to games" onClick={() => setPlaying(null)}><ArrowLeft /></Button>}
      <Button variant="ghost" className="mr-auto h-auto gap-2 p-0" onClick={() => { setPlaying(null); setView('home'); setQ(''); }}><img src="/favicon.png" alt="" width={36} height={36} className="size-9 [image-rendering:pixelated]" /><span className="text-lg font-black text-primary">CHICKEN GAMES</span></Button>
      <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 max-sm:order-last max-sm:w-full"><Search className="size-4 shrink-0 text-muted-foreground" /><input aria-label="Search games" placeholder="Search games…" value={q} onChange={e => { setQ(e.target.value); setPlaying(null); }} className="w-44 min-w-0 bg-transparent text-xs outline-none max-sm:w-full" /></div>
      <Button variant="ghost" size="icon" aria-label="Liked games" title="Liked games" onClick={() => { setPlaying(null); setView('liked'); }}><Heart /></Button><AccountMenu />
    </div></header>
    <nav className="border-b border-border bg-card"><div className="library-shell flex flex-wrap items-center gap-1 py-1">
      {([{id:'home', label:'Home', icon:Grid2X2}, {id:'all',label:'All games',icon:Grid2X2}, {id:'puzzle',label:'Puzzle',icon:Puzzle}, {id:'arcade',label:'Arcade',icon:Zap}] as const).map(item => <Button key={item.id} variant="ghost" className={`h-9 rounded-none px-3 text-xs ${view === item.id ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => { setView(item.id); setPlaying(null); setQ(''); }}><item.icon className="size-4" />{item.label}</Button>)}
      <Button variant="ghost" className="h-9 px-3 text-xs" onClick={() => start(games[Math.floor(Math.random()*games.length)]?.id ?? '2048')}><Shuffle className="size-4 text-accent" />Random</Button>
    </div></nav>
    <main className="library-shell py-5">
      {error && <p role="status" className="mb-3 text-sm text-primary">{error}</p>}
      {playing ? <>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_190px]">
          <section className="min-w-0"><div ref={player} className="flex aspect-video min-h-[340px] flex-col overflow-hidden rounded-md bg-card max-sm:h-[65dvh]">
            <iframe key={`${playing}-${reload}`} src={`/g/${playing}/index.html`} title={pretty(playing)} className="min-h-0 w-full flex-1 border-0" allow="fullscreen; autoplay; gamepad" allowFullScreen />
          </div><div className="flex flex-wrap items-center gap-2 bg-card px-3 py-3"><h1 className="mr-auto min-w-0 break-words text-lg font-bold">{pretty(playing)}</h1><Button variant="ghost" size="icon" aria-label={likes.includes(playing) ? 'Unlike game' : 'Like game'} title="Like game" onClick={() => toggle(playing)}><Heart fill={likes.includes(playing) ? 'currentColor' : 'none'} /></Button><Button variant="ghost" size="icon" aria-label="Reload game" title="Reload game" onClick={() => setReload(n => n+1)}><RotateCw /></Button><Button variant="secondary" size="icon" aria-label="Fullscreen" title="Fullscreen" onClick={() => { void player.current?.requestFullscreen().catch(() => setPlayerError('Fullscreen is not available in this browser.')); }}><Maximize /></Button></div>{playerError && <p role="status">{playerError}</p>}</section>
          <aside className="hidden lg:block"><h2 className="mb-2 text-sm font-bold">More games</h2><div className="grid grid-cols-2 gap-2">{picks.filter(g => g.id !== playing).slice(0,12).map(g => <Button key={g.id} variant="ghost" title={pretty(g.id)} aria-label={pretty(g.id)} className="h-auto overflow-hidden rounded-md p-0" onClick={() => start(g.id)}><div className="aspect-square w-full"><Icon game={g} /></div></Button>)}</div></aside>
        </div><div className="mt-6">{shelf('More games',games.filter(g => g.id !== playing).slice(0,24),'all')}</div>
      </> : view === 'home' && !q ? <>
        {shelf('Chicken picks',picks,'all')}
        {shelf('Arcade games',arcade.slice(0,24),'arcade')}
        {shelf('Puzzle games',puzzle.slice(0,24),'puzzle')}
        {shelf('All games',games,'all')}
      </> : <section><h1 className="mb-3 text-base font-bold">{q ? 'Search results' : view === 'liked' ? `Liked games (${likes.length})` : view === 'puzzle' ? 'Puzzle games' : view === 'arcade' ? 'Arcade games' : 'All games'}</h1>{list.length ? tiles(list) : <p className="text-sm text-muted-foreground">{view === 'liked' ? 'No liked games yet.' : 'No games found.'}</p>}</section>}
    </main>
    <footer className="library-shell border-t border-border py-5 text-xs text-muted-foreground">Chicken Games</footer>
  </>;
}
