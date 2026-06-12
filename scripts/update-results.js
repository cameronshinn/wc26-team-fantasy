#!/usr/bin/env node
/**
 * Fetches WC26 results from football-data.org and regenerates results.js.
 *
 * Setup:
 *   1. Get a free API key at https://www.football-data.org/client/register
 *   2. Add it as repository secret FOOTBALL_API_KEY
 *
 * Run locally:
 *   FOOTBALL_API_KEY=<key> node scripts/update-results.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Error: FOOTBALL_API_KEY environment variable not set');
  process.exit(1);
}

// --- Data model: must stay in sync with TEAMS in index.html ---
const TEAMS_DEF = [
  ["Mexico","A"],["South Korea","A"],["South Africa","A"],["Czechia","A"],
  ["Canada","B"],["Switzerland","B"],["Qatar","B"],["Bosnia","B"],
  ["Brazil","C"],["Morocco","C"],["Scotland","C"],["Haiti","C"],
  ["USA","D"],["Australia","D"],["Paraguay","D"],["Turkey","D"],
  ["Germany","E"],["Ecuador","E"],["Ivory Coast","E"],["Curacao","E"],
  ["Netherlands","F"],["Japan","F"],["Tunisia","F"],["Sweden","F"],
  ["Belgium","G"],["Iran","G"],["Egypt","G"],["New Zealand","G"],
  ["Spain","H"],["Cape Verde","H"],["Uruguay","H"],["Saudi Arabia","H"],
  ["France","I"],["Senegal","I"],["Norway","I"],["Iraq","I"],
  ["Argentina","J"],["Algeria","J"],["Austria","J"],["Jordan","J"],
  ["Portugal","K"],["DR Congo","K"],["Uzbekistan","K"],["Colombia","K"],
  ["England","L"],["Croatia","L"],["Ghana","L"],["Panama","L"],
];

const GROUP_LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const GROUPS = {};
GROUP_LETTERS.forEach(L => GROUPS[L] = []);
TEAMS_DEF.forEach(([t, g]) => GROUPS[g].push(t));

const PAIRS = [[0,1],[2,3],[0,2],[3,1],[3,0],[1,2]];
function fixtures(L) {
  const t = GROUPS[L];
  return PAIRS.map(([i,j]) => ({home: t[i], away: t[j], key: `${L}|${t[i]}|${t[j]}`}));
}

// Bidirectional lookup: "HomeTeam|AwayTeam" → {key, homeIsFirst}
// homeIsFirst=true means the API home team maps to the canonical home in the key
const FIXTURE_LOOKUP = {};
GROUP_LETTERS.forEach(L => {
  fixtures(L).forEach(f => {
    FIXTURE_LOOKUP[`${f.home}|${f.away}`] = {key: f.key, homeIsFirst: true};
    FIXTURE_LOOKUP[`${f.away}|${f.home}`] = {key: f.key, homeIsFirst: false};
  });
});

// Normalise API team names → our internal names
const TEAM_NAME_MAP = {
  'United States':              'USA',
  'Korea Republic':             'South Korea',
  "Côte d'Ivoire":             'Ivory Coast',
  "Cote d'Ivoire":             'Ivory Coast',
  'Cabo Verde':                 'Cape Verde',
  'Cape Verde Islands':         'Cape Verde',
  'Congo DR':                   'DR Congo',
  'Congo, DR':                  'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'Bosnia and Herzegovina':     'Bosnia',
  'Bosnia-Herzegovina':         'Bosnia',
  'Czech Republic':             'Czechia',
  'Curaçao':                   'Curacao',
};
const KNOWN_TEAMS = new Set(TEAMS_DEF.map(([t]) => t));

function normTeam(name) {
  const mapped = TEAM_NAME_MAP[name] || name;
  if (!KNOWN_TEAMS.has(mapped)) {
    console.warn(`  Unknown team from API: "${name}" (mapped to "${mapped}")`);
  }
  return mapped;
}

// football-data.org stage strings → our round codes
const ROUND_MAP = {
  'ROUND_OF_32': 'R32',
  'LAST_32':     'R32',
  'ROUND_OF_16': 'R16',
  'LAST_16':     'R16',
  'QUARTER_FINALS': 'QF',
  'SEMI_FINALS':    'SF',
  'FINAL':          'F',
};
const ROUND_ORDER = {R32:0, R16:1, QF:2, SF:3, F:4};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'X-Auth-Token': API_KEY}}, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// Read existing results.js so we can preserve manually-set goldenBoot
function readExistingGoldenBoot() {
  try {
    const text = fs.readFileSync(path.join(__dirname, '..', 'results.js'), 'utf8');
    const fakeWindow = {};
    new Function('window', text)(fakeWindow); // eslint-disable-line no-new-func
    return fakeWindow.WC_RESULTS?.goldenBoot ?? null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('Fetching WC26 matches from football-data.org...');
  let data;
  try {
    data = await fetchJson('https://api.football-data.org/v4/competitions/WC/matches');
  } catch (err) {
    console.error('API fetch failed:', err.message);
    process.exit(1);
  }

  const matches = data.matches;
  if (!matches || matches.length === 0) {
    console.log('No matches returned from API — results.js not modified');
    process.exit(0);
  }
  console.log(`  ${matches.length} total matches received`);

  const existingGoldenBoot = readExistingGoldenBoot();

  const groupGames = {};
  const koGames = [];
  let thirdPlaceGame = null;
  let finishedCount = 0;

  for (const match of matches) {
    if (match.status !== 'FINISHED' && match.status !== 'AWARDED') continue;
    finishedCount++;

    const home = normTeam(match.homeTeam.name);
    const away = normTeam(match.awayTeam.name);
    const hg = match.score.fullTime.home;
    const ag = match.score.fullTime.away;
    if (hg == null || ag == null) {
      console.warn(`  Skipping ${home} vs ${away} (${match.stage}, status=${match.status}): score=${JSON.stringify(match.score)}`);
      continue;
    }

    if (match.stage === 'GROUP_STAGE') {
      const lookup = FIXTURE_LOOKUP[`${home}|${away}`];
      if (!lookup) {
        console.warn(`  No canonical fixture found for: ${home} vs ${away}`);
        continue;
      }
      // Map API home/away goals to canonical home/away order
      groupGames[lookup.key] = lookup.homeIsFirst
        ? {hg, ag}
        : {hg: ag, ag: hg};

    } else if (match.stage === 'THIRD_PLACE') {
      const et3 = match.score.extraTime;
      const hg3 = (et3 && et3.home != null) ? et3.home : hg;
      const ag3 = (et3 && et3.away != null) ? et3.away : ag;
      thirdPlaceGame = {a: home, b: away, hg: hg3, ag: ag3};
      const pen3 = match.score.penalties;
      if (pen3 && pen3.home != null && pen3.away != null) { thirdPlaceGame.penHg = pen3.home; thirdPlaceGame.penAg = pen3.away; }

    } else if (ROUND_MAP[match.stage]) {
      // Use extra-time score if available (score after 120 min), else full-time
      const et = match.score.extraTime;
      const scoreHg = (et && et.home != null) ? et.home : hg;
      const scoreAg = (et && et.away != null) ? et.away : ag;
      const pen = match.score.penalties;
      const entry = {round: ROUND_MAP[match.stage], a: home, b: away, hg: scoreHg, ag: scoreAg};
      if (pen && pen.home != null && pen.away != null) { entry.penHg = pen.home; entry.penAg = pen.away; }
      koGames.push(entry);
    } else {
      console.warn(`  Unrecognised stage "${match.stage}" for ${home} vs ${away} — skipping`);
    }
  }

  koGames.sort((a, b) => (ROUND_ORDER[a.round] ?? 99) - (ROUND_ORDER[b.round] ?? 99));

  console.log(`  ${finishedCount} finished, ${Object.keys(groupGames).length} group games, ${koGames.length} KO games`);

  const lastUpdated = new Date().toISOString();
  const output =
`/* =============================================================
   LIVE RESULTS  —  the single source of truth for the dashboard.
   Auto-generated by scripts/update-results.js — do not hand-edit.
   Commissioner Mode → Export is still available to override.
   =============================================================
   groupGames     : keyed by "GROUP|HOME|AWAY" -> { hg, ag }
   koGames        : list of { round, a, b, hg, ag [, penHg, penAg] }  (round: R32/R16/QF/SF/F; hg/ag = FT or AET goals)
   goldenBoot     : team name that houses the Golden Boot winner (or null)
   thirdPlaceGame : { a, b, hg, ag [, penHg, penAg] } score for the 3rd-place match (or null)
   lastUpdated    : ISO timestamp of the last auto-update (or null)
============================================================= */
window.WC_RESULTS = ${JSON.stringify({groupGames, koGames, goldenBoot: existingGoldenBoot, thirdPlaceGame, lastUpdated}, null, 2)};
`;

  const outPath = path.join(__dirname, '..', 'results.js');
  fs.writeFileSync(outPath, output, 'utf8');
  console.log('results.js updated successfully');

  // Write shields.io endpoint badge payload — committed alongside results.js when results change
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const label = `${months[now.getUTCMonth()]} ${now.getUTCDate()} · ${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')} UTC`;
  const badge = {schemaVersion: 1, label: 'results updated', message: label, color: 'brightgreen'};
  fs.writeFileSync(path.join(__dirname, '..', 'last-update.json'), JSON.stringify(badge, null, 2) + '\n', 'utf8');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
