// Initialize Chess library from minis folder for play.js
// Use dynamic import (allowed by CSP, unlike eval)
// chess-init.js (ES module)
// Import the ESM build directly and expose `Chess` on window for legacy scripts.
import * as chessModule from '../minis/chess.esm.js';

const Chess = chessModule.Chess || (chessModule.default && chessModule.default.Chess) || chessModule.default || chessModule;

if (Chess) {
  window.Chess = Chess;
  console.log('chess-init: Chess library initialized and attached to window.Chess');
} else {
  console.error('chess-init: Chess class not found in module exports');
}

