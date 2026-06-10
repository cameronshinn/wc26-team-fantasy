#!/usr/bin/env node
// Generates elo-history-test.json by applying standard Elo updates (K=30)
// to each game in results_test_full.js in chronological order.
// Run once: node scripts/gen-elo-history-test.js
"use strict";
const fs   = require("fs");
const path = require("path");

// ── Match date mapping (mirrors MATCH_DATES in index.html) ──────────────────
const MATCH_DATES = {
  "A|Mexico|South Korea":"Jun 18","A|South Africa|Czechia":"Jun 18",
  "A|Mexico|South Africa":"Jun 11","A|Czechia|South Korea":"Jun 11",
  "A|Czechia|Mexico":"Jun 24","A|South Korea|South Africa":"Jun 24",
  "B|Canada|Switzerland":"Jun 24","B|Qatar|Bosnia":"Jun 24",
  "B|Canada|Qatar":"Jun 18","B|Bosnia|Switzerland":"Jun 18",
  "B|Bosnia|Canada":"Jun 12","B|Switzerland|Qatar":"Jun 13",
  "C|Brazil|Morocco":"Jun 13","C|Scotland|Haiti":"Jun 13",
  "C|Brazil|Scotland":"Jun 24","C|Haiti|Morocco":"Jun 24",
  "C|Haiti|Brazil":"Jun 19","C|Morocco|Scotland":"Jun 19",
  "D|USA|Australia":"Jun 19","D|Paraguay|Turkey":"Jun 19",
  "D|USA|Paraguay":"Jun 12","D|Turkey|Australia":"Jun 13",
  "D|Turkey|USA":"Jun 25","D|Australia|Paraguay":"Jun 25",
  "E|Germany|Ecuador":"Jun 25","E|Ivory Coast|Curacao":"Jun 25",
  "E|Germany|Ivory Coast":"Jun 20","E|Curacao|Ecuador":"Jun 20",
  "E|Curacao|Germany":"Jun 14","E|Ecuador|Ivory Coast":"Jun 14",
  "F|Netherlands|Japan":"Jun 14","F|Tunisia|Sweden":"Jun 14",
  "F|Netherlands|Tunisia":"Jun 25","F|Sweden|Japan":"Jun 25",
  "F|Sweden|Netherlands":"Jun 20","F|Japan|Tunisia":"Jun 20",
  "G|Belgium|Iran":"Jun 21","G|Egypt|New Zealand":"Jun 21",
  "G|Belgium|Egypt":"Jun 15","G|New Zealand|Iran":"Jun 15",
  "G|New Zealand|Belgium":"Jun 26","G|Iran|Egypt":"Jun 26",
  "H|Spain|Cape Verde":"Jun 15","H|Uruguay|Saudi Arabia":"Jun 15",
  "H|Spain|Uruguay":"Jun 26","H|Saudi Arabia|Cape Verde":"Jun 26",
  "H|Saudi Arabia|Spain":"Jun 21","H|Cape Verde|Uruguay":"Jun 21",
  "I|France|Senegal":"Jun 16","I|Norway|Iraq":"Jun 16",
  "I|France|Norway":"Jun 26","I|Iraq|Senegal":"Jun 26",
  "I|Iraq|France":"Jun 22","I|Senegal|Norway":"Jun 22",
  "J|Argentina|Algeria":"Jun 16","J|Austria|Jordan":"Jun 16",
  "J|Argentina|Austria":"Jun 22","J|Jordan|Algeria":"Jun 22",
  "J|Jordan|Argentina":"Jun 27","J|Algeria|Austria":"Jun 27",
  "K|Portugal|DR Congo":"Jun 17","K|Uzbekistan|Colombia":"Jun 17",
  "K|Portugal|Uzbekistan":"Jun 23","K|Colombia|DR Congo":"Jun 23",
  "K|Colombia|Portugal":"Jun 27","K|DR Congo|Uzbekistan":"Jun 27",
  "L|England|Croatia":"Jun 17","L|Ghana|Panama":"Jun 17",
  "L|England|Ghana":"Jun 23","L|Panama|Croatia":"Jun 23",
  "L|Panama|England":"Jun 27","L|Croatia|Ghana":"Jun 27",
};

// KO dates by position index (mirrors KO_DATES in index.html)
const KO_DATES = {
  r32: ['Jun 28','Jun 29','Jun 29','Jun 29','Jun 30','Jun 30','Jun 30','Jul 1','Jul 1','Jul 1','Jul 2','Jul 2','Jul 2','Jul 3','Jul 3','Jul 3'],
  r16: ['Jul 4','Jul 4','Jul 5','Jul 5','Jul 6','Jul 6','Jul 7','Jul 7'],
  qf:  ['Jul 9','Jul 10','Jul 11','Jul 11'],
  sf:  ['Jul 14','Jul 15'],
  fin: ['Jul 19'],
  third: ['Jul 18'],
};

