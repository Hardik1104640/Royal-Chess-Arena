// Small ES module that imports the local ESM build and exposes a global `Chess`
// so legacy scripts (which expect `window.Chess`) can use it.
(async () => {
  try {
    const mod = await import('/vendor/chess.js/dist/esm/chess.js');
    // The dist ESM build may export `Chess` as a named export or as default.
    // chess.js exports as default or named; normalize to a usable constructor
    const ChessLib = mod.Chess || (mod.default && mod.default.Chess) || mod.default || mod;
    // Attach to window for non-module consumers
    window.Chess = ChessLib;
    console.log('chess-init: Chess library initialized from /vendor.');
  } catch (err) {
    console.error('chess-init: failed to load chess library from /vendor', err);
    const status = document.getElementById('mini-status');
    if (status) {
      status.style.display = 'block';
      status.textContent = 'Chess library failed to load. Please ensure chess.esm.js is present.';
    }
  }
})();
