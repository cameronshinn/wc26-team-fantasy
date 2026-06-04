/* =============================================================
   TEST FIXTURE — full tournament, all features exercised:
     · Varied group scores (draws, high-scoring, tight)
     · KO games correctly seeded from group results
     · KO scores (hg/ag) on every entry
     · R16 Mexico vs England decided by AET (hg=2, ag=1 after 120 min)
     · QF Belgium vs Spain decided by penalties (hg=1, ag=1 after 120 min)
     · Complete bracket: R32 → R16 → QF → SF → 3rd Place → Final
     · Final: France vs Argentina — Argentina wins 3-2 AET
     · Golden Boot: Argentina · thirdPlace: Germany
============================================================= */
window.WC_RESULTS = {
  "groupGames": {
    "A|Mexico|South Korea":      {"hg":3,"ag":1},
    "A|South Africa|Czechia":    {"hg":0,"ag":2},
    "A|Mexico|South Africa":     {"hg":2,"ag":0},
    "A|Czechia|South Korea":     {"hg":1,"ag":1},
    "A|Czechia|Mexico":          {"hg":1,"ag":2},
    "A|South Korea|South Africa":{"hg":2,"ag":0},

    "B|Canada|Switzerland":      {"hg":1,"ag":0},
    "B|Qatar|Bosnia":            {"hg":0,"ag":3},
    "B|Canada|Qatar":            {"hg":4,"ag":0},
    "B|Bosnia|Switzerland":      {"hg":1,"ag":1},
    "B|Bosnia|Canada":           {"hg":0,"ag":2},
    "B|Switzerland|Qatar":       {"hg":2,"ag":0},

    "C|Brazil|Morocco":          {"hg":2,"ag":1},
    "C|Scotland|Haiti":          {"hg":3,"ag":0},
    "C|Brazil|Scotland":         {"hg":1,"ag":0},
    "C|Haiti|Morocco":           {"hg":0,"ag":2},
    "C|Haiti|Brazil":            {"hg":1,"ag":3},
    "C|Morocco|Scotland":        {"hg":2,"ag":1},

    "D|USA|Australia":           {"hg":2,"ag":1},
    "D|Paraguay|Turkey":         {"hg":0,"ag":1},
    "D|USA|Paraguay":            {"hg":3,"ag":0},
    "D|Turkey|Australia":        {"hg":2,"ag":0},
    "D|Turkey|USA":              {"hg":1,"ag":1},
    "D|Australia|Paraguay":      {"hg":1,"ag":0},

    "E|Germany|Ecuador":         {"hg":2,"ag":2},
    "E|Ivory Coast|Curacao":     {"hg":3,"ag":0},
    "E|Germany|Ivory Coast":     {"hg":2,"ag":0},
    "E|Curacao|Ecuador":         {"hg":0,"ag":2},
    "E|Curacao|Germany":         {"hg":0,"ag":4},
    "E|Ecuador|Ivory Coast":     {"hg":1,"ag":0},

    "F|Netherlands|Japan":       {"hg":3,"ag":1},
    "F|Tunisia|Sweden":          {"hg":0,"ag":2},
    "F|Netherlands|Tunisia":     {"hg":2,"ag":0},
    "F|Sweden|Japan":            {"hg":1,"ag":2},
    "F|Sweden|Netherlands":      {"hg":0,"ag":1},
    "F|Japan|Tunisia":           {"hg":2,"ag":0},

    "G|Belgium|Iran":            {"hg":2,"ag":0},
    "G|Egypt|New Zealand":       {"hg":1,"ag":0},
    "G|Belgium|Egypt":           {"hg":3,"ag":1},
    "G|New Zealand|Iran":        {"hg":2,"ag":1},
    "G|New Zealand|Belgium":     {"hg":0,"ag":2},
    "G|Iran|Egypt":              {"hg":1,"ag":2},

    "H|Spain|Cape Verde":        {"hg":4,"ag":0},
    "H|Uruguay|Saudi Arabia":    {"hg":2,"ag":1},
    "H|Spain|Uruguay":           {"hg":1,"ag":0},
    "H|Saudi Arabia|Cape Verde": {"hg":2,"ag":1},
    "H|Saudi Arabia|Spain":      {"hg":0,"ag":3},
    "H|Cape Verde|Uruguay":      {"hg":1,"ag":2},

    "I|France|Senegal":          {"hg":2,"ag":0},
    "I|Norway|Iraq":             {"hg":1,"ag":0},
    "I|France|Norway":           {"hg":1,"ag":1},
    "I|Iraq|Senegal":            {"hg":0,"ag":1},
    "I|Iraq|France":             {"hg":0,"ag":2},
    "I|Senegal|Norway":          {"hg":1,"ag":2},

    "J|Argentina|Algeria":       {"hg":3,"ag":0},
    "J|Austria|Jordan":          {"hg":2,"ag":1},
    "J|Argentina|Austria":       {"hg":2,"ag":0},
    "J|Jordan|Algeria":          {"hg":1,"ag":1},
    "J|Jordan|Argentina":        {"hg":0,"ag":1},
    "J|Algeria|Austria":         {"hg":0,"ag":2},

    "K|Portugal|DR Congo":       {"hg":2,"ag":0},
    "K|Uzbekistan|Colombia":     {"hg":0,"ag":3},
    "K|Portugal|Uzbekistan":     {"hg":3,"ag":1},
    "K|Colombia|DR Congo":       {"hg":2,"ag":0},
    "K|Colombia|Portugal":       {"hg":1,"ag":2},
    "K|DR Congo|Uzbekistan":     {"hg":1,"ag":0},

    "L|England|Croatia":         {"hg":2,"ag":0},
    "L|Ghana|Panama":            {"hg":1,"ag":1},
    "L|England|Ghana":           {"hg":3,"ag":0},
    "L|Panama|Croatia":          {"hg":0,"ag":2},
    "L|Panama|England":          {"hg":0,"ag":2},
    "L|Croatia|Ghana":           {"hg":2,"ag":1}
  },
  "koGames": [
    {"round":"R32","a":"Czechia",     "b":"Bosnia",      "winner":"Czechia",     "hg":2,"ag":1},
    {"round":"R32","a":"Germany",     "b":"Australia",   "winner":"Germany",     "hg":3,"ag":0},
    {"round":"R32","a":"Netherlands", "b":"Morocco",     "winner":"Netherlands", "hg":2,"ag":0},
    {"round":"R32","a":"Ecuador",     "b":"Norway",      "winner":"Norway",      "hg":0,"ag":1},
    {"round":"R32","a":"France",      "b":"Sweden",      "winner":"France",      "hg":3,"ag":1},
    {"round":"R32","a":"Brazil",      "b":"Japan",       "winner":"Brazil",      "hg":2,"ag":0},
    {"round":"R32","a":"Mexico",      "b":"Scotland",    "winner":"Mexico",      "hg":2,"ag":0},
    {"round":"R32","a":"England",     "b":"Senegal",     "winner":"England",     "hg":1,"ag":0},
    {"round":"R32","a":"USA",         "b":"Switzerland", "winner":"USA",         "hg":2,"ag":1},
    {"round":"R32","a":"Belgium",     "b":"South Korea", "winner":"Belgium",     "hg":2,"ag":0},
    {"round":"R32","a":"Spain",       "b":"Austria",     "winner":"Spain",       "hg":3,"ag":0},
    {"round":"R32","a":"Turkey",      "b":"Egypt",       "winner":"Turkey",      "hg":1,"ag":0},
    {"round":"R32","a":"Canada",      "b":"New Zealand", "winner":"Canada",      "hg":1,"ag":0},
    {"round":"R32","a":"Argentina",   "b":"Uruguay",     "winner":"Argentina",   "hg":2,"ag":1},
    {"round":"R32","a":"Portugal",    "b":"Ivory Coast", "winner":"Portugal",    "hg":2,"ag":0},
    {"round":"R32","a":"Colombia",    "b":"Croatia",     "winner":"Colombia",    "hg":1,"ag":0},

    {"round":"R16","a":"Czechia",     "b":"Germany",     "winner":"Germany",     "hg":0,"ag":2},
    {"round":"R16","a":"Netherlands", "b":"Norway",      "winner":"Netherlands", "hg":2,"ag":1},
    {"round":"R16","a":"France",      "b":"Brazil",      "winner":"France",      "hg":1,"ag":0},
    {"round":"R16","a":"Mexico",      "b":"England",     "winner":"Mexico",      "hg":2,"ag":1},
    {"round":"R16","a":"USA",         "b":"Belgium",     "winner":"Belgium",     "hg":2,"ag":1},
    {"round":"R16","a":"Spain",       "b":"Turkey",      "winner":"Spain",       "hg":2,"ag":0},
    {"round":"R16","a":"Canada",      "b":"Argentina",   "winner":"Argentina",   "hg":0,"ag":3},
    {"round":"R16","a":"Portugal",    "b":"Colombia",    "winner":"Portugal",    "hg":1,"ag":0},

    {"round":"QF","a":"Germany",     "b":"Netherlands",  "winner":"Germany",     "hg":2,"ag":1},
    {"round":"QF","a":"France",      "b":"Mexico",       "winner":"France",      "hg":2,"ag":0},
    {"round":"QF","a":"Belgium",     "b":"Spain",        "winner":"Spain",       "hg":1,"ag":1,"penHg":3,"penAg":4},
    {"round":"QF","a":"Argentina",   "b":"Portugal",     "winner":"Argentina",   "hg":3,"ag":2},

    {"round":"SF","a":"Germany",     "b":"France",       "winner":"France",      "hg":0,"ag":1},
    {"round":"SF","a":"Spain",       "b":"Argentina",    "winner":"Argentina",   "hg":1,"ag":2},

    {"round":"F","a":"France",       "b":"Argentina",    "winner":"Argentina",   "hg":2,"ag":3}
  ],
  "goldenBoot": "Argentina",
  "thirdPlace": "Germany",
  "thirdPlaceGame": {"a":"Germany","b":"Spain","hg":3,"ag":2},
  "lastUpdated": "2026-07-19T22:00:00.000Z"
};
