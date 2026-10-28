import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, LogOut, Save } from "lucide-react";
import gamesData from "@/lib/games.json";
import { pretty, type Game } from "@/lib/game-utils";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/account-provider";
import { AccountMenu } from "@/components/account-menu";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Blues Games" },
      { name: "description", content: "Your Blues Games profile: name, liked games and recently played." },
      { property: "og:title", content: "Your Profile — Blues Games" },
      { property: "og:description", content: "Your Blues Games profile: name, liked games and recently played." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const games = gamesData as Game[];
const byId = new Map(games.map(g => [g.id, g]));
const iconSrc = (g: Game) => (g.src === "gh" ? `/icons-o/${g.id}.webp` : g.src === "gz" ? `/icons-z/${g.id}.webp` : `/icons/${g.id}.webp`);

function readList(key: string): string[] {
  try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v.filter(x => typeof x === "string") : []; } catch { return []; }
}

function Shelf({ title, ids }: { title: string; ids: string[] }) {
  const items = ids.flatMap(id => byId.get(id) ?? []);
  return <section className="rounded-2xl bg-card p-4">
    <h2 className="mb-3 font-display text-lg font-bold">{title} ({items.length})</h2>
    {items.length ? <div className="game-grid">{items.map(g => <div key={g.id} className="game-tile aspect-square" title={pretty(g.id)}>
      {g.icon ? <img src={iconSrc(g)} alt={pretty(g.id)} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-2 text-center text-xs font-bold">{pretty(g.id)}</div>}
    </div>)}</div> : <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
  </section>;
}

function ProfilePage() {
  const { user, profile, saveProfile, signOut, ready } = useAccount();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { setLocalLikes(readList("cg-likes")); setRecent(readList("cg-recent")); }, []);
  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile?.display_name]);
  const likes = user ? profile?.liked_games ?? [] : localLikes;

  return <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6">
    <Button asChild variant="secondary" className="w-fit rounded-full"><Link to="/"><ArrowLeft />Back to games</Link></Button>
    <section className="flex flex-wrap items-center gap-4 rounded-2xl bg-panel p-5 text-panel-foreground">
      <img src="/mascot-thumbs.webp" alt="" width={96} height={96} className="size-24 object-contain" />
      <div className="min-w-0 flex-1">
        <h1 className="break-words font-display text-3xl font-bold">{user ? profile?.display_name || "Player" : "Local player"}</h1>
        <p className="break-all text-sm opacity-80">{user ? user.email : "Local account · your likes and saves stay in this browser only."}</p>
        <p className="mt-1 flex items-center gap-1 text-sm font-bold"><Heart className="size-4" />{likes.length} liked · {recent.length} played recently</p>
      </div>
      {!user && ready && <AccountMenu className="rounded-full bg-card px-5 py-2.5 text-sm font-bold text-foreground">Log in / Sign up</AccountMenu>}
      {user && <Button variant="outline" className="rounded-full bg-secondary text-secondary-foreground" onClick={() => void signOut()}><LogOut />Sign out</Button>}
    </section>
    {user && <form className="flex flex-wrap items-end gap-2 rounded-2xl bg-card p-4" onSubmit={e => { e.preventDefault(); setMsg(""); void saveProfile({ display_name: name.trim() || "Player" }).then(() => setMsg("Saved!")).catch(() => setMsg("Could not save. Please try again.")); }}>
      <label className="grid min-w-0 flex-1 gap-1 text-sm font-bold">Display name<input className="account-input" value={name} maxLength={50} required onChange={e => setName(e.target.value)} /></label>
      <Button type="submit"><Save />Save</Button>
      {msg && <p role="status" className="w-full text-sm">{msg}</p>}
    </form>}
    <Shelf title="Liked games" ids={likes} />
    <Shelf title="Recently played" ids={recent} />
  </main>;
}
