#!/usr/bin/env node
// Quick diagnostic: dump all finished match scores from api-football.
// Usage: API_FOOTBALL_KEY=<key> node scripts/check-api.js

const https = require('https');

const API_KEY = process.env.API_FOOTBALL_KEY;
if (!API_KEY) { console.error('API_FOOTBALL_KEY not set'); process.exit(1); }

https.get(
  'https://v3.football.api-sports.io/fixtures?league=1&season=2026&status=FT-AET-PEN',
  { headers: { 'x-apisports-key': API_KEY } },
  res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
      const data = JSON.parse(raw);
      const matches = data.response;
      if (!matches?.length) { console.log('No finished matches'); return; }
      matches.forEach(item => {
        const { home: hg, away: ag } = item.goals;
        const pen = item.score.penalty;
        const penStr = pen?.home != null ? ` (pen ${pen.home}-${pen.away})` : '';
        console.log(
          `[${item.fixture.status.short}] ${item.league.round}:`,
          `${item.teams.home.name} ${hg ?? '?'}-${ag ?? '?'} ${item.teams.away.name}${penStr}`,
        );
      });
    });
  }
).on('error', err => { console.error(err.message); process.exit(1); });
