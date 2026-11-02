import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkle } from "lucide-react";
import gamesData from "@/lib/games.json";
import { pretty, type Game } from "@/lib/game-utils";
import { recommendGames } from "@/lib/recommend.functions";

const byId = new Map((gamesData as Game[]).map((g) => [g.id, g]));
const iconSrc = (g: Game) => (g.src === "gh" ? `/icons-o/${g.id}.webp` : g.src === "gz" ? `/icons-z/${g.id}.webp` : `/icons/${g.id}.webp`);

export function Suggestions({ recent, onPlay }: { recent: string[]; onPlay: (id: string) => void }) {
  const fn = useServerFn(recommendGames);
  const [picks, setPicks] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const keyList = recent.slice(0, 6).join(",");

  useEffect(() => {
    if (!keyList) return;
    const cacheKey = `cg-sugg:${keyList}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setPicks(JSON.parse(cached)); setState("done"); return; }
    let live = true;
    setState("loading"); setError("");
    fn({ data: { recent: keyList.split(",") } })
      .then((r) => { if (!live) return; setPicks(r.ids); setError(r.error ?? ""); setState("done"); if (r.ids.length) sessionStorage.setItem(cacheKey, JSON.stringify(r.ids)); })
      .catch(() => { if (live) { setError("Couldn't load suggestions."); setState("done"); } });
    return () => { live = false; };
  }, [keyList, fn]);

  if (!keyList) return null;
  const games = picks.flatMap((id) => byId.get(id) ?? []);
  return (
    <section className="px-4 pt-4" aria-label="Suggested for you">
      <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold"><Sparkle className="size-4 text-primary" />Picked for you</h2>
      {state === "loading" && <p className="text-sm text-muted-foreground">Finding games you'll like…</p>}
      {error && <p className="text-sm text-muted-foreground">{error}</p>}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {games.map((g) => (
          <button key={g.id} type="button" title={pretty(g.id)} onClick={() => onPlay(g.id)} className="game-tile size-24 shrink-0 bg-card">
            {g.icon ? <img src={iconSrc(g)} alt={pretty(g.id)} loading="lazy" className="h-full w-full object-cover" /> : <span className="p-2 text-xs font-semibold">{pretty(g.id)}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
