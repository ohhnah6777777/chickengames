import { describe, expect, it } from "vitest";
import { gameUrl, isTrending, pretty, tagsFor, TRENDING, type Game } from "@/lib/game-utils";

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
