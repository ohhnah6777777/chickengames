import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gamesData from "@/lib/games.json";
import { ArrowLeft, Heart, Maximize, RotateCw, Shuffle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountMenu } from '@/components/account-menu';
import { useAccount } from '@/components/account-provider';
import { ChickenBackground } from '@/components/chicken-background';
import { LuminLibrary } from '@/components/lumin-library';
import { canAccessSource } from '@/lib/game-access';

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

const btn = "rounded-md border-2 border-foreground px-3 py-1.5 text-sm font-bold transition hover:-translate-y-0.5";

function Index() {
  const { user, profile } = useAccount();
  const [source, setSource] = useState<'3kh0' | 'lumin'>('3kh0');
  const [q, setQ] = useState("");
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const { likes, toggle, error } = useLikes();
  const frame = useRef<HTMLIFrameElement>(null);
  const player = useRef<HTMLDivElement>(null);
  const [reload, setReload] = useState(0);
  const [playerError, setPlayerError] = useState('');
  const luminAvailable = canAccessSource('lumin', user?.id ?? null) && Boolean(profile?.lumin_enabled);
  const activeSource = luminAvailable ? source : '3kh0';
  const fullscreen = async () => {
    try { await player.current?.requestFullscreen(); } catch { setPlayerError('Fullscreen is not available in this browser.'); }
  };

  const list = games.filter((g) => g.id.toLowerCase().includes(q.toLowerCase()) && (!onlyLiked || likes.includes(g.id)));

  if (playing) {
    const liked = likes.includes(playing);
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-5">
        <ChickenBackground />
        <header className="mb-5 flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Back to games" title="Back to games" onClick={() => setPlaying(null)}><ArrowLeft /></Button><p className="mr-auto font-bold text-primary">CHICKEN GAMES</p><AccountMenu /></header>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
          <section className="min-w-0">
            <div ref={player} className="flex h-[65dvh] min-h-[320px] flex-col overflow-hidden rounded-lg border-2 border-border bg-card sm:h-auto sm:aspect-video">
              <iframe key={`${playing}-${reload}`} ref={frame} src={`/g/${playing}/index.html`} title={pretty(playing)} className="min-h-0 w-full flex-1 border-0" allow="fullscreen; autoplay; gamepad" allowFullScreen />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-border bg-card px-3 py-3"><h1 className="mr-auto min-w-0 break-words text-lg font-bold">{pretty(playing)}</h1><Button variant={liked ? 'default' : 'outline'} size="icon" aria-label={liked ? 'Unlike game' : 'Like game'} title={liked ? 'Unlike game' : 'Like game'} onClick={() => toggle(playing)}><Heart fill={liked ? 'currentColor' : 'none'} /></Button><Button variant="outline" size="icon" aria-label="Reload game" title="Reload game" onClick={() => setReload(n => n + 1)}><RotateCw /></Button><Button variant="secondary" size="icon" aria-label="Fullscreen" title="Fullscreen" onClick={() => void fullscreen()}><Maximize /></Button></div>
            {(error || playerError) && <p role="status" className="bg-card p-2 text-sm text-primary">{error || playerError}</p>}
            <h2 className="my-5 font-bold">More games</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{games.filter(g => g.id !== playing).slice(0, 18).map(g => <Button key={g.id} variant="ghost" className="block h-auto p-0 text-left" onClick={() => { setPlaying(g.id); setPlayerError(''); }}><div className="aspect-square overflow-hidden rounded-lg border-2 border-border"><Icon game={g} /></div><p className="mt-1 truncate text-xs">{pretty(g.id)}</p></Button>)}</div>
          </section>
          <aside className="hidden lg:block"><h2 className="mb-3 font-bold">Liked games</h2><div className="grid gap-3">{games.filter(g => likes.includes(g.id)).slice(0, 6).map(g => <Button key={g.id} variant="ghost" className="h-auto flex-col p-0" onClick={() => setPlaying(g.id)}><div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-border"><Icon game={g} /></div><span className="max-w-full truncate text-xs">{pretty(g.id)}</span></Button>)}</div>{likes.length === 0 && <p className="bg-card p-2 text-sm text-muted-foreground">No liked games yet.</p>}</aside>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <ChickenBackground />
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3"><h1 className="flex min-w-0 items-center gap-3 font-display text-lg text-primary sm:text-3xl">
          <img src="/favicon.png" alt="" width={48} height={48} className="h-12 w-12 [image-rendering:pixelated]" />
          CHICKEN GAMES
        </h1><AccountMenu /></div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${games.length} games…`}
          className="w-full rounded-md border-2 border-input bg-card px-4 py-2 outline-none focus:ring-2 focus:ring-ring sm:w-72" />
      </header>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button onClick={() => { setOnlyLiked(false); setSource('3kh0'); }} className={btn} variant={!onlyLiked && activeSource === '3kh0' ? 'default' : 'outline'}>3kh0 games</Button>
        <Button onClick={() => { setOnlyLiked(true); setSource('3kh0'); }} className={btn} variant={onlyLiked ? 'default' : 'outline'}><Heart />Liked ({likes.length})</Button>
        <Button onClick={() => setPlaying(games[Math.floor(Math.random() * games.length)]?.id ?? null)} className={btn} variant="secondary"><Shuffle />Random game</Button>
        <Button onClick={() => setSource('lumin')} disabled={!luminAvailable} title={user ? 'Enable LuminSDK in account settings' : 'Create an account to unlock LuminSDK'} className={btn} variant={activeSource === 'lumin' ? 'default' : 'outline'}>{!luminAvailable && <Lock />}LuminSDK</Button>
      </div>
      {error && <p role="status" className="mb-3 bg-card p-2 text-sm text-primary">{error}</p>}
      {activeSource === 'lumin' ? <LuminLibrary /> : <>
      {list.length === 0 && <p className="text-muted-foreground">{onlyLiked ? "No liked games yet — tap ♡ on any game." : "No games found."}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((g) => (
          <div key={g.id} className="group relative">
            <Button variant="ghost" onClick={() => setPlaying(g.id)} className="block h-auto w-full whitespace-normal p-0 text-left">
              <div className="aspect-square overflow-hidden rounded-lg border-2 border-border bg-card transition group-hover:-translate-y-1 group-hover:border-primary">
                <Icon game={g} />
              </div>
              <p className="mt-2 truncate text-sm text-muted-foreground group-hover:text-foreground">{pretty(g.id)}</p>
            </Button>
            <Button variant="outline" size="icon" onClick={() => toggle(g.id)} aria-label={likes.includes(g.id) ? `Unlike ${pretty(g.id)}` : `Like ${pretty(g.id)}`} title="Like game"
              className="absolute right-2 top-2 size-8 rounded-full bg-card text-primary shadow"><Heart fill={likes.includes(g.id) ? 'currentColor' : 'none'} /></Button>
          </div>
        ))}
      </div>
      </>}
    </main>
  );
}
