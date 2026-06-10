# Group Stage of Death — WC26 Fantasy Dashboard

[![Update WC26 Results](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-results.yml/badge.svg?event=schedule)](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-results.yml)
[![Update Elo Ratings](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-elo.yml/badge.svg?event=schedule)](https://github.com/cameronshinn/wc26-team-fantasy/actions/workflows/update-elo.yml)
[![Results Updated](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/cameronshinn/wc26-team-fantasy/main/last-update.json&cacheSeconds=1800)](https://github.com/cameronshinn/wc26-team-fantasy/commits/main/results.js)

A zero-backend dashboard that tracks your World Cup 2026 draft and tallies scores under your house rules
(3 / group win · 1 / group draw · 5 / advance · 5 / each knockout win · 5 / Golden Boot · 3 / third place).

## Files
- `index.html` — the whole app (UI + logic + the draft, which never changes).
- `results.js` — live scores, auto-regenerated during the tournament and committed back to the repo.
- `scripts/update-results.js` — fetches match results from football-data.org and writes `results.js`.

## Deploy to GitHub Pages (about 2 minutes)
1. Create a repo, e.g. `wc26-pool`.
2. Drop `index.html` and `results.js` into the repo root and push.
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `/root`, save.
4. Your site is live at `https://<your-username>.github.io/wc26-pool/`.

(If you'd rather it live at `https://<your-username>.github.io/`, name the repo `<your-username>.github.io`.)

## Live score automation
`results.js` is kept up to date automatically during the tournament via a GitHub Actions workflow that runs
every 30 minutes (Jun 11 – Jul 19). When a match finishes, the next scheduled run fetches the result,
regenerates `results.js`, and commits it — GitHub Pages redeploys automatically.

**One-time setup:**
1. Get a free API key at [football-data.org/client/register](https://www.football-data.org/client/register).
2. Add it as a repository secret: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FOOTBALL_API_KEY`
   - Value: your key
3. That's it. You can also trigger a manual run any time from the **Actions** tab.

**What's automated vs. manual:**
- Group stage scores, knockout results, and 3rd-place winner — **automatic**.
- Golden Boot — **manual** (set it in Commissioner Mode once the top scorer is known).

## Manual score entry (fallback)
If you ever need to override or correct a result, use the **Commissioner** tab on the site:
type in scores, set the Golden Boot and 3rd-place teams, then click **Export results.js** and
commit the downloaded file. Any manually set Golden Boot is preserved across automatic updates.

The **Copy** button copies the same content to your clipboard if you'd rather paste into GitHub's editor.

## Notes
- Advancement points award automatically: top two of each group clinch as soon as that group finishes;
  the eight best third-place spots resolve once all 12 groups are done.
- All 48 teams are drafted (12 each across Luke, Grant, Cam, and Peter).
- Tiebreakers for third-place ranking use points → goal difference → goals for (a simplification of FIFA's
  full tiebreaker list; fine for a pool).
