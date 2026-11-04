import { describe, expect, it } from "vitest";
import games from "@/lib/games.json";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

describe("games list", () => {
  it("has no duplicate game names", () => {
    const names = games.map((g) => normalize(g.id));
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  // Pixel-art games are intentional retro artwork, never a quality defect.
  const PIXEL_ART = [
    "people-playground", "melon-playground", "famidash", "sandstone",
    "ice-dodo", "the-final-earth", "worst-time-simulator", "cat-connection",
  ];
  it("keeps pixel-art games in the library", () => {
    const ids = new Set(games.map((g) => g.id));
    for (const id of PIXEL_ART) expect(ids.has(id), `${id} missing`).toBe(true);
  });

  it("never lists a pixel-art game without its picture", () => {
    const byId = new Map(games.map((g) => [g.id, g]));
    for (const id of PIXEL_ART) expect(byId.get(id)?.icon, `${id} icon`).toBe(true);
  });
});
