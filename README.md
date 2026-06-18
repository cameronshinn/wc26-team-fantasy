# Group Stage of Death — WC26 Fantasy Dashboard

[![Update WC26 Results](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-results.yml/badge.svg?event=schedule)](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-results.yml)
[![Update Elo Ratings](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-elo.yml/badge.svg?event=schedule)](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-elo.yml)
[![Results Updated](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/cameronshinn/wc26-team-fantasy/main/last-update.json&cacheSeconds=1800)](https://github.com/cameronshinn/wc26-team-fantasy/commits/main/results.js)

A zero-backend dashboard that tracks your World Cup 2026 draft and tallies scores under your house rules
(3 / group win · 1 / group draw · 5 / advance · 8 / each knockout win · 5 / Golden Boot · 3 / third place).

## Tabs
- **Standings** — leaderboard, win probability chart (Monte Carlo), and points-over-time chart.
- **Groups** — group tables with live R32 advancement odds; hover/tap a card to see a team's odds history.
- **Knockout** — bracket view and round-by-round results.
- **Matches** — commissioner mode for entering scores, exporting/importing `results.js`.
- **About** — simulation methodology, scoring rules, and Elo ratings table. Hover a team to see its full Elo history sparkline.

## Files
- `index.html` — the whole app (UI + simulation logic + the draft).
- `results.js` — live scores, auto-regenerated during the tournament and committed back to the repo.
- `elo-history.json` — daily Elo rating snapshots for all 48 teams, used by the Monte Carlo simulation.
- `scripts/update-results.js` — fetches match results from football-data.org and writes `results.js`.
- `scripts/update-elo.js` — fetches the latest Elo ratings from eloratings.net and appends to `elo-history.json`.
- `scripts/gen-elo-history-test.js` — generates a full synthetic `elo-history.json` from a completed results file, for testing.

## Deploy to GitHub Pages (about 2 minutes)
1. Create a repo, e.g. `wc26-pool`.
2. Drop `index.html`, `results.js`, and `elo-history.json` into the repo root and push.
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `/root`, save.
4. Your site is live at `https://<your-username>.github.io/wc26-pool/`.

(If you'd rather it live at `https://<your-username>.github.io/`, name the repo `<your-username>.github.io`.)

## Automation
Two GitHub Actions workflows keep the site current with no manual intervention during the tournament.

### Live scores (`update-results.yml`)
Runs every 30 minutes (Jun 11 – Jul 19). When a match finishes, the next scheduled run fetches the result,
regenerates `results.js`, and commits it — GitHub Pages redeploys automatically.

**One-time setup:**
1. Get a free API key at [football-data.org/client/register](https://www.football-data.org/client/register).
2. Add it as a repository secret: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FOOTBALL_API_KEY`
   - Value: your key
3. That's it. You can also trigger a manual run any time from the **Actions** tab.

**What's automated vs. manual:**
- Group stage scores, knockout results, and 3rd-place game — **automatic**.
- Golden Boot — **manual** (set it in Commissioner Mode once the top scorer is known).

### Elo ratings (`update-elo.yml`)
Runs daily at 07:00 UTC (midnight PST). Fetches the latest team Elo ratings from
[eloratings.net](https://www.eloratings.net/), appends a new dated snapshot to `elo-history.json`, and commits it.
The simulation uses the snapshot current on each matchday, so early-tournament odds reflect what the model
knew at that time. The About tab shows each team's Elo over time with a hover sparkline.

## Manual score entry (fallback)
If you ever need to override or correct a result, use the **Matches** tab on the site:
type in scores, set the Golden Boot team, then click **Export results.js** and commit the downloaded file.
Any manually set Golden Boot is preserved across automatic updates.

The **Copy** button copies the same content to your clipboard if you'd rather paste into GitHub's editor.

## Notes
- Advancement points award automatically: top two of each group clinch as soon as that group finishes;
  the eight best third-place spots resolve once all 12 groups are done.
- All 48 teams are drafted (12 each across Luke, Grant, Cam, and Peter).
- Host nations (USA, Canada, Mexico) receive a +100 Elo bonus in every simulation run.
- Win probability is computed from 10,000 Monte Carlo simulations per matchday snapshot; the live leaderboard
  odds use 20,000 runs.
