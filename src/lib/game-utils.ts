export type Game = { id: string; icon: boolean; src?: "gh" | "gz"; file?: string };

export const pretty = (s: string) =>
  s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const TAG_RULES: [RegExp, string][] = [
  [/2048|tetris|chess|sudoku|word|minesweep|connect|solitaire|mahjong|puzzle|hextris|bloxorz|impossible-quiz|little-alchemy|trivia|wordle|stacktris|trap-the-cat/i, "Puzzle"],
  [/slope|run|jump|dash|flappy|snake|pacman|pac-man|ball|retro|doodle|crossy|helix|stack|tunnel-rush|space-waves|tap-road/i, "Arcade"],
  [/moto|car|drift|racing|racers|drive|rider|traffic|highway|kart|bike|wheelie|polytrack|stunt/i, "Racing"],
  [/soccer|football|basket|baseball|tennis|golf|pool|8-ball|volley|wrestl|boxing|ping-pong|table-tennis|bowl/i, "Sports"],
  [/shooter|shootout|gun|war|battle|combat|zombie|tanks|arena|sniper|assassin|ninja|fighter|mercenary/i, "Action"],
  [/clicker|idle|incremental|miner|mart|factory/i, "Idle"],
  [/fnaf|granny|horror|scary|backrooms|baldi/i, "Horror"],
  [/minecraft|block|craft|sandbox|terraria|survival/i, "Sandbox"],
  [/papa-|jacksmith|pou|duck-life|learn-to-fly|snail-bob|wheely|cut-the-rope|angry-birds|bad-piggies/i, "Strategy"],
  [/io\b|\.io|agar|hole-io|paper-io|snowball|yohoho|territorial|state-io|cleanup-io|ducklings/i, "IO"],
  [/shoot|gun|sniper|tanks?|arena|battle[-_]royale|zombie|archer|bow|cannon|bomb|laser|flame|swat|quake/i, "Shooter"],
  [/2[-_ ]?player|two[-_ ]?player|\bco[-_]?op\b|multiplayer|1v1|\bduo\b|duel|fireboy|watergirl|joust|ping[-_ ]?pong|bomberman|volley-random|basket-random|soccer-random|sports-heads/i, "2-Player"],
];

// Home-page category pills: emoji + label, mapped to the tag they filter by.
export const CATEGORIES: { tag: string; emoji: string; label: string }[] = [
  { tag: "Arcade", emoji: "🕹️", label: "Arcade" },
  { tag: "Racing", emoji: "🏎️", label: "Racing" },
  { tag: "Puzzle", emoji: "🧩", label: "Puzzle" },
  { tag: "Shooter", emoji: "🔫", label: "Shooter" },
  { tag: "2-Player", emoji: "👥", label: "2-Player" },
  { tag: "Sports", emoji: "⚽", label: "Sports" },
  { tag: "Idle", emoji: "🪙", label: "Idle" },
  { tag: "Horror", emoji: "👻", label: "Horror" },
  { tag: "Sandbox", emoji: "🧱", label: "Sandbox" },
  { tag: "Strategy", emoji: "🧠", label: "Strategy" },
  { tag: "IO", emoji: "🌐", label: "IO" },
];


export function tagsFor(id: string): string[] {
  const tags = TAG_RULES.filter(([re]) => re.test(id)).map(([, t]) => t);
  return tags.length ? tags.slice(0, 3) : ["Arcade"];
}

// Curated "trending" picks — editorial, not measured popularity.
export const TRENDING = [
  "slope", "run-3", "1v1-lol", "ovo", "subway-surfers", "geometry-dash",
  "retro-bowl", "basketball-stars", "cookie-clicker", "drive-mad",
  "moto-x3m", "stickman-hook", "tunnel-rush", "bitlife", "among-us",
  "vex-7", "eggy-car", "smash-karts", "temple-run-2", "getaway-shootout",
];

export const isTrending = (id: string) => TRENDING.includes(id);

export function gameUrl(game: Game): string {
  if (game.src === "gh" || game.src === "gz") return `/play/${game.src}/${game.file}`;
  return `/play/3kh0/${game.id}/index.html`;
}

export function gameInfo(game: Game): string {
  const tags = tagsFor(game.id).join(", ").toLowerCase();
  return `${pretty(game.id)} is a free ${tags} game you can play right in your browser — no downloads, no installs. Your progress is saved automatically on this device, so you can pick up where you left off.`;
}
