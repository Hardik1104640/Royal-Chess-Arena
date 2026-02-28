// =============================================================================
//  bot-backend.js
//  ChessBot class + public API. Thin orchestration layer.
//  Depends on: chess.js → bot-data.js → bot-engine.js → bot-backend.js
//
//  HTML usage:
//    <script src="chess.min.js"></script>
//    <script src="bot-data.js"></script>
//    <script src="bot-engine.js"></script>
//    <script src="bot-backend.js"></script>
// =============================================================================
console.log('🔄 bot-backend.js: Loading...');
try {

// ── CHESS.JS ──────────────────────────────────────────────────────────────────
let Chess;
if (typeof window !== 'undefined' && window.Chess) {
    Chess = window.Chess;
} else if (typeof require !== 'undefined') {
    try { Chess = require('chess.js').Chess; } catch(e) {}
}
if (!Chess) console.error('❌ Chess.js not found — load chess.js before bot-backend.js');

// ── CHESSBOT CLASS ────────────────────────────────────────────────────────────
class ChessBot {
    /**
     * @param {string|number} botNameOrId
     * @param {string}        botColor      "w" or "b" — the color the BOT plays
     * @param {object|null}   stockfish     Stockfish() instance — only used for Engine bots
     * @param {object}        opts
     * @param {boolean}       opts.ignoreLocked
     */
    constructor(botNameOrId, botColor, stockfish, opts = {}) {
        if (!Chess) throw new Error('Chess library not loaded');

        const bot = typeof botNameOrId === 'number'
            ? BOTS.find(b => b.id === botNameOrId)
            : BOTS.find(b => b.name.toLowerCase() === String(botNameOrId).toLowerCase());

        if (!bot) throw new Error(`Bot not found: "${botNameOrId}"`);
        if (bot.locked && !opts.ignoreLocked) throw new Error(`"${bot.name}" is locked (Premium)`);

        this.bot      = bot;
        this.name     = bot.name;
        this.elo      = bot.elo;
        this.color    = botColor === 'w' ? 'w' : 'b';
        this.isEngine = (bot.category === 'Engine');

        if (this.isEngine) {
            this.sf      = stockfish || null;
            this.profile = _engineProfile(bot.elo);
            if (this.sf) {
                this._sfSend('uci');
                this._sfSend('setoption name Hash value 128');
                this._sfSend('setoption name Threads value 1');
                this._sfSend('ucinewgame');
                this._sfSend('isready');
                console.log(`⚙️  Engine Bot: ${this.name} (${this.elo}) | ✅ Stockfish depth=${this.profile.depth}`);
            } else {
                console.log(`⚙️  Engine Bot: ${this.name} (${this.elo}) | ⚠️  No Stockfish — using built-in AI fallback`);
                this.profile = _skillProfile(Math.min(this.elo, 2600));
            }
        } else {
            this.sf      = null;
            this.profile = _skillProfile(bot.elo);
            console.log(`♟  Bot: ${this.name} (${this.elo}) | depth=${this.profile.depth} pool=${this.profile.pool} blunder=${(this.profile.blunder_rate*100).toFixed(1)}% noise=${this.profile.noise}`);
        }
    }

    // ── PUBLIC ─────────────────────────────────────────────────────────────────
    async getMove(fen) {
        if (!fen) return null;

        let g;
        try {
            g = new Chess();
            if (!g.load(fen)) throw new Error('load failed');
        } catch(e) { console.error('getMove: bad FEN', e.message); return null; }

        if (g.in_checkmate() || g.in_stalemate() || g.in_draw() || g.insufficient_material()) return null;
        const legal = g.moves({ verbose: true });
        if (!legal.length) return null;

        // Engine bots with Stockfish
        if (this.isEngine && (this.sf || (typeof window !== 'undefined' && window.Stockfish))) {
            try {
                if (!this.sf && typeof window !== 'undefined' && window.Stockfish) {
                    try {
                        this.sf = window.Stockfish();
                        console.log(`  🔧 [${this.name}: Stockfish initialized from window]`);
                    } catch(err_init) {
                        console.warn(`Failed to init Stockfish: ${err_init.message}`);
                        this.sf = null;
                    }
                }
                if (this.sf) {
                    const candidates = await this._queryStockfish(fen);
                    if (candidates.length) {
                        const pick = candidates[Math.floor(Math.random() * candidates.length)];
                        console.log(`  ⚙️  [${this.name} (Stockfish) → ${pick}]`);
                        return pick;
                    }
                }
            } catch(err) {
                console.error('Stockfish error, using built-in AI:', err.message);
                this.sf = null;
            }
        }

        // Built-in skill AI
        return this._builtInMove(g);
    }

    // ── BUILT-IN AI ───────────────────────────────────────────────────────────
    // Architecture: minimax is the SINGLE source of truth for move quality.
    // Heuristic adjustments are ONLY used as tiebreakers or hard vetoes — never
    // to override a move the engine genuinely calculated as best.
    _builtInMove(game) {
        const legal = game.moves({ verbose: true });
        if (!legal.length) return null;

        const { depth, pool, blunder_rate, noise, blunder_threshold } = this.profile;
        const isStrong    = this.elo >= 1400;
        const isAdvanced  = this.elo >= 1800;  // deeper vetoes for 1800+
        const fenParts    = game.fen().split(' ');
        const fullMove    = parseInt(fenParts[5]) || 1;
        const myColor     = game.turn();

        // ── STEP 0: Opening book (first 12 full moves) ───────────────────────
        try {
            const halfMove = (fullMove - 1) * 2 + (fenParts[1] === 'b' ? 1 : 0);
            if (halfMove < 24) {
                const bookMove = lookupBook(game);
                if (bookMove) {
                    const from = bookMove.slice(0,2), to = bookMove.slice(2,4);
                    const result = game.move({ from, to, promotion: bookMove[4] || 'q' });
                    if (result) {
                        game.undo();
                        console.log(`  📖 [${this.name} book: ${result.san}]`);
                        return bookMove;
                    }
                }
            }
        } catch(e) {}

        // ── STEP 0b: Dedicated mate search (runs BEFORE main search) ─────────
        // mate_depth=1 → finds mate in 1. mate_depth=4 → mate in 4. etc.
        // Cap at 5 plies (mate in 3) in browser to avoid UI freezes.
        // GM bots (mate_depth 9) effectively search up to mate-in-5 in practice.
        const { mate_depth } = this.profile;
        if (mate_depth > 0) {
            try {
                const matePlies = Math.min(mate_depth * 2 - 1, 9); // cap: mate-in-5 max
                const mateMove = findMate(game, matePlies);
                if (mateMove) {
                    console.log(`  ♟♛ [${this.name} MATE FOUND: ${mateMove}]`);
                    return mateMove;
                }
            } catch(e) {}
        }

        // ── STEP 1: Pre-compute tactical context ─────────────────────────────
        // Used for hard vetoes only — NOT to adjust minimax scores.

        // 1a. Which of OUR squares are attacked by an enemy piece of <= value?
        const threatenedSquares = new Map(); // square → attacker value (smallest)
        // 1b. Which enemy squares can we capture favourably (victim >= attacker)?
        const goodCaptureSquares = new Set();

        if (isStrong) {
            try {
                const brd      = game.board();
                const oppColor = myColor === 'w' ? 'b' : 'w';
                const fp       = fenParts;
                const oFen     = [fp[0], oppColor, fp[2], '-', '0', fp[5]].join(' ');
                const oGame    = new Chess();
                if (oGame.load(oFen)) {
                    for (const om of oGame.moves({ verbose: true })) {
                        if (!om.captured) continue;
                        const fc  = om.to.charCodeAt(0) - 97;
                        const fr  = 8 - parseInt(om.to[1]);
                        const tgt = brd[fr] && brd[fr][fc];
                        if (!tgt || tgt.color !== myColor) continue;
                        const atkVal = PIECE_VALUES[om.piece]  || 0;
                        const tgtVal = PIECE_VALUES[tgt.type]  || 0;
                        if (atkVal <= tgtVal) {
                            // Our piece on om.to is attacked by a <= valued piece
                            const prev = threatenedSquares.get(om.to);
                            if (prev === undefined || atkVal < prev)
                                threatenedSquares.set(om.to, atkVal);
                        }
                    }
                }
                for (const m of legal) {
                    if (m.captured && (PIECE_VALUES[m.captured]||0) >= (PIECE_VALUES[m.piece]||0))
                        goodCaptureSquares.add(m.to);
                }
            } catch(e) {}
        }

        // 1c. Piece move history — track which squares have been destination twice
        const squareMoveCount = {};
        if (isStrong && fullMove <= 20) {
            try {
                for (const h of game.history({ verbose: true })) {
                    squareMoveCount[h.to] = (squareMoveCount[h.to] || 0) + 1;
                }
            } catch(e) {}
        }

        // ── STEP 2: Score every legal move with minimax + hard time limit ──────
        // Hard limit: 1400ms per move. If exceeded, return best found so far.
        // This prevents 10-16 second hangs in the browser main thread.
        // Move ordering ensures the best moves are scored first, so early exit
        // still returns a strong move (we've already seen all captures + checks).
        const MOVE_TIME_LIMIT_MS = 1400;
        const searchStart = Date.now();

        const scored = [];
        const sortedMoves = sortMoves([...legal]);
        for (const m of sortedMoves) {
            // Hard time cutoff — return what we have if over budget
            if (scored.length > 0 && (Date.now() - searchStart) > MOVE_TIME_LIMIT_MS) {
                console.warn(`  ⏱ [${this.name} time limit hit after ${scored.length}/${sortedMoves.length} moves — using best so far]`);
                break;
            }
            game.move(m);
            const rawScore = -minimax(game, depth - 1, -Infinity, Infinity, true);
            game.undo();
            const score = noise > 0
                ? rawScore + (Math.random() - 0.5) * noise * 2
                : rawScore;
            scored.push({ uci: m.from + m.to + (m.promotion || ''), san: m.san, score, rawScore, move: m });
        }
        if (!scored.length) return null;
        scored.sort((a, b) => b.score - a.score);

        const bestScore = scored[0].score;

        // ── STEP 3: HARD VETOES (advanced bots 1800+) ────────────────────────
        // These REMOVE moves from consideration entirely when they violate basic
        // chess principles that the engine at this depth can miss.
        // A move is only vetoed if a safe alternative exists within a threshold.
        // The threshold scales with the presumed gain of the vetoed move so that
        // genuine sacrificial combinations are never blocked.

        if (isAdvanced && scored.length > 1) {
            let candidates = [...scored];

            // Helper: find best non-vetoed alternative
            const bestAlt = (vetoed) => candidates.find(s => !vetoed.has(s));

            const vetoed = new Set();

            for (const s of candidates) {
                const m   = s.move;
                const mv  = PIECE_VALUES[m.piece] || 0;  // value of piece we're moving
                const gap = bestScore - s.score;           // how much worse than best (by engine)

                // ── VETO A: Queen early development (moves 1-6, not a capture, not check) ──
                // Queen out before move 6 without capturing is almost always wrong.
                if (m.piece === 'q' && fullMove <= 6 && !m.captured && !m.san.includes('+') && !m.san.includes('=')) {
                    vetoed.add(s);
                    continue;
                }

                // ── VETO B: Moving a piece to a square where it gets taken at a loss ──
                // Detects: we move a piece, opponent captures it with a lower-valued piece.
                // Covers both free captures (Nf3 → Bg5xf3) and losing trades (Rxe4 where pawn recaptures).
                // Veto only applied when engine score gap >= -50cp (engine doesn't strongly like the move).
                if (mv >= 300 && !m.captured) { // only for minor pieces and above
                    try {
                        game.move(m);
                        const afterFen   = game.fen().split(' ');
                        const checkColor = afterFen[1];
                        const cloneFen   = [afterFen[0], checkColor === 'w' ? 'b' : 'w',
                                            afterFen[2], '-', '0', afterFen[5]].join(' ');
                        game.undo();
                        const cloneGame = new Chess();
                        if (cloneGame.load(cloneFen)) {
                            let isFreeCapture = false;
                            for (const reply of cloneGame.moves({ verbose: true })) {
                                if (!reply.captured) continue;
                                if (reply.to !== m.to) continue;
                                const repVal = PIECE_VALUES[reply.piece] || 0;
                                if (repVal < mv) { isFreeCapture = true; break; }
                            }
                            if (isFreeCapture) {
                                // Only veto if the engine didn't find a huge plan (>= 150cp gain)
                                // This allows genuine sacrifices the engine found good
                                if (gap >= -50) { // engine doesn't think it's that great
                                    vetoed.add(s);
                                    continue;
                                }
                            }
                        }
                    } catch(e) { try { game.undo(); } catch(_) {} }
                }

                // ── VETO B2: Capturing into a losing exchange ────────────────────
                // If we capture a piece but can be immediately recaptured with a
                // lower-valued piece AND engine score doesn't support it, veto it.
                if (m.captured && mv >= 300) {
                    const capturedVal = PIECE_VALUES[m.captured] || 0;
                    if (capturedVal < mv) { // we're capturing with MORE valuable piece — potential loss
                        try {
                            game.move(m);
                            const aftF2   = game.fen().split(' ');
                            const cFen3   = [aftF2[0], aftF2[1]==='w'?'b':'w', aftF2[2], '-', '0', aftF2[5]].join(' ');
                            game.undo();
                            const cG3 = new Chess();
                            if (cG3.load(cFen3)) {
                                let recaptureVal = Infinity;
                                for (const rep of cG3.moves({ verbose:true })) {
                                    if (!rep.captured || rep.to !== m.to) continue;
                                    const rv = PIECE_VALUES[rep.piece] || 0;
                                    if (rv < recaptureVal) recaptureVal = rv;
                                }
                                // Net: we gain capturedVal, lose mv, opponent recaptures with recaptureVal
                                // Net loss = mv - capturedVal > 0 AND we get recaptured
                                if (recaptureVal <= mv && (mv - capturedVal) >= 100 && gap >= -60) {
                                    vetoed.add(s);
                                    continue;
                                }
                            }
                        } catch(e) { try { game.undo(); } catch(_) {} }
                    }
                }

                // ── VETO C: Giving a check that immediately loses material ──────
                // Pattern: we give check, opponent blocks/captures and also attacks our piece.
                // Simplified test: if this is a check move and the moved piece has no escape
                // after the check is resolved (captured or attacked by lower piece).
                if (m.san.includes('+') && mv >= 300) {
                    try {
                        game.move(m);
                        const oppColor2  = game.turn();
                        const afterFen2  = game.fen().split(' ');
                        const cFen2      = [afterFen2[0], oppColor2, afterFen2[2], '-', '0', afterFen2[5]].join(' ');
                        game.undo();
                        const cGame2 = new Chess();
                        if (cGame2.load(cFen2)) {
                            let losesPieceAfterCheck = false;
                            for (const reply of cGame2.moves({ verbose: true })) {
                                if (!reply.captured) continue;
                                if (reply.to !== m.to) continue;
                                if ((PIECE_VALUES[reply.piece]||0) <= mv) {
                                    losesPieceAfterCheck = true; break;
                                }
                            }
                            // Only veto if engine also doesn't rate it highly
                            if (losesPieceAfterCheck && gap >= -30) {
                                vetoed.add(s);
                                continue;
                            }
                        }
                    } catch(e) { try { game.undo(); } catch(_) {} }
                }

                // ── VETO D: Leaving a threatened piece undefended ─────────────
                // If one of our pieces is already under attack and this move
                // neither moves it, captures the attacker, nor defends it,
                // AND the threatened piece loss is significant (>= bishop value).
                if (isAdvanced && threatenedSquares.size > 0) {
                    let addressesThreat = false;
                    for (const [sq, atkVal] of threatenedSquares) {
                        const threatVal = (() => {
                            const f = sq.charCodeAt(0) - 97;
                            const r = 8 - parseInt(sq[1]);
                            const brd2 = game.board();
                            const p = brd2[r] && brd2[r][f];
                            return p ? (PIECE_VALUES[p.type] || 0) : 0;
                        })();
                        if (threatVal < 300) continue; // only care about bishop+ threats
                        if (m.from === sq) { addressesThreat = true; break; } // moves the piece
                        if (m.captured && m.to === sq) { addressesThreat = true; break; } // captures attacker? (approx)
                        // Defends: hard to detect cheaply, so we only veto if the engine
                        // also didn't rate this move highly (not a discovered defence)
                    }
                    if (!addressesThreat) {
                        // Only veto if the engine score is close to alternatives
                        // (engine may have found a counter-attack that's better)
                        if (gap > 60) vetoed.add(s); // significantly worse than best AND ignores threat
                    }
                }
            }

            // Apply vetoes — but only if at least one unvetoed move exists
            const unvetoed = candidates.filter(s => !vetoed.has(s));
            if (unvetoed.length > 0) {
                candidates = unvetoed;
                if (vetoed.size > 0) {
                    const vetoedNames = [...vetoed].map(s => s.san).join(', ');
                    console.log(`  🚫 [${this.name} vetoes: ${vetoedNames}]`);
                }
            }

            // ── STEP 4a: Apply small tiebreaker bonuses (does NOT override engine) ──
            // These only matter when engine scores are very close (within 15cp).
            // They nudge the final pick without ever overriding a clearly better move.
            for (const s of candidates) {
                const m = s.move;
                let tiebreak = 0;

                // Castling tiebreaker
                if (m.san === 'O-O' || m.san === 'O-O-O') tiebreak += 8;

                // Moving a threatened piece (only if engine scores are similar)
                if (threatenedSquares.has(m.from)) tiebreak += 5;

                // Taking a free piece tiebreaker
                if (m.captured && goodCaptureSquares.has(m.to)) tiebreak += 4;

                // Penalise same piece moved multiple times in opening
                if (!m.captured && !m.san.includes('+') && fullMove <= 18) {
                    const cnt = squareMoveCount[m.from] || 0;
                    if (cnt >= 2) tiebreak -= 6;
                    else if (cnt === 1 && m.piece !== 'k' && m.piece !== 'p') tiebreak -= 3;
                }

                s.score = s.rawScore + tiebreak; // re-score with tiny tiebreaker only
            }
            candidates.sort((a, b) => b.score - a.score);

            // ── STEP 4b: Blunder injection — only REAL blunders ─────────────
            // A blunder must lose at least blunder_threshold centipawns vs the best move.
            // This prevents "blunders" that are actually near-best play.
            if (blunder_rate > 0 && Math.random() < blunder_rate) {
                const { blunder_threshold } = this.profile;
                const thresh = blunder_threshold || 100;
                // Candidates that are genuinely bad (lose >= threshold cp vs best)
                const badMoves = candidates.filter(s => (candidates[0].rawScore - s.rawScore) >= thresh);
                if (badMoves.length > 0) {
                    // Pick a random bad move — weight toward less-bad ones (avoid resigning)
                    const bm = badMoves[Math.floor(Math.random() * Math.min(badMoves.length, 3))];
                    console.log(`  💀 [${this.name} blunders -${(candidates[0].rawScore - bm.rawScore).toFixed(0)}cp: ${bm.san}]`);
                    return bm.uci;
                }
                // No genuinely bad moves available — just play best (no accidental blunder)
            }

            const topN = candidates.slice(0, Math.min(pool, candidates.length));
            const pick = topN[Math.floor(Math.random() * topN.length)];
            console.log(`  [${this.name} (${this.elo}) d${depth} → ${pick.san} (${pick.score > 0 ? '+' : ''}${pick.score.toFixed(0)})]`);
            return pick.uci;
        }

        // ── STEP 4 (non-advanced bots): simple pool + blunder ────────────────
        // Small opening tiebreaker only
        if (isStrong && fullMove <= 18) {
            for (const s of scored) {
                const cnt = squareMoveCount[s.move.from] || 0;
                if (cnt >= 2) s.score -= 6;
                else if (cnt === 1 && s.move.piece !== 'k' && s.move.piece !== 'p') s.score -= 3;
                if (s.move.san === 'O-O' || s.move.san === 'O-O-O') s.score += 8;
            }
            scored.sort((a, b) => b.score - a.score);
        }

        let selectedMove;
        const shouldBlunder = blunder_rate > 0 && Math.random() < blunder_rate;
        if (shouldBlunder) {
            const { blunder_threshold } = this.profile;
            const thresh = blunder_threshold || 50;
            const badMoves = scored.filter(s => (scored[0].rawScore - s.rawScore) >= thresh);
            if (badMoves.length > 0) {
                selectedMove = badMoves[Math.floor(Math.random() * Math.min(badMoves.length, 4))];
                console.log(`  💀 [${this.name} blunders -${(scored[0].rawScore - selectedMove.rawScore).toFixed(0)}cp: ${selectedMove.san}]`);
            } else {
                const topN = scored.slice(0, Math.min(pool, scored.length));
                selectedMove = topN[Math.floor(Math.random() * topN.length)];
            }
        } else {
            const topN = scored.slice(0, Math.min(pool, scored.length));
            selectedMove = topN[Math.floor(Math.random() * topN.length)];
        }
        console.log(`  [${this.name} (${this.elo}) d${depth} → ${selectedMove.san} (${selectedMove.score > 0 ? '+' : ''}${selectedMove.score.toFixed(0)})]`);
        return selectedMove.uci;
    }
    // ── STOCKFISH ──────────────────────────────────────────────────────────────
    _sfSend(cmd) {
        if (!this.sf) return;
        try { this.sf.postMessage(cmd); } catch(e) {}
    }

    _queryStockfish(fen) {
        const { depth, movetime, multiPV } = this.profile;
        return new Promise((resolve) => {
            const moves   = [];
            let   settled = false;

            const finish = () => {
                if (settled) return;
                settled = true;
                detach();
                resolve(moves.slice(0, multiPV));
            };

            const onMsg = (line) => {
                const msg = typeof line === 'string' ? line : (line.data ?? String(line));
                if (!msg) return;
                if (msg.includes(' pv ')) {
                    const m = msg.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
                    if (m && !moves.includes(m[1])) moves.push(m[1]);
                }
                if (msg.startsWith('bestmove')) {
                    const bm = msg.match(/^bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
                    if (bm && !moves.includes(bm[1])) moves.unshift(bm[1]);
                    finish();
                }
            };

            const attach = () => {
                if (typeof this.sf.addListener === 'function') this.sf.addListener('message', onMsg);
                else this.sf.onmessage = onMsg;
            };
            const detach = () => {
                if (typeof this.sf.removeListener === 'function') this.sf.removeListener('message', onMsg);
                else this.sf.onmessage = null;
            };

            try {
                attach();
                this._sfSend(`position fen ${fen}`);
                this._sfSend(`go depth ${depth} movetime ${movetime} multipv ${multiPV}`);
            } catch(err) { finish(); }

            setTimeout(finish, movetime + 1000);
        });
    }
}

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function listBots({ category, locked } = {}) {
    let list = BOTS;
    if (category !== undefined) list = list.filter(b => b.category.toLowerCase() === category.toLowerCase());
    if (locked   !== undefined) list = list.filter(b => b.locked === locked);
    console.log(`\nTotal: ${list.length} bots`);
    list.forEach(b => console.log(`${String(b.id).padStart(3)} | ${b.name.padEnd(35)} | ${String(b.elo).padEnd(5)} | ${b.category.padEnd(10)} | ${b.locked ? '🔒' : '✅'}`));
}
function getBotById(id)     { return BOTS.find(b => b.id === id) ?? null; }
function getBotByName(name) { return BOTS.find(b => b.name.toLowerCase() === name.toLowerCase()) ?? null; }


// ── EXPORTS ───────────────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports !== undefined) {
    module.exports = { ChessBot, BOTS, listBots, getBotById, getBotByName };
}
if (typeof window !== 'undefined') {
    window.ChessBot           = ChessBot;
    window.listBots           = listBots;
    window.getBotById         = getBotById;
    window.getBotByName       = getBotByName;
    window._BotBackendLoaded  = true;
    console.log('✅ bot-backend.js: ChessBot ready — 183 bots loaded');
}

} catch(err) {
    console.error('🔴 FATAL in bot-backend.js:', err.message, err.stack);
    if (typeof window !== 'undefined') {
        window._BotBackendLoaded = false;
        window._BotBackendError  = err.message;
    }
}