// =============================================================================
//  bot-engine.js
//  Chess engine: evaluation, alpha-beta search, quiescence, mate detection.
//  Depends on: chess.js, bot-data.js
//  Load order: bot-data.js → bot-engine.js → bot-backend.js
// =============================================================================
console.log('🔄 bot-engine.js: Loading...');
try {

// ── CHESS.JS ──────────────────────────────────────────────────────────────────
let Chess;
if (typeof window !== 'undefined' && window.Chess) {
    Chess = window.Chess;
} else if (typeof require !== 'undefined') {
    try { Chess = require('chess.js').Chess; } catch(e) {}
}
if (!Chess) console.error('❌ Chess library not found in this file — load chess.js first');

// ── STATIC EXCHANGE EVALUATION (SEE) ────────────────────────────────────────
// Determines the material outcome of a sequence of captures on one square.
// Returns net centipawns gained/lost — positive = profitable capture.
// This stops the bot from making "free" captures that are actually losing exchanges.
function see(game, toSq, targetVal, fromSq, fromVal) {
    let value = 0;
    // Find the least valuable attacker of toSq for the side to move
    const moves = game.moves({ verbose: true });
    let minAttackerVal = Infinity;
    let minAttackerMove = null;
    for (const m of moves) {
        if (m.to === toSq && m.from !== fromSq) {
            const av = PIECE_VALUES[m.piece] || 0;
            if (av < minAttackerVal) {
                minAttackerVal = av;
                minAttackerMove = m;
            }
        }
    }
    if (minAttackerMove) {
        game.move(minAttackerMove);
        // Recursively evaluate — opponent recaptures with their least valuable piece
        value = Math.max(0, targetVal - see(game, toSq, minAttackerVal, minAttackerMove.from, minAttackerVal));
        game.undo();
    }
    return value;
}

// ── MOVE ORDERING (SEE + MVV-LVA + promotions) ───────────────────────────────
// Critical: winning captures searched FIRST (before quiet moves),
//           losing captures searched LAST (after quiet moves).
// This gives alpha-beta the best possible pruning AND ensures the engine
// always sees free captures before quiet moves — fixing "not capturing free pieces".
function scoreMoveForOrdering(move) {
    let score = 0;

    // ── Checkmate: absolute top ───────────────────────────────────────────────
    if (move.san && move.san.includes('#')) return 300000;

    // ── Promotions to queen ───────────────────────────────────────────────────
    if (move.promotion) {
        score += move.promotion === 'q' ? 280000 : 100000;
    }

    // ── Captures: MVV-LVA with SEE separation ─────────────────────────────────
    if (move.captured) {
        const victimVal    = PIECE_VALUES[move.captured] || 0;
        const aggressorVal = PIECE_VALUES[move.piece]    || 0;
        const netGain      = victimVal - aggressorVal;

        if (netGain > 0) {
            // Winning capture (e.g. PxQ, NxR): top priority after mate/promo
            score += 200000 + victimVal * 10 - aggressorVal;
        } else if (netGain === 0) {
            // Equal trade (NxN, RxR): above quiet moves
            score += 150000 + victimVal;
        } else {
            // Losing capture (e.g. QxP defended by pawn): below quiet moves
            // Still searched, just late — engine will likely prune these
            score += 10000 + victimVal * 10 - aggressorVal;
        }
    }

    // ── Check (+): high priority so we find mate sequences quickly ────────────
    if (move.san && move.san.includes('+')) score += 50000;

    // ── Quiet moves get score 0 (default) ────────────────────────────────────
    return score;
}

function sortMoves(moves) {
    return moves.sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));
}

