import { describe, expect, it } from "vitest";
import games from "@/lib/games.json";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

describe("games list", () => {
  it("has no duplicate game names", () => {
    const names = games.map((g) => normalize(g.id));
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});
