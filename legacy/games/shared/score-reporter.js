(function () {
  function report(gameId, score, meta) {
    if (!window.parent || window.parent === window) {
      return false;
    }

    const numericScore = Number(score);
    if (!gameId || !Number.isFinite(numericScore)) {
      return false;
    }

    window.parent.postMessage(
      {
        type: "AKA_GAME_SCORE",
        payload: {
          gameId,
          score: Math.max(0, Math.floor(numericScore)),
          meta: meta || {},
          reportedAt: new Date().toISOString()
        }
      },
      window.location.origin || "*"
    );

    return true;
  }

  window.AkaScoreReporter = { report };
})();
