/* =============================================================
   LIVE RESULTS  —  the single source of truth for the dashboard.
   Edit this file as games finish (or use Commissioner Mode in the
   site, then click "Export results.js" to regenerate it), and push.
   =============================================================
   groupGames : keyed by "GROUP|HOME|AWAY" -> { hg, ag }
   koGames    : list of { round, a, b, winner }   (round: R32/R16/QF/SF/F)
   goldenBoot : team name that houses the Golden Boot winner (or null)
   thirdPlace : team that wins the 3rd-place playoff (or null)
============================================================= */
window.WC_RESULTS = {
  groupGames: {},
  koGames: [],
  goldenBoot: null,
  thirdPlace: null
};