// ── Load inputs ──────────────────────────────────────────────────────────────
const eloHistory = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "elo-history.json"), "utf8"));
const latestDate = Object.keys(eloHistory).sort().at(-1);
const elo = eloHistory[latestDate];
const resultsRaw = fs.readFileSync(path.join(__dirname, "..", "results_test_full.js"), "utf8");
const results = JSON.parse(resultsRaw.match(/window\.WC_RESULTS\s*=\s*(\{[\s\S]*?\})\s*;\s*$/)[1]);

// ── Elo update helpers ───────────────────────────────────────────────────────
const K = 30;
function expected(rA, rB) { return 1 / (1 + Math.pow(10, (rB - rA) / 400)); }
function applyResult(ratings, teamA, teamB, score) {
  const rA = ratings[teamA] || 1750;
  const rB = ratings[teamB] || 1750;
  const exp = expected(rA, rB);
  const delta = K * (score - exp);     // score: 1=win, 0.5=draw, 0=loss for A
  ratings[teamA] = Math.round(rA + delta);
  ratings[teamB] = Math.round(rB - delta);
}

// ── Build a date sort key ────────────────────────────────────────────────────
const MONTH = {Jun:6, Jul:7};
function dateKey(str) {  // "Jun 11" → 20260611
  const [mon, day] = str.split(' ');
  return 2026 * 10000 + MONTH[mon] * 100 + parseInt(day, 10);
}
function toIso(str) {    // "Jun 11" → "2026-06-11"
  const [mon, day] = str.split(' ');
  return `2026-${String(MONTH[mon]).padStart(2,'0')}-${day.padStart(2,'0')}`;
}

// ── Collect all games with their dates ──────────────────────────────────────
const allGames = [];

// Group games
for (const [key, score] of Object.entries(results.groupGames)) {
  const date = MATCH_DATES[key];
  if (!date) { console.warn("Unknown fixture key:", key); continue; }
  const [, home, away] = key.split("|");
  const s = score.hg > score.ag ? 1 : score.hg < score.ag ? 0 : 0.5;
  allGames.push({ date, home, away, score: s });
}

// KO games (index into KO_DATES by round)
const roundKey = { R32:'r32', R16:'r16', QF:'qf', SF:'sf', F:'fin' };
const roundIdx = { R32:[], R16:[], QF:[], SF:[], F:[] };
for (const g of results.koGames) {
  roundIdx[g.round].push(g);
}
for (const [round, games] of Object.entries(roundIdx)) {
  const dates = KO_DATES[roundKey[round]];
  games.forEach((g, i) => {
    const date = dates[i];
    if (!date) return;
    const w = g.hg > g.ag ? g.a : g.ag > g.hg ? g.b : (g.penHg > g.penAg ? g.a : g.b);
    const s = w === g.a ? 1 : 0;
    allGames.push({ date, home: g.a, away: g.b, score: s });
  });
}

// 3rd place
if (results.thirdPlaceGame) {
  const tpg = results.thirdPlaceGame;
  if (tpg.hg != null && tpg.ag != null) {
    const w = tpg.hg > tpg.ag ? tpg.a : tpg.ag > tpg.hg ? tpg.b : (tpg.penHg > tpg.penAg ? tpg.a : tpg.b);
    const s = tpg.a === w ? 1 : 0;
    allGames.push({ date: 'Jul 18', home: tpg.a, away: tpg.b, score: s });
  }
}

// Sort by date
allGames.sort((a, b) => dateKey(a.date) - dateKey(b.date));

// ── Build history snapshots ──────────────────────────────────────────────────
const history = {};
const current = { ...elo };

// Pre-tournament baseline (day before the tournament opens)
history["2026-06-10"] = { ...current };

// Walk through each unique matchday
const uniqueDates = [...new Set(allGames.map(g => g.date))];
uniqueDates.sort((a, b) => dateKey(a) - dateKey(b));

for (const date of uniqueDates) {
  const games = allGames.filter(g => g.date === date);
  for (const { home, away, score } of games) {
    if (!(home in current)) { console.warn(`No Elo for ${home}`); continue; }
    if (!(away in current)) { console.warn(`No Elo for ${away}`); continue; }
    applyResult(current, home, away, score);
  }
  history[toIso(date)] = { ...current };
}

// ── Write output ─────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, "..", "elo-history-test.json");
fs.writeFileSync(outPath, JSON.stringify(history, null, 2) + "\n");
console.log(`Wrote ${outPath} with ${Object.keys(history).length} snapshots:`);
Object.keys(history).sort().forEach(d => console.log(`  ${d}`));
