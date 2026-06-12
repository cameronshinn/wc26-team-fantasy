#!/usr/bin/env node
// Usage: FOOTBALL_API_KEY=<key> node scripts/check-api.js

const https = require('https');

const API_KEY = process.env.FOOTBALL_API_KEY;
if (!API_KEY) { console.error('FOOTBALL_API_KEY not set'); process.exit(1); }

// Must stay in sync with update-results.js
const TEAM_NAME_MAP = {
  'United States':                'USA',
  'Korea Republic':               'South Korea',
  "Côte d'Ivoire":               'Ivory Coast',
  "Cote d'Ivoire":               'Ivory Coast',
  'Cabo Verde':                   'Cape Verde',
  'Cape Verde Islands':           'Cape Verde',
  'Congo DR':                     'DR Congo',
  'Congo, DR':                    'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'Bosnia and Herzegovina':       'Bosnia',
  'Bosnia-Herzegovina':           'Bosnia',
  'Czech Republic':               'Czechia',
  'Curaçao':                     'Curacao',
};
const KNOWN_TEAMS = new Set([
  'Mexico','South Korea','South Africa','Czechia',
  'Canada','Switzerland','Qatar','Bosnia',
  'Brazil','Morocco','Scotland','Haiti',
  'USA','Australia','Paraguay','Turkey',
  'Germany','Ecuador','Ivory Coast','Curacao',
  'Netherlands','Japan','Tunisia','Sweden',
  'Belgium','Iran','Egypt','New Zealand',
  'Spain','Cape Verde','Uruguay','Saudi Arabia',
  'France','Senegal','Norway','Iraq',
  'Argentina','Algeria','Austria','Jordan',
  'Portugal','DR Congo','Uzbekistan','Colombia',
  'England','Croatia','Ghana','Panama',
]);

https.get('https://api.football-data.org/v4/competitions/WC/matches', { headers: { 'X-Auth-Token': API_KEY } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = JSON.parse(data).matches ?? [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Show a 3-day window (yesterday / today / tomorrow UTC) to catch timezone edge cases
    const window = [-1, 0, 1].map(d => {
      const dt = new Date(now); dt.setUTCDate(dt.getUTCDate() + d); return dt.toISOString().slice(0, 10);
    });
    const recent = matches.filter(m => window.some(d => m.utcDate?.startsWith(d)));

    console.log(`${matches.length} total matches | today UTC: ${today} | showing ±1 day window:\n`);
    for (const m of recent) {
      console.log(`${m.homeTeam.name} vs ${m.awayTeam.name}`);
      console.log(`  status=${m.status}  stage=${m.stage}  utcDate=${m.utcDate}`);
      console.log(`  score=${JSON.stringify(m.score)}\n`);
    }

    // Show all FINISHED matches so nothing is hidden
    const finished = matches.filter(m => m.status === 'FINISHED');
    if (finished.some(m => !window.some(d => m.utcDate?.startsWith(d)))) {
      console.log('--- FINISHED matches outside ±1 day window ---');
      for (const m of finished.filter(m => !window.some(d => m.utcDate?.startsWith(d)))) {
        console.log(`${m.homeTeam.name} vs ${m.awayTeam.name}  utcDate=${m.utcDate}  score=${JSON.stringify(m.score)}`);
      }
      console.log();
    }

    const statuses = [...new Set(matches.map(m => m.status))];
    console.log('All statuses in response:', statuses);

    // Audit every team name the API uses against our mapping
    console.log('\n--- Team name audit ---');
    const apiNames = [...new Set(matches.flatMap(m => [m.homeTeam.name, m.awayTeam.name]))].filter(Boolean).sort();
    let allGood = true;
    for (const name of apiNames) {
      const mapped = TEAM_NAME_MAP[name] ?? name;
      if (!KNOWN_TEAMS.has(mapped)) {
        console.log(`  MISSING  "${name}" → "${mapped}"`);
        allGood = false;
      }
    }
    if (allGood) console.log('  All API team names map correctly.');
  });
}).on('error', err => { console.error(err.message); process.exit(1); });