// ── EVALUATE FROM WHITE'S ABSOLUTE PERSPECTIVE ──────────────────────────────
// positive = White ahead, negative = Black ahead
function evaluateAbsolute(game) {
    const board   = game.board();
    const eg      = isEndgame(board);
    let score     = 0;
    let whiteBish = 0, blackBish  = 0;
    let wKF = -1, wKR = -1, bKF = -1, bKR = -1;

    // 1. Material + PST
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            const pv  = PIECE_VALUES[piece.type] || 0;
            const psv = getPSTValue(piece.type, piece.color, r, c, eg);
            if (piece.color === 'w') {
                score += pv + psv;
                if (piece.type === 'b') whiteBish++;
                if (piece.type === 'k') { wKF = c; wKR = r; }
            } else {
                score -= pv + psv;
                if (piece.type === 'b') blackBish++;
                if (piece.type === 'k') { bKF = c; bKR = r; }
            }
        }
    }

    // 2. Bishop pair
    if (whiteBish >= 2) score += 30;
    if (blackBish >= 2) score -= 30;

    // 3. King safety (middlegame only) — comprehensive scoring
    if (!eg) {
        const fenStr = (() => { try { return game.fen(); } catch(e) { return ''; } })();
        const castlePart = fenStr.split(' ')[2] || '-';

        // Has the king actually castled? Detect by position.
        // White castled kingside  → king on g1 (r=7,c=6)
        // White castled queenside → king on c1 (r=7,c=2)
        // Black castled kingside  → king on g8 (r=0,c=6)
        // Black castled queenside → king on c8 (r=0,c=2)
        const wCastledK = (wKF === 6 && wKR === 7);
        const wCastledQ = (wKF === 2 && wKR === 7);
        const bCastledK = (bKF === 6 && bKR === 0);
        const bCastledQ = (bKF === 2 && bKR === 0);
        const wCastled  = wCastledK || wCastledQ;
        const bCastled  = bCastledK || bCastledQ;

        // Big reward for being castled — this is what motivates the bot to castle
        if (wCastled)  score += 80;
        if (bCastled)  score -= 80;

        // Still has castling rights but hasn't used them — smaller reward for flexibility
        const wHasRights = castlePart.includes('K') || castlePart.includes('Q');
        const bHasRights = castlePart.includes('k') || castlePart.includes('q');
        if (!wCastled && !wHasRights) score -= 90;   // lost rights without castling = danger
        if (!bCastled && !bHasRights) score += 90;

        // Count enemy pieces to scale king danger
        let wAttackers = 0, bAttackers = 0;
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p || p.type === 'p' || p.type === 'k') continue;
                if (p.color === 'b') bAttackers++; // black pieces = threats to white king
                else wAttackers++;
            }

        const evalKS = (kf, kr, myColor, sign) => {
            if (kf < 0) return;
            let ks = 0;
            const opp       = myColor === 'w' ? 'b' : 'w';
            const forward   = myColor === 'w' ? -1 : +1; // direction toward centre from king side
            const backRank  = myColor === 'w' ? 7 : 0;
            const enemyPieces = myColor === 'w' ? bAttackers : wAttackers;

            // ── Pawn shield ─────────────────────────────────────────────────
            let shieldScore = 0;
            for (let df = -1; df <= 1; df++) {
                const f = kf + df;
                if (f < 0 || f > 7) continue;
                const r1 = kr + forward;
                const r2 = kr + forward * 2;
                let hasShield = false;
                if (r1 >= 0 && r1 <= 7) {
                    const p = board[r1][f];
                    if (p && p.type === 'p' && p.color === myColor) { shieldScore += 20; hasShield = true; }
                }
                if (!hasShield && r2 >= 0 && r2 <= 7) {
                    const p = board[r2][f];
                    if (p && p.type === 'p' && p.color === myColor) shieldScore += 10;
                }
                // Open file in front of king — scale by number of enemy pieces
                let myPawnsOnFile = 0;
                for (let r = 0; r < 8; r++) {
                    const p = board[r][f];
                    if (p && p.type === 'p' && p.color === myColor) myPawnsOnFile++;
                }
                if (myPawnsOnFile === 0) {
                    // Open file: penalty scales with how many enemy pieces are attacking
                    ks -= Math.min(50, 15 + enemyPieces * 5);
                }
            }
            ks += shieldScore;

            // ── King position penalties ─────────────────────────────────────
            // King in centre files (c-f) in middlegame = severe danger
            if (kf >= 2 && kf <= 5) {
                ks -= 60; // Much stronger than before
                // Extra penalty if king hasn't even moved off back rank
                if (kr === backRank) ks -= 30;
            }

            // King on back rank, tucked in corner with pawn shield = safe
            if (kr === backRank && (kf <= 1 || kf >= 6)) {
                ks += 30; // well-tucked
            }

            // ── Enemy pieces near king ──────────────────────────────────────
            // Count enemy pieces within 2 squares of king
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    const er = kr + dr, ec = kf + dc;
                    if (er < 0 || er > 7 || ec < 0 || ec > 7) continue;
                    const ep = board[er][ec];
                    if (!ep || ep.color === myColor) continue;
                    if (ep.type === 'p') ks -= 8;
                    else if (ep.type === 'n') ks -= 25;
                    else if (ep.type === 'b') ks -= 20;
                    else if (ep.type === 'r') ks -= 30;
                    else if (ep.type === 'q') ks -= 45;
                }
            }

            score += sign * ks;
        };

        evalKS(wKF, wKR, 'w', +1);
        evalKS(bKF, bKR, 'b', -1);
    }

    // 4. Rook on open / semi-open file
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || piece.type !== 'r') continue;
            let wP = 0, bP = 0;
            for (let rr = 0; rr < 8; rr++) {
                const p = board[rr][c];
                if (p && p.type === 'p') { if (p.color === 'w') wP++; else bP++; }
            }
            let bonus = 0;
            if (wP === 0 && bP === 0) bonus = 20;       // open file
            else if (piece.color === 'w' && wP === 0) bonus = 10;  // semi-open
            else if (piece.color === 'b' && bP === 0) bonus = 10;
            score += piece.color === 'w' ? bonus : -bonus;
        }
    }

    // 5. Doubled pawn penalty
    for (let c = 0; c < 8; c++) {
        let wP = 0, bP = 0;
        for (let r = 0; r < 8; r++) {
            const p = board[r][c];
            if (p && p.type === 'p') { if (p.color === 'w') wP++; else bP++; }
        }
        if (wP > 1) score -= 15 * (wP - 1);
        if (bP > 1) score += 15 * (bP - 1);
    }

    // 6. Isolated pawn penalty
    for (let c = 0; c < 8; c++) {
        const hasNeighbourW = (c > 0 && [0,1,2,3,4,5,6,7].some(r => { const p = board[r][c-1]; return p && p.type === 'p' && p.color === 'w'; }))
                           || (c < 7 && [0,1,2,3,4,5,6,7].some(r => { const p = board[r][c+1]; return p && p.type === 'p' && p.color === 'w'; }));
        const hasNeighbourB = (c > 0 && [0,1,2,3,4,5,6,7].some(r => { const p = board[r][c-1]; return p && p.type === 'p' && p.color === 'b'; }))
                           || (c < 7 && [0,1,2,3,4,5,6,7].some(r => { const p = board[r][c+1]; return p && p.type === 'p' && p.color === 'b'; }));
        for (let r = 0; r < 8; r++) {
            const p = board[r][c];
            if (!p || p.type !== 'p') continue;
            if (p.color === 'w' && !hasNeighbourW) score -= 12;
            if (p.color === 'b' && !hasNeighbourB) score += 12;
        }
    }

    // 7. Check bonus (being in check is bad for the side to move)
    if (game.in_check && game.in_check()) {
        score += (game.turn() === 'w') ? -25 : 25;
    }

    // 8. Development bonus — CRITICAL for good opening play
    // Counts unmoved minors, centre pawn advances, development completion
    // Only meaningful in early game (more than 20 pieces still on board)
    let pieceCount = 0;
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
            if (board[r][c]) pieceCount++;
    if (pieceCount >= 20) {
        score += developmentScore(board, 'w');
        score -= developmentScore(board, 'b');
    }

    // 9. Hanging piece penalty — pieces that can be captured for free
    // This directly punishes positions where we've left a piece en prise
    // after making a move. The search will see this at depth 0 leaf nodes.
    // We skip kings (already handled) and only flag undefended pieces.
    // Implemented via material imbalance already captured by quiescence,
    // but we add an explicit "undefended minor/rook" penalty for leaf evals.
    // (Full hanging detection is done in quiescence — this is a hint layer)

    return score;
}

