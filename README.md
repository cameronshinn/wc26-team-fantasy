# Group Stage of Death — WC26 Fantasy Dashboard

A zero-backend dashboard that tracks your World Cup 2026 draft and tallies scores under your house rules
(3 / group win · 1 / group draw · 5 / advance · 5 / each knockout win · 5 / Golden Boot · 3 / third place).

## Files
- `index.html` — the whole app (UI + logic + the draft, which never changes).
- `results.js` — the **only** file you edit during the tournament. It holds live scores and is the single source of truth every visitor reads.

## Deploy to GitHub Pages (about 2 minutes)
1. Create a repo, e.g. `wc26-pool`.
2. Drop `index.html` and `results.js` into the repo root and push.
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `/root`, save.
4. Your site is live at `https://<your-username>.github.io/wc26-pool/`.

(If you'd rather it live at `https://<your-username>.github.io/`, name the repo `<your-username>.github.io`.)

## Updating scores during the tournament
Two ways — both end with a commit to `results.js`:

**Easy (recommended):** open the site → **Commissioner** tab → type in final group scores, add knockout
results, set the Golden Boot and 3rd-place teams. Click **Export results.js**, then replace the file in your
repo (drag-drop in GitHub's web UI works) and commit. The leaderboard updates for everyone on refresh.

**Manual:** edit `results.js` directly. Group games are keyed `"GROUP|HOME|AWAY"` — use the exact home/away
order shown in Commissioner mode.

The **Copy** button copies the same content to your clipboard if you'd rather paste into GitHub's editor.

## Notes
- Advancement points award automatically: top two of each group clinch as soon as that group finishes;
  the eight best third-place spots resolve once all 12 groups are done.
- Australia went undrafted, so its results score for nobody.
- Tiebreakers for third-place ranking use points → goal difference → goals for (a simplification of FIFA's
  full tiebreaker list; fine for a pool).
