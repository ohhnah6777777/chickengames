# Blues Games: rename, new look, more games

## 1. Rename to Blues Games
- Change the site name, page titles, descriptions and header to "Blues Games".
- Swap the chicken favicon and chicken background for a blue game-controller style icon. (Say if you want to keep the chicken.)

## 2. New look (matching your screenshots)
- **Blue page** filled edge to edge with a dense grid of rounded game tiles, no shelves or headings.
- **Mixed tile sizes**: some popular games show as big 2x2 or 3x3 tiles scattered through the grid, like Galatrix and the Minecraft tile.
- **Small floating logo card** in the top-left corner with the Blues Games logo and two buttons: Account and Search.
- **Yellow slide-out panel** on the left (the rest of the page dims):
  - **Search panel**: back arrow, "What are you playing today?" box, tag pills (Sports, Idle, Puzzle, Racing, Action...), and a "Top Games" row. Results fill the grid as you type.
  - **Account panel**: big rounded rows for Profile (local account notice + Log in / Sign up), Liked, Recently played, and Settings. No Discord or Links for now.
- Playing a game keeps the current player (fullscreen, like, reload, saves, info strip), restyled in blue and yellow.

## 3. More games from the genizymath collection
- That folder has 881 games. I'll add only games whose names don't match anything already on the site (comparing names with spaces, dashes and casing ignored).
- Each game loads through a new pass-through from that GitHub repo, the same way the current GitHub games do, with its icon if the folder has one.
- Very large games that won't load reliably get skipped.
- The duplicate check test gets extended to cover the new games.

## Technical details
- Build script: GitHub tree API for `games/`, normalize ids (`lowercase`, strip non-alphanumerics), drop matches against existing `games.json`, find each folder's `index.html` and icon image, download icons to `public/icons-z/*.webp`. Entries get `src: "gz"`.
- New proxy route `src/routes/z.$.ts` (raw.githubusercontent.com/ohhnah6777777/genizymath.github.io/main/games/...) with MIME by extension; `gameUrl` / `play.$.ts` accept `gz`.
- `src/routes/index.tsx` rewritten around a CSS grid with `grid-auto-flow: dense` and featured span classes; Sheet-style left panel for Search/Account; theme tokens in `src/styles.css` moved to blue + yellow.
- Update the saved style memory (chicken styling becomes Blues blue/yellow).