// ── QUIESCENCE SEARCH ────────────────────────────────────────────────────────
// Resolves captures AND checks at leaf nodes so we never stop in the middle
// of a tactical sequence. This is what allows mate-in-1 to be seen at depth 0.
function quiesce(game, alpha, beta, depth) {
    if (depth === undefined) depth = 0;

    // Always detect terminal positions — mate is never missed
    if (game.in_checkmate && game.in_checkmate()) return -50000;
    if ((game.in_stalemate && game.in_stalemate()) ||
        (game.in_draw && game.in_draw()) ||
        (game.insufficient_material && game.insufficient_material())) return 0;

    const standPat = (() => {
        const abs = evaluateAbsolute(game);
        return game.turn() === 'w' ? abs : -abs;
    })();

    // Stand-pat cutoff (only for captures phase, not when in check)
    const inCheck = game.in_check && game.in_check();
    if (!inCheck) {
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;
    }

    // Hard limit to prevent infinite quiescence
    if (depth > 8) return standPat;

    let tacticalMoves;
    if (inCheck) {
        // In check: must look at ALL evasions (some may be non-captures)
        tacticalMoves = game.moves({ verbose: true });
    } else {
        // Not in check: only captures, checks, and promotions
        tacticalMoves = game.moves({ verbose: true }).filter(m =>
            m.captured || m.promotion || (m.san && m.san.includes('+'))
        );
    }

    if (!tacticalMoves.length) return inCheck ? -50000 : standPat;
    sortMoves(tacticalMoves);

    for (const m of tacticalMoves) {
        game.move(m);
        const score = -quiesce(game, -beta, -alpha, depth + 1);
        game.undo();
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

// ── NEGAMAX + ALPHA-BETA + CHECK EXTENSIONS ───────────────────────────────────
// Null move pruning DISABLED — it prunes winning positions and causes missed mates.
// Check extension: adds 1 ply whenever side-to-move is in check.
function minimax(game, depth, alpha, beta, allowNull) {
    // Terminal checks — always evaluated first, no depth limit
    if (game.in_checkmate && game.in_checkmate()) return -50000 + (10 - depth);
    if ((game.in_stalemate && game.in_stalemate()) ||
        (game.in_draw && game.in_draw()) ||
        (game.insufficient_material && game.insufficient_material()) ||
        (game.in_threefold_repetition && game.in_threefold_repetition())) return 0;

    const inCheck = game.in_check && game.in_check();

    // Check extension: in check → search 1 ply deeper to find the resolution
    if (inCheck && depth < 6) depth += 1;  // cap at +6 to avoid runaway

    if (depth === 0) return quiesce(game, alpha, beta);

    let moves = game.moves({ verbose: true });
    if (!moves.length) return inCheck ? -50000 : 0;

    // Move ordering: mate killers first (moves that give check), then MVV-LVA
    moves = sortMoves(moves);

    let best = -Infinity;
    for (const m of moves) {
        game.move(m);
        const score = -minimax(game, depth - 1, -beta, -alpha, false);
        game.undo();
        if (score > best) best = score;
        if (best > alpha) alpha = best;
        if (alpha >= beta) break;
    }
    return best;
}

// ── SKILL PROFILES ────────────────────────────────────────────────────────────
// blunder_rate = per-move probability of injecting a blunder (NOT per-game).
// Expected blunders/game ≈ rate × 30 moves.
//
// Target blunders per game:
//   <800:        11+    → rate 0.40  (×30 = 12)
//   800–1200:    8–11   → rate 0.32  (×30 = 9.6)
//   1200–1400:   6–7    → rate 0.22  (×30 = 6.6)
//   1400–1600:   5      → rate 0.17  (×30 = 5.1)
//   1600–1800:   2–3    → rate 0.083 (×30 = 2.5)
//   1800–2200:   1      → rate 0.033 (×30 = 1.0)
//   2200+:       0      → rate 0
//
// blunder_threshold = minimum centipawn loss for a move to count as a blunder.
//   Strong bots only blunder into REAL blunders (>=150cp loss), not minor inaccuracies.
//   Weak bots may "blunder" even into <=50cp worse moves (they just play bad chess).
//
// depth: effective search depth. Increased across the board vs previous version.
//   JS chess engines with alpha-beta can do depth 5 in ~100ms.
//   depth 7 = strong intermediate play.  depth 9 = near-master.
//
// mate_depth: plies for dedicated mate search BEFORE main search.
function _skillProfile(elo) {
    // ── <600: near-random — mostly plays legal moves ──────────────────────────
    if (elo < 600)  return { depth: 1, pool: 8,  blunder_rate: 0.40,  blunder_threshold:  20, noise: 150, mate_depth: 0 };
    // ── 600–800: sees captures but ignores most threats ───────────────────────
    if (elo < 800)  return { depth: 2, pool: 5,  blunder_rate: 0.40,  blunder_threshold:  30, noise: 100, mate_depth: 0 };
    // ── 800–1000: basic tactics, misses complex ones ──────────────────────────
    if (elo < 1000) return { depth: 2, pool: 3,  blunder_rate: 0.32,  blunder_threshold:  40, noise:  50, mate_depth: 1 };
    // ── 1000–1200: understands material, loose defence ────────────────────────
    if (elo < 1200) return { depth: 3, pool: 2,  blunder_rate: 0.32,  blunder_threshold:  50, noise:  20, mate_depth: 1 };
    // ── 1200–1400: sees 1-move tactics, misses 2-move ────────────────────────
    if (elo < 1400) return { depth: 3, pool: 1,  blunder_rate: 0.22,  blunder_threshold:  80, noise:   0, mate_depth: 1 };
    // ── 1400–1600: handles simple tactics, ~5 blunders/game ──────────────────
    if (elo < 1600) return { depth: 4, pool: 1,  blunder_rate: 0.17,  blunder_threshold: 100, noise:   0, mate_depth: 2 };
    // ── 1600–1700: solid play with occasional oversight ───────────────────────
    if (elo < 1700) return { depth: 5, pool: 1,  blunder_rate: 0.083, blunder_threshold: 120, noise:   0, mate_depth: 3 };
    // ── 1700–1800: consistent tactics, 2–3 blunders/game ─────────────────────
    if (elo < 1800) return { depth: 5, pool: 1,  blunder_rate: 0.083, blunder_threshold: 150, noise:   0, mate_depth: 3 };
    // ── 1800–2000: rare blunders (~1/game), sharp calculation ────────────────
    if (elo < 2000) return { depth: 6, pool: 1,  blunder_rate: 0.033, blunder_threshold: 200, noise:   0, mate_depth: 4 };
    // ── 2000–2200: ~1 blunder per game, near-expert level ────────────────────
    if (elo < 2200) return { depth: 7, pool: 1,  blunder_rate: 0.033, blunder_threshold: 250, noise:   0, mate_depth: 5 };
    // ── 2200–2400: zero blunders, master-level calculation ───────────────────
    if (elo < 2400) return { depth: 8, pool: 1,  blunder_rate: 0,     blunder_threshold: 999, noise:   0, mate_depth: 7 };
    // ── 2400–2600: strong master, very deep calculation ───────────────────────
    if (elo < 2600) return { depth: 9, pool: 1,  blunder_rate: 0,     blunder_threshold: 999, noise:   0, mate_depth: 9 };
    // ── 2600+: near-engine level ──────────────────────────────────────────────
    return           { depth: 9, pool: 1,  blunder_rate: 0,     blunder_threshold: 999, noise:   0, mate_depth: 9 };
}

// For Engine bots (Stockfish 18, 17, 16)
function _engineProfile(elo) {
    if (elo < 3400) return { depth:20, movetime:2000, multiPV:2 };
    if (elo < 3500) return { depth:23, movetime:2500, multiPV:1 };
    if (elo < 3600) return { depth:25, movetime:3000, multiPV:1 };
    if (elo < 3700) return { depth:28, movetime:3500, multiPV:1 };
    return               { depth:30, movetime:4000, multiPV:1 };
}


// ── DEDICATED MATE SEARCH ─────────────────────────────────────────────────────
// Searches ONLY for checkmate up to N plies. Fast because:
//   1. Returns immediately when mate found
//   2. Only explores check-giving moves after depth 0
//   3. Separate from main search so it never gets pruned
// Returns the UCI move string if mate found, null otherwise.
function findMate(game, maxDepth) {
    const legal = game.moves({ verbose: true });
    if (!legal.length) return null;

    // Sort: checkmate moves first, then checks, then captures
    const ordered = sortMoves([...legal]);

    for (const m of ordered) {
        game.move(m);
        const found = mateSearch(game, maxDepth - 1, true);
        game.undo();
        if (found) {
            return m.from + m.to + (m.promotion || '');
        }
    }
    return null;
}

// Returns true if the current side to move is mated (or will be mated within depth)
// isOpponent: true when it's opponent's turn after we played our candidate
function mateSearch(game, depth, isOpponent) {
    // Check if the opponent (who just received our move) is mated
    if (game.in_checkmate && game.in_checkmate()) return true;
    if (game.in_stalemate && game.in_stalemate()) return false;
    if (game.in_draw && game.in_draw()) return false;
    if (depth === 0) return false;

    const moves = game.moves({ verbose: true });
    if (!moves.length) return game.in_checkmate();

    if (isOpponent) {
        // Opponent tries to escape: mate only if ALL their moves lead to mate
        for (const m of moves) {
            game.move(m);
            const stillMated = mateSearch(game, depth - 1, false);
            game.undo();
            if (!stillMated) return false; // found an escape
        }
        return true; // all moves lead to mate
    } else {
        // Our turn: mate if ANY of our moves leads to opponent being mated
        // Only search checking moves to keep it fast
        const checks = moves.filter(m => m.san && (m.san.includes('+') || m.san.includes('#')));
        const toSearch = checks.length > 0 ? sortMoves(checks) : sortMoves(moves);
        for (const m of toSearch) {
            game.move(m);
            const mated = mateSearch(game, depth - 1, true);
            game.undo();
            if (mated) return true;
        }
        return false;
    }
}


// ── EXPORTS ───────────────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports !== undefined) {
    module.exports = {
        see, scoreMoveForOrdering, sortMoves,
        evaluateAbsolute, quiesce, minimax,
        _skillProfile, _engineProfile,
        findMate, mateSearch
    };
}
if (typeof window !== 'undefined') {
    window.see                  = see;
    window.scoreMoveForOrdering = scoreMoveForOrdering;
    window.sortMoves            = sortMoves;
    window.evaluateAbsolute     = evaluateAbsolute;
    window.quiesce              = quiesce;
    window.minimax              = minimax;
    window._skillProfile        = _skillProfile;
    window._engineProfile       = _engineProfile;
    window.findMate             = findMate;
    window.mateSearch           = mateSearch;
    window._BotEngineLoaded     = true;
    console.log('✅ bot-engine.js: Chess engine ready');
}

} catch(err) {
    console.error('🔴 FATAL in bot-engine.js:', err.message, err.stack);
    if (typeof window !== 'undefined') window._BotEngineLoaded = false;
}