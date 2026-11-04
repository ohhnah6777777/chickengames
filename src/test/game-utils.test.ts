import { describe, expect, it } from "vitest";
import { CATEGORIES, gameUrl, isTrending, pretty, tagsFor, TRENDING, type Game } from "@/lib/game-utils";
import gamesData from "@/lib/games.json";

describe("game utils", () => {
  it("pretty-prints ids", () => {
    expect(pretty("run-3")).toBe("Run 3");
    expect(pretty("moto_x3m")).toBe("Moto X3m");
  });

  it("routes gh games through the offline proxy and 3kh0 games through the gitlab proxy", () => {
    const gh: Game = { id: "slope-3", icon: true, src: "gh", file: "slope-3.html" };
    expect(gameUrl(gh)).toBe("/play/gh/slope-3.html");
    expect(gameUrl({ id: "2048", icon: true })).toBe("/play/3kh0/2048/index.html");
  });

  it("assigns at least one tag to every game", () => {
    expect(tagsFor("chess")).toContain("Puzzle");
    expect(tagsFor("moto-x3m")).toContain("Racing");
    expect(tagsFor("some-unknown-game")).toEqual(["Arcade"]);
  });

  it("marks only curated games as trending", () => {
    expect(isTrending("slope")).toBe(true);
    expect(isTrending("not-a-game")).toBe(false);
    expect(TRENDING.length).toBeGreaterThanOrEqual(15);
  });
});

describe("genizymath games", () => {
  it("route through the gz save wrapper", () => {
    expect(gameUrl({ id: "x", icon: false, src: "gz", file: "653-fix2.html" })).toBe("/play/gz/653-fix2.html");
  });
});

describe("category pills", () => {
  const games = gamesData as { id: string }[];

  it("tags shooters and 2-player games", () => {
    expect(tagsFor("time-shooter-3-swat")).toContain("Shooter");
    expect(tagsFor("getaway-shootout")).toContain("Shooter");
    expect(tagsFor("fireboy-and-watergirl")).toContain("2-Player");
    expect(tagsFor("1v1lol")).toContain("2-Player");
    expect(tagsFor("slope-2-player")).toContain("2-Player");
  });

  it("does not tag look-alike names as 2-player", () => {
    expect(tagsFor("papas-scooperia")).not.toContain("2-Player");
    expect(tagsFor("chess")).not.toContain("2-Player");
  });

  it("every pill has games to show", () => {
    for (const c of CATEGORIES) {
      const n = games.filter((g) => tagsFor(g.id).includes(c.tag)).length;
      expect(n, `${c.tag} should have at least 5 games`).toBeGreaterThanOrEqual(5);
    }
  });

  it("uses the requested emoji labels", () => {
    const byTag = Object.fromEntries(CATEGORIES.map((c) => [c.tag, c.emoji]));
    expect(byTag["Arcade"]).toBe("🕹️");
    expect(byTag["Racing"]).toBe("🏎️");
    expect(byTag["Puzzle"]).toBe("🧩");
    expect(byTag["Shooter"]).toBe("🔫");
    expect(byTag["2-Player"]).toBe("👥");
  });
});
