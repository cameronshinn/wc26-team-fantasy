#!/usr/bin/env node
// Fetches current Elo ratings from eloratings.net/World.tsv and appends to elo-history.json.
// Column layout: rank, prev_rank, code, rating, ...
"use strict";
const https = require("https");
const fs    = require("fs");
const path  = require("path");

// Map eloratings.net 2-letter codes → names used in elo.json / draft.json
const CODE_TO_TEAM = {
  DZ: "Algeria",
  AR: "Argentina",
  AU: "Australia",
  AT: "Austria",
  BE: "Belgium",
  BA: "Bosnia",
  BR: "Brazil",
  CA: "Canada",
  CV: "Cape Verde",
  CO: "Colombia",
  HR: "Croatia",
  CW: "Curacao",
  CZ: "Czechia",
  CD: "DR Congo",
  EC: "Ecuador",
  EG: "Egypt",
  EN: "England",
  FR: "France",
  DE: "Germany",
  GH: "Ghana",
  HT: "Haiti",
  IR: "Iran",
  IQ: "Iraq",
  CI: "Ivory Coast",
  JP: "Japan",
  JO: "Jordan",
  MX: "Mexico",
  MA: "Morocco",
  NL: "Netherlands",
  NZ: "New Zealand",
  NO: "Norway",
  PA: "Panama",
  PY: "Paraguay",
  PT: "Portugal",
  QA: "Qatar",
  SA: "Saudi Arabia",
  SQ: "Scotland",
  SN: "Senegal",
  ZA: "South Africa",
  KR: "South Korea",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  TN: "Tunisia",
  TR: "Turkey",
  UY: "Uruguay",
  US: "USA",
  UZ: "Uzbekistan",
};

const WC26_TEAMS = new Set(Object.values(CODE_TO_TEAM));

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "wc26-fantasy-elo-updater/1.0" } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  const tsv = await fetch("https://eloratings.net/World.tsv");
  const ratings = {};

  for (const line of tsv.split("\n")) {
    const cols = line.trim().split("\t");
    if (cols.length < 4) continue;
    const code   = cols[2];
    const rating = parseInt(cols[3], 10);
    const team   = CODE_TO_TEAM[code];
    if (team && !isNaN(rating)) ratings[team] = rating;
  }

  const missing = [...WC26_TEAMS].filter(t => !(t in ratings));
  if (missing.length) {
    console.error("Missing ratings for:", missing.join(", "));
    process.exit(1);
  }

  // Sort by rating descending
  const sorted = Object.fromEntries(
    Object.entries(ratings).sort((a, b) => b[1] - a[1])
  );

  // Append today's snapshot to elo-history.json
  const historyPath = path.join(__dirname, "..", "elo-history.json");
  let history = {};
  try { history = JSON.parse(fs.readFileSync(historyPath, "utf8")); } catch (_) {}
  const today = new Date().toLocaleDateString('en-CA', {timeZone: 'America/Los_Angeles'});
  history[today] = sorted;
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
  console.log(`Appended ${today} to elo-history.json (${Object.keys(history).length} total entries).`);
}

main().catch(e => { console.error(e); process.exit(1); });
