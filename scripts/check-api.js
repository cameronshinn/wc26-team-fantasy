#!/usr/bin/env node
// Usage: FOOTBALL_API_KEY=<key> node scripts/check-api.js

const https = require('https');

const API_KEY = process.env.FOOTBALL_API_KEY;
if (!API_KEY) { console.error('FOOTBALL_API_KEY not set'); process.exit(1); }

https.get('https://api.football-data.org/v4/competitions/WC/matches', { headers: { 'X-Auth-Token': API_KEY } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = JSON.parse(data).matches ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const recent = matches.filter(m => m.utcDate?.startsWith(today));
    console.log(`${matches.length} total matches, ${recent.length} today (${today}):\n`);
    for (const m of recent) {
      console.log(`${m.homeTeam.name} vs ${m.awayTeam.name}`);
      console.log(`  status=${m.status}  stage=${m.stage}  utcDate=${m.utcDate}`);
      console.log(`  score=${JSON.stringify(m.score)}\n`);
    }
    const statuses = [...new Set(matches.map(m => m.status))];
    console.log('All statuses in response:', statuses);
  });
}).on('error', err => { console.error(err.message); process.exit(1); });
