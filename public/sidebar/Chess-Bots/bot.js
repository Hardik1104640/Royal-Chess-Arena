// bot.js — Royal Chess Arena  •  Bot selection + game interface
// Requires (in load order): chess.js → bot-data.js → bot-engine.js → bot-backend.js

document.addEventListener('DOMContentLoaded', () => {

// ─────────────────────────────────────────────────────────────────────────────
// BOT ROSTER — built directly from BOTS global (bot-data.js)
//
// CRITICAL: We no longer duplicate bot data here. All bots come from BOTS.
// bot.id matches BOTS[].id exactly — this is what ChessBot(id) uses.
// Using name lookup caused wrong bot when names are duplicated (e.g. "Hassan").
// ─────────────────────────────────────────────────────────────────────────────

// Style descriptions for Regular bots (cycled by index)
const REGULAR_STYLES = [
    'Aggressive attacker','Solid defender','Tactical genius','Positional master',
    'Endgame specialist','Opening expert','Blitz specialist','Strategic thinker',
    'Dynamic play','Counter-attacking','Pressure builder','Patient grinder',
    'Quick developer','Fighting spirit','Balanced approach',
];

// Category → style text for display
const botStyle = (b, idx) => {
    if (b.category === 'Chess GM')   return 'Chess Grandmaster';
    if (b.category === 'Engine')     return b.style || 'Chess engine';
    return REGULAR_STYLES[idx % REGULAR_STYLES.length];
};

// Build botsData from BOTS global (which comes from bot-data.js)
// Falls back to empty arrays if bot-data.js hasn't loaded yet.
const botsData = { chessFamous:[], adaptive:[], beginner:[], intermediate:[], advanced:[], engines:[] };

const buildBotsData = () => {
    botsData.chessFamous  = [];
    botsData.adaptive     = [];
    botsData.beginner     = [];
    botsData.intermediate = [];
    botsData.advanced     = [];
    botsData.engines      = [];

    if (typeof BOTS === 'undefined') {
        console.error('❌ BOTS global not found — bot-data.js must load before bot.js');
        return;
    }

    let regularIdx = 0;
    BOTS.forEach(b => {
        const uiBot = {
            id:      b.id,           // ← real BOTS id, used by ChessBot(id)
            name:    b.name,
            rating:  b.elo,          // bot-data uses .elo; UI shows as rating
            locked:  b.locked,
            crowns:  0,
            style:   botStyle(b, regularIdx),
        };

        switch (b.category) {
            case 'Chess GM':
                uiBot.isFamous  = true;
                uiBot.isChessGM = true;
                botsData.chessFamous.push(uiBot);
                break;
            case 'Engine':
                uiBot.isEngine = true;
                if (b.name === 'Royal Chess Arena Engine') uiBot.isCustomizable = true;
                // Preserve code abbreviations for engine avatars
                const engineCodes = {
                    'Stockfish 18':'S18','Stockfish 17':'S17','Stockfish 16':'S16',
                    'Komodo Dragon 3':'KD3','Leela Chess Zero':'LC0','AlphaZero Style':'AZ',
                    'Houdini 6':'H6','Dragon 3.2':'D32','Ethereal 14':'E14','Berserk 12':'B12',
                    'Koivisto 9':'K9','RubiChess 3':'RC3','Torch 2':'T2','Caissa 1.15':'C15',
                    'Royal Chess Arena Engine':'RCA',
                };
                uiBot.code = engineCodes[b.name] || b.name.slice(0,3);
                botsData.engines.push(uiBot);
                break;
            case 'Regular':
            default:
                if (b.elo >= 1800) {
                    botsData.advanced.push(uiBot);
                } else if (b.elo >= 1000) {
                    botsData.intermediate.push(uiBot);
                } else if (b.elo >= 600) {
                    botsData.adaptive.push(uiBot);
                } else {
                    botsData.beginner.push(uiBot);
                }
                regularIdx++;
                break;
        }
    });
    console.log(`✅ botsData built from BOTS: ${Object.values(botsData).flat().length} bots`);
};

buildBotsData();

// Update filter button counts
const updateFilterCounts = () => {
    if (typeof botsData === 'undefined') return;
    const allBots = Object.values(botsData).flat();
    const counts = {
        all: allBots.length,
        beginner: allBots.filter(b => b.rating < 1000).length,
        intermediate: allBots.filter(b => b.rating >= 1000 && b.rating < 1800).length,
        advanced: allBots.filter(b => b.rating >= 1800 && b.rating < 2500).length,
        master: allBots.filter(b => b.rating >= 2500).length,
    };
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        const countSpan = btn.querySelector('.filter-count');
        if (countSpan) countSpan.textContent = `(${counts[filter]})`;
    });
};

// Update page subtitle with match count
const updatePageSubtitle = (filterLevel, searchTerm, searchRating) => {
    const ps = document.querySelector('.page-subtitle');
    if (!ps) return;
    
    let allBots = Object.values(botsData).flat();
    if (filterLevel !== 'all') {
        if (filterLevel === 'beginner') allBots = allBots.filter(b => b.rating < 1000);
        if (filterLevel === 'intermediate') allBots = allBots.filter(b => b.rating >= 1000 && b.rating < 1800);
        if (filterLevel === 'advanced') allBots = allBots.filter(b => b.rating >= 1800 && b.rating < 2500);
        if (filterLevel === 'master') allBots = allBots.filter(b => b.rating >= 2500);
    }
    if (searchTerm) allBots = allBots.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (searchRating) { const t = parseInt(searchRating); if (!isNaN(t)) allBots = allBots.filter(b => Math.abs(b.rating - t) <= 100); }
    
    let subtitle = `Found <strong>${allBots.length}</strong> bot${allBots.length !== 1 ? 's' : ''}`;
    if (searchTerm) subtitle += ` matching "${searchTerm}"`;
    if (searchRating) subtitle += ` with rating ~${searchRating}`;
    if (filterLevel !== 'all') subtitle += ` (${filterLevel})`;
    
    ps.innerHTML = subtitle;
};

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getAllBotsDatabase = () => Object.values(botsData).flat().map(b => ({
    id:b.id, name:b.name, rating:b.rating,
    category: b.isChessGM?'Chess GM':b.isEngine?'Engine':'Regular',
    locked:b.locked, crowns:b.crowns,
}));
const logAllBotsDatabase = () => {
    const all = getAllBotsDatabase();
    console.log('\n'+'='.repeat(80)+'\n🤖 ROYAL CHESS ARENA - COMPLETE BOT DATABASE\n'+'='.repeat(80));
    all.forEach((b,i) => console.log(`${String(i+1).padEnd(3)} | ${b.name.padEnd(40)} | Elo:${String(b.rating).padEnd(5)} | ${b.category.padEnd(12)} | ${b.locked?'🔒 Premium':'✅ Free'}`));
    console.log(`\nFree: ${all.filter(b=>!b.locked).length} | Premium: ${all.filter(b=>b.locked).length}\n`+'='.repeat(80));
};
const exportBotsAsJSON = () => JSON.stringify(getAllBotsDatabase(), null, 2);
const exportBotsAsCSV  = () => {
    let csv = 'ID,Name,Rating,Category,Locked,Crowns\n';
    getAllBotsDatabase().forEach(b => { csv += `${b.id},"${b.name}",${b.rating},${b.category},${b.locked},${b.crowns}\n`; });
    return csv;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
const loadBotProgress = () => {
    try {
        const p = JSON.parse(localStorage.getItem('botProgress') || '{}');
        Object.values(botsData).flat().forEach(b => { if (p[b.id] !== undefined) b.crowns = p[b.id]; });
    } catch(e) {}
};
const saveBotProgress = () => {
    try {
        const p = {};
        Object.values(botsData).flat().forEach(b => { p[b.id] = b.crowns; });
        localStorage.setItem('botProgress', JSON.stringify(p));
        updateStatistics();
    } catch(e) {}
};
const updateStatistics = () => {
    const all      = Object.values(botsData).flat();
    const total    = all.length;
    const unlocked = all.filter(b => !b.locked).length;
    const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
    set('total-bots', total);
    set('unlocked-bots', unlocked);
    set('premium-bots', total - unlocked);
    set('completed-bots', all.filter(b=>b.crowns===3).length);
    const ps = document.querySelector('.page-subtitle');
    if (ps) ps.textContent = `Choose from ${total} bot personalities (${unlocked} available, ${total-unlocked} premium)`;
};

// ─────────────────────────────────────────────────────────────────────────────
// BOT CARD
// ─────────────────────────────────────────────────────────────────────────────
const createBotCard = (bot) => {
    const initial    = bot.code || bot.name.charAt(0).toUpperCase();
    const crownsHTML = [1,2,3].map(i => `<i class="fas fa-crown crown ${bot.crowns>=i?'earned':''}"></i>`).join('');
    let badge = '';
    if      (bot.isChessGM)   badge = '<div class="famous-badge gm-badge"><i class="fas fa-chess-king"></i> GM</div>';
    else if (bot.isEngine)    badge = '<div class="engine-badge"><i class="fas fa-microchip"></i> Engine</div>';
    const btnText = bot.locked ? 'Premium Only' : bot.isCustomizable ? 'Customize & Play' : 'Play';
    return `
        <div class="bot-card ${bot.locked?'locked':''} ${bot.isFamous?'famous-bot':''} ${bot.isEngine?'engine-bot':''} ${bot.isChessGM?'chess-gm':''}"
             data-bot-id="${bot.id}" data-bot-rating="${bot.rating}" data-bot-name="${bot.name.toLowerCase()}">
            <div class="bot-avatar ${bot.isEngine?'engine-avatar':''}">${initial}</div>
            ${badge}
            <h3 class="bot-name">${bot.name}</h3>
            <p class="bot-rating">Rating: <span>${bot.rating}</span></p>
            <p class="bot-description">${bot.style}</p>
            <div class="bot-crowns">${crownsHTML}</div>
            <button class="play-button" ${bot.locked?'disabled':''}>
                <i class="fas ${bot.locked?'fa-lock':'fa-play'}"></i> ${btnText}
            </button>
        </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────────────────────
const renderBots = (filterLevel='all', searchTerm='', searchRating='') => {
    const map = {
        'chess-famous-bots':'chessFamous',
        'engine-bots':'engines', 'adaptive-bots':'adaptive',
        'beginner-bots':'beginner', 'intermediate-bots':'intermediate', 'advanced-bots':'advanced',
    };
    Object.keys(map).forEach(gridId => {
        const category = map[gridId];
        const grid = document.getElementById(gridId);
        if (!grid) return;
        let bots = botsData[category];
        if (filterLevel !== 'all') bots = bots.filter(b => {
            if (filterLevel==='beginner')     return b.rating < 1000;
            if (filterLevel==='intermediate') return b.rating >= 1000 && b.rating < 1800;
            if (filterLevel==='advanced')     return b.rating >= 1800 && b.rating < 2500;
            if (filterLevel==='master')       return b.rating >= 2500;
            return true;
        });
        if (searchTerm)   bots = bots.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (searchRating) { const t=parseInt(searchRating); if(!isNaN(t)) bots=bots.filter(b=>Math.abs(b.rating-t)<=100); }

        const showMoreBtn = document.querySelector(`#show-more-${category}`);
        const isExpanded  = showMoreBtn?.dataset.expanded === 'true';
        const limit       = isExpanded ? bots.length : 15;
        const hasMore     = bots.length > limit;

        grid.innerHTML = bots.length
            ? bots.slice(0, limit).map(createBotCard).join('')
            : '<p class="no-bots-message">No bots match your filters</p>';

        let smc = grid.parentElement.querySelector('.show-more-container');
        if (hasMore && !smc) {
            smc = document.createElement('div');
            smc.className = 'show-more-container';
            smc.innerHTML = `<button class="show-more-btn" id="show-more-${category}" data-expanded="false"><i class="fas fa-chevron-down"></i> Show ${bots.length-limit} More Bots</button>`;
            grid.parentElement.appendChild(smc);
        } else if (smc) {
            if (hasMore) { const b=smc.querySelector('.show-more-btn'); if(b) b.innerHTML=isExpanded?'<i class="fas fa-chevron-up"></i> Show Less':`<i class="fas fa-chevron-down"></i> Show ${bots.length-limit} More Bots`; }
            else smc.remove();
        }
        const countEl = document.getElementById(gridId.replace('-bots','-count'));
        if (countEl) countEl.textContent = (searchTerm||searchRating||filterLevel!=='all') ? `(${bots.length}/${botsData[category].length})` : `(${botsData[category].length})`;
    });
    attachPlayButtonListeners();
    attachShowMoreListeners();
    updateStatistics();
    updateFilterCounts();
    updatePageSubtitle(filterLevel, searchTerm, searchRating);
};

const attachShowMoreListeners = () => {
    document.querySelectorAll('.show-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.dataset.expanded = btn.dataset.expanded === 'true' ? 'false' : 'true';
            renderBots(document.querySelector('.filter-btn.active')?.dataset.filter||'all', document.getElementById('bot-search')?.value||'', document.getElementById('rating-search')?.value||'');
        });
    });
};

const attachPlayButtonListeners = () => {
    document.querySelectorAll('.bot-card:not(.locked) .play-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card  = btn.closest('.bot-card');
            const found = Object.values(botsData).flat().find(b => b.id === parseInt(card.dataset.botId));
            if (found) openModal(found);
        });
    });
    const rcaBtn = document.querySelector('.play-button[data-bot="rca-engine"]');
    if (rcaBtn) {
        rcaBtn.addEventListener('click', () => {
            const strength = parseInt(document.getElementById('rca-engine-strength')?.value || 1500);
            openModal({ name:'Royal Chess Arena Engine', rating:strength, code:'RCA', style:'Custom adjustable strength engine', crowns:0, isEngine:true, isRCA:true });
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STOCKFISH LOADER (async, non-blocking)
// ─────────────────────────────────────────────────────────────────────────────
const loadStockfishAsync = (botName) => {
    if (typeof Stockfish !== 'undefined') return;
    const cdns = [
        './stockfish.js',
        'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js',
        'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js',
    ];
    let tried = 0;
    const tryNext = () => {
        if (tried >= cdns.length) { console.warn(`⚠️ Stockfish unavailable for "${botName}"`); return; }
        const s = document.createElement('script');
        s.src     = cdns[tried++];
        s.onload  = () => console.log(`✅ Stockfish loaded: ${s.src}`);
        s.onerror = tryNext;
        document.head.appendChild(s);
    };
    tryNext();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHESSBOT FACTORY
// ChessBot (from bot-backend.js) looks up the bot by name in the BOTS global
// from bot-data.js. Names in bot.js must exactly match bot-data.js.
// For bots NOT in bot-data.js (RCA engine, generated bots), we fall back to a
// lightweight inline skill AI using the engine globals from bot-engine.js.
// ─────────────────────────────────────────────────────────────────────────────
const createBotInstance = (bot, botColor) => {
    // Always use bot.id (number) for lookup — never name.
    // Name lookup fails when multiple bots share a name (e.g. "Hassan" appears 3 times).
    // ChessBot(id, color, stockfish, opts) — id is the BOTS[].id from bot-data.js.
    if (typeof ChessBot !== 'undefined' && bot.id && typeof bot.id === 'number' && bot.id !== 9999) {
        try {
            const instance = new ChessBot(bot.id, botColor, null, { ignoreLocked: true });
            console.log(`✅ ChessBot id=${bot.id} "${bot.name}" (${bot.rating}) plays ${botColor}`);
            return instance;
        } catch(err) {
            console.warn(`ChessBot id=${bot.id} failed: ${err.message}`);
            // Falls through to inline fallback
        }
    }

    // ── Inline fallback for bots not in the BOTS array ────────────────────
    // Uses bot-engine.js globals (_skillProfile, minimax, sortMoves, findMate)
    // directly — same quality as ChessBot, just without the class wrapper.
    const elo     = bot.rating || 1500;
    const profile = typeof _skillProfile !== 'undefined' ? _skillProfile(elo) : { depth:3, blunder_rate:0.05, noise:0, pool:1, mate_depth:1 };
    console.log(`✅ Inline skill AI: "${bot.name}" (${elo}) depth=${profile.depth}`);

    return {
        name:    bot.name,
        elo,
        profile,
        color:   botColor,
        getMove: async function(fen) {
            if (typeof Chess === 'undefined') return null;
            const g = new Chess();
            if (!g.load(fen)) return null;
            if (g.in_checkmate() || g.in_stalemate() || g.in_draw()) return null;

            const legal = g.moves({ verbose: true });
            if (!legal.length) return null;

            // Dedicated mate search
            if (typeof findMate !== 'undefined' && profile.mate_depth > 0) {
                try {
                    const mateMove = findMate(g, profile.mate_depth * 2 - 1);
                    if (mateMove) return mateMove;
                } catch(e) {}
            }

            // Blunder injection
            if (profile.blunder_rate > 0 && Math.random() < profile.blunder_rate) {
                const pick = legal[Math.floor(Math.random() * legal.length)];
                return pick.from + pick.to + (pick.promotion || '');
            }

            // Minimax
            if (typeof minimax !== 'undefined' && typeof sortMoves !== 'undefined') {
                const sorted = sortMoves([...legal]);
                let best = null, bestScore = -Infinity;
                for (const m of sorted) {
                    g.move(m);
                    const s = -(minimax(g, (profile.depth||3) - 1, -Infinity, Infinity, true));
                    g.undo();
                    if (s > bestScore) { bestScore = s; best = m; }
                }
                if (best) return best.from + best.to + (best.promotion || '');
            }

            // Last resort: random
            const pick = legal[Math.floor(Math.random() * legal.length)];
            return pick.from + pick.to + (pick.promotion || '');
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// PIECE IMAGE HELPER
// Returns an <img> for a chess piece using your Images/Chesspieces/ folder.
// Used both on the board AND in the moves list.
// ─────────────────────────────────────────────────────────────────────────────
const pieceImg = (color, type, size = '80%') => {
    const img = document.createElement('img');
    img.src   = `../../../Images/Chesspieces/${color}${type.toUpperCase()}.png`;
    img.style.cssText = `width:${size};height:${size};object-fit:contain;pointer-events:none;`;
    img.alt   = `${color}${type}`;
    // Unicode fallback if image fails to load
    img.onerror = () => {
        const map = { wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙', bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟' };
        const sp  = document.createElement('span');
        sp.textContent = map[color+type.toUpperCase()] || '?';
        sp.style.cssText = 'font-size:1.5em;line-height:1;';
        img.replaceWith(sp);
    };
    return img;
};

// SAN move with tiny piece icon in front (replaces leading piece letter)
// e.g. "Nf3" → 🐴f3,  "exd5" stays as text
const sanNode = (san, color) => {
    const pieceLetters = { K:'k', Q:'q', R:'r', B:'b', N:'n' };
    const span = document.createElement('span');
    span.style.cssText = 'display:inline-flex;align-items:center;gap:1px;';
    const first = san[0];
    if (pieceLetters[first]) {
        const img = pieceImg(color, pieceLetters[first], '14px');
        img.style.cssText += 'vertical-align:middle;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));';
        span.appendChild(img);
        span.appendChild(document.createTextNode(san.slice(1)));
    } else {
        span.textContent = san; // pawn moves, castling O-O etc
    }
    return span;
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAY WITH BOT
// ─────────────────────────────────────────────────────────────────────────────
const playWithBot = (bot, playerColor='white', timeMinutes=10, savedGameData=null) => {
    const playerColorCode = playerColor === 'white' ? 'w' : 'b';
    const botColorCode    = playerColorCode === 'w'  ? 'b' : 'w';
    const isTimed         = timeMinutes > 0;

    // Hide bot list
    const botsContainer = document.querySelector('.bots-container');
    if (botsContainer) botsContainer.style.display = 'none';

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) { alert('Game container not found. Please refresh.'); return; }

    // ── Build ChessBot / fallback instance ───────────────────────────────────
    const isEngineBotFlag = bot.isEngine || bot.rating >= 3300;
    if (isEngineBotFlag) loadStockfishAsync(bot.name);
    const botInstance = createBotInstance(bot, botColorCode);

    // ── Build game UI ─────────────────────────────────────────────────────────
    const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    const initTime = fmtTime(timeMinutes * 60);

    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.cssText = 'padding:20px;max-width:1200px;margin:0 auto;color:var(--text);';
    gameContainer.innerHTML = `
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <div>
                <h2 style="margin:0;font-size:1.25rem;">vs ${bot.name}</h2>
                <p style="margin:4px 0 0;color:var(--muted);font-size:13px;">Rating: ${bot.rating} &bull; You play: <strong>${playerColor}</strong></p>
            </div>
            <button id="game-exit-btn" style="padding:9px 18px;background:rgba(255,80,80,0.18);color:#ff6b6b;border:1px solid rgba(255,80,80,0.4);border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;"><i class="fas fa-times"></i> Exit</button>
        </div>

        <!-- Main layout: board + side panel -->
        <div id="game-layout" style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">

            <!-- LEFT: opponent timer + board + player timer -->
            <div style="flex:1;min-width:300px;">

                <!-- Opponent timer (top) -->
                <div id="timer-opp" style="display:${isTimed?'flex':'none'};align-items:center;justify-content:space-between;background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.07);border-radius:8px 8px 4px 4px;padding:10px 16px;margin-bottom:6px;">
                    <div>
                        <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.6px;" id="opp-label">${bot.name}</div>
                        <div style="font-size:11px;color:var(--muted);margin-top:2px;">${botColorCode === 'b' ? 'Black' : 'White'} &bull; ${bot.rating}</div>
                    </div>
                    <div id="opp-time" style="font-size:2.1rem;font-weight:700;font-family:monospace;color:var(--text);letter-spacing:1px;">${initTime}</div>
                </div>

                <!-- Board -->
                <div id="game-board" style="width:100%;aspect-ratio:1;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);box-shadow:0 8px 32px rgba(0,0,0,0.55);border-radius:${isTimed?'4px':'8px'};overflow:hidden;"></div>

                <!-- Player timer (bottom) -->
                <div id="timer-you" style="display:${isTimed?'flex':'none'};align-items:center;justify-content:space-between;background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.07);border-radius:4px 4px 8px 8px;padding:10px 16px;margin-top:6px;">
                    <div>
                        <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.6px;">You</div>
                        <div style="font-size:11px;color:var(--muted);margin-top:2px;">${playerColorCode === 'w' ? 'White' : 'Black'}</div>
                    </div>
                    <div id="you-time" style="font-size:2.1rem;font-weight:700;font-family:monospace;color:var(--text);letter-spacing:1px;">${initTime}</div>
                </div>
            </div>

            <!-- RIGHT: status + resign + save + moves -->
            <div style="width:260px;display:flex;flex-direction:column;gap:10px;">

                <!-- Status card -->
                <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 14px;">
                    <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;">Status</div>
                    <div id="game-status" style="font-size:13px;font-weight:600;color:var(--text);">Starting...</div>
                    <div id="engine-status" style="font-size:11px;color:var(--muted);margin-top:3px;">${isEngineBotFlag ? '⚙️ Loading engine...' : '📚 Skill AI'}</div>
                </div>

                <!-- Resign button -->
                <button id="game-resign-btn" style="padding:11px;background:rgba(255,80,80,0.18);color:#ff6b6b;border:1px solid rgba(255,80,80,0.4);border-radius:7px;cursor:pointer;font-weight:600;font-size:13px;">
                    <i class="fas fa-flag"></i> Resign
                </button>

                <!-- Save button -->
                <button id="game-save-btn" style="padding:11px;background:rgba(34,177,76,0.18);color:#22b14c;border:1px solid rgba(34,177,76,0.4);border-radius:7px;cursor:pointer;font-weight:600;font-size:13px;">
                    <i class="fas fa-save"></i> Save Game
                </button>

                <!-- Moves list — BELOW save button -->
                <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 14px;display:flex;flex-direction:column;flex:1;min-height:180px;max-height:340px;">
                    <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">Moves</div>
                    <div id="moves-display" style="overflow-y:auto;flex:1;font-family:monospace;font-size:12px;line-height:1.75;"></div>
                </div>

            </div>
        </div>`;

    mainContent.appendChild(gameContainer);

    // ── Guard ─────────────────────────────────────────────────────────────────
    if (typeof Chess === 'undefined') { alert('Chess library not loaded. Please refresh.'); return; }

    // ── Game state ────────────────────────────────────────────────────────────
    const game      = new Chess();
    let selectedSq  = null;
    let movesList   = savedGameData ? [...savedGameData.moves] : [];
    let whiteTime   = savedGameData ? savedGameData.whiteTime  : timeMinutes * 60;
    let blackTime   = savedGameData ? savedGameData.blackTime  : timeMinutes * 60;
    let timerInt    = null;
    let gameActive  = true;
    let isPlayerTurn;

    if (savedGameData?.fen) { game.load(savedGameData.fen); isPlayerTurn = (game.turn() === playerColorCode); }
    else isPlayerTurn = (playerColorCode === 'w');

    // ── Timer helpers ─────────────────────────────────────────────────────────
    const stopTimer  = () => { clearInterval(timerInt); timerInt = null; };
    const isOver     = () => game.in_checkmate() || game.in_stalemate() || game.in_draw() || game.insufficient_material();

    const updateTimerDisplay = () => {
        const youSecs = playerColorCode === 'w' ? whiteTime : blackTime;
        const oppSecs = playerColorCode === 'w' ? blackTime : whiteTime;
        const ytEl = document.getElementById('you-time');
        const otEl = document.getElementById('opp-time');
        if (ytEl) {
            ytEl.textContent = fmtTime(Math.max(0, youSecs));
            ytEl.style.color = youSecs <= 30 ? '#ff4444' : youSecs <= 60 ? '#ffaa00' : 'var(--text)';
        }
        if (otEl) {
            otEl.textContent = fmtTime(Math.max(0, oppSecs));
            otEl.style.color = oppSecs <= 30 ? '#ff4444' : oppSecs <= 60 ? '#ffaa00' : 'var(--text)';
        }
    };

    const startTimer = () => {
        if (!isTimed) return;
        stopTimer();
        timerInt = setInterval(() => {
            if (!gameActive) { stopTimer(); return; }
            if (game.turn() === 'w') whiteTime = Math.max(0, whiteTime - 1);
            else                     blackTime = Math.max(0, blackTime - 1);
            updateTimerDisplay();
            if (whiteTime <= 0) { endGame(playerColorCode==='w'?'Opponent':'You', 'Time out'); }
            if (blackTime <= 0) { endGame(playerColorCode==='b'?'Opponent':'You', 'Time out'); }
        }, 1000);
    };

    // ── Moves display with piece images ──────────────────────────────────────
    const updateMovesDisplay = () => {
        const el = document.getElementById('moves-display');
        if (!el) return;
        el.innerHTML = '';
        if (!movesList.length) { el.innerHTML = '<span style="color:var(--muted)">No moves yet</span>'; return; }
        for (let i = 0; i < movesList.length; i += 2) {
            const row   = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:1px 0;';

            // Move number
            const num = document.createElement('span');
            num.style.cssText = 'color:#3a9eff;font-weight:700;min-width:24px;font-size:11px;';
            num.textContent   = `${Math.floor(i/2)+1}.`;
            row.appendChild(num);

            // White move
            const wCell = document.createElement('span');
            wCell.style.cssText = 'min-width:60px;display:inline-flex;align-items:center;';
            wCell.appendChild(sanNode(movesList[i], 'w'));
            row.appendChild(wCell);

            // Black move (if exists)
            if (movesList[i+1]) {
                const bCell = document.createElement('span');
                bCell.style.cssText = 'display:inline-flex;align-items:center;';
                bCell.appendChild(sanNode(movesList[i+1], 'b'));
                row.appendChild(bCell);
            }
            el.appendChild(row);
        }
        el.scrollTop = el.scrollHeight;
    };

    // ── Board rendering ───────────────────────────────────────────────────────
    const renderBoard = () => {
        const boardEl = document.getElementById('game-board');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        const flipped = playerColorCode === 'b';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const r = flipped ? row       : (7 - row);
                const c = flipped ? (7 - col) : col;
                const sq      = String.fromCharCode(97 + c) + (r + 1);
                const isLight = (r + c) % 2 === 0;

                const sqEl = document.createElement('div');
                sqEl.className      = 'board-square';
                sqEl.dataset.square = sq;
                sqEl.dataset.light  = isLight ? 'true' : 'false';
                sqEl.style.cssText  = `background:${isLight?'#f0d9b5':'#b58863'};display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:background .12s;`;

                // Rank numbers (left edge)
                if (col === 0) {
                    const lbl = document.createElement('span');
                    lbl.style.cssText = `position:absolute;top:2px;left:3px;font-size:9px;font-weight:700;color:${isLight?'#b58863':'#f0d9b5'};pointer-events:none;line-height:1;`;
                    lbl.textContent   = r + 1;
                    sqEl.appendChild(lbl);
                }
                // File letters (bottom edge)
                if (row === 7) {
                    const lbl = document.createElement('span');
                    lbl.style.cssText = `position:absolute;bottom:2px;right:3px;font-size:9px;font-weight:700;color:${isLight?'#b58863':'#f0d9b5'};pointer-events:none;line-height:1;`;
                    lbl.textContent   = String.fromCharCode(97 + c);
                    sqEl.appendChild(lbl);
                }

                // Legal move dot
                const dot = document.createElement('div');
                dot.className = 'move-dot';
                dot.style.cssText = 'position:absolute;width:30%;height:30%;background:rgba(0,0,0,0.22);border-radius:50%;opacity:0;pointer-events:none;transition:opacity .1s;';
                sqEl.appendChild(dot);

                // Piece image
                const piece = game.get(sq);
                if (piece) {
                    const img = pieceImg(piece.color, piece.type, '80%');
                    img.style.cssText += 'filter:drop-shadow(0 2px 5px rgba(0,0,0,0.35));';
                    sqEl.appendChild(img);
                }

                sqEl.addEventListener('click', () => handleSquareClick(sq));
                boardEl.appendChild(sqEl);
            }
        }
    };

    const clearHighlights = () => {
        document.querySelectorAll('.board-square').forEach(s => {
            s.style.background = s.dataset.light === 'true' ? '#f0d9b5' : '#b58863';
            s.style.outline    = '';
            const d = s.querySelector('.move-dot');
            if (d) d.style.opacity = '0';
        });
    };

    // ── Square click handler ──────────────────────────────────────────────────
    const handleSquareClick = (square) => {
        if (!gameActive || !isPlayerTurn) return;

        const sqEl = document.querySelector(`.board-square[data-square="${square}"]`);

        // No piece selected yet — select one
        if (!selectedSq) {
            const piece = game.get(square);
            if (!piece || piece.color !== playerColorCode) return;
            selectedSq = square;
            if (sqEl) { sqEl.style.background = '#acd742'; sqEl.style.outline = '2px solid #7db128'; }

            // Show dots on legal destination squares
            game.moves({ square, verbose:true }).forEach(m => {
                const t = document.querySelector(`.board-square[data-square="${m.to}"]`);
                if (!t) return;
                const d = t.querySelector('.move-dot');
                if (d) d.style.opacity = '1';
                // Highlight capture squares more visibly
                if (game.get(m.to)) t.style.background = t.dataset.light==='true' ? '#e8c84d' : '#c8a83d';
            });
            return;
        }

        // Piece already selected — attempt move or reselect
        const from = selectedSq;
        selectedSq = null;
        clearHighlights();

        if (from === square) return; // clicked same square → deselect

        const target = game.get(square);
        if (target && target.color === playerColorCode) {
            // Clicked own piece → reselect
            selectedSq = square;
            if (sqEl) { sqEl.style.background = '#acd742'; sqEl.style.outline = '2px solid #7db128'; }
            game.moves({ square, verbose:true }).forEach(m => {
                const t = document.querySelector(`.board-square[data-square="${m.to}"]`);
                if (t) { const d=t.querySelector('.move-dot'); if(d) d.style.opacity='1'; }
            });
            return;
        }

        // Try the move
        const move = game.move({ from, to:square, promotion:'q' });
        if (!move) { renderBoard(); return; } // illegal

        movesList.push(move.san);
        updateMovesDisplay();
        renderBoard();
        stopTimer();

        if (isOver()) { endGame('You', game.in_checkmate()?'Checkmate!':'Draw'); return; }

        isPlayerTurn = false;
        const st = document.getElementById('game-status');
        if (st) { st.textContent = 'Bot thinking...'; st.style.color = 'var(--muted)'; }
        setTimeout(requestBotMove, 250);
    };

    // ── Bot move ──────────────────────────────────────────────────────────────
    const requestBotMove = async () => {
        if (!gameActive) return;
        try {
            const uci = await botInstance.getMove(game.fen());
            if (uci) { applyBotMove(uci); return; }
        } catch(e) { console.error('Bot error:', e); }
        applyFallback();
    };

    const applyBotMove = (uci) => {
        if (!uci || uci.length < 4) { applyFallback(); return; }
        try {
            const mo = game.move({ from:uci.slice(0,2), to:uci.slice(2,4), promotion:uci[4]||'q' });
            if (!mo) { applyFallback(); return; }
            console.log(`✅ ${bot.name} plays: ${mo.san}`);
            movesList.push(mo.san);
            updateMovesDisplay();
            renderBoard();
            const st = document.getElementById('game-status');
            if (st) { st.textContent = 'Your turn'; st.style.color = 'var(--text)'; }
            if (isOver()) { endGame(game.in_checkmate()?'You':'Draw', game.in_checkmate()?'Checkmate!':'Draw'); return; }
            isPlayerTurn = true;
            startTimer();
        } catch(e) { applyFallback(); }
    };

    const applyFallback = () => {
        const moves = game.moves({ verbose:true });
        if (!moves.length) { endGame('Draw','No legal moves'); return; }
        const pick = moves[Math.floor(Math.random()*moves.length)];
        const mo   = game.move({ from:pick.from, to:pick.to, promotion:pick.promotion||'q' });
        if (mo) {
            movesList.push(mo.san);
            updateMovesDisplay();
            renderBoard();
            if (isOver()) { endGame('Draw', 'Draw'); return; }
            isPlayerTurn = true;
            startTimer();
        }
    };

    const endGame = (winner, reason) => {
        gameActive = false;
        stopTimer();
        const st = document.getElementById('game-status');
        if (st) { st.textContent = `${winner} — ${reason}`; st.style.color = winner==='You'?'#22b14c':'#ff6b6b'; }
        const rb = document.getElementById('game-resign-btn');
        if (rb) rb.disabled = true;
        setTimeout(() => alert(`Game Over!\n\n${winner} wins by ${reason}`), 150);
    };

    // ── Button events ─────────────────────────────────────────────────────────
    document.getElementById('game-exit-btn').addEventListener('click', () => {
        if (!confirm('Exit the current game?')) return;
        gameActive = false; stopTimer();
        gameContainer.remove();
        if (botsContainer) botsContainer.style.display = 'block';
    });

    document.getElementById('game-resign-btn').addEventListener('click', () => {
        if (!gameActive || !confirm('Resign this game?')) return;
        gameActive = false; stopTimer();
        endGame('Opponent', 'Resignation');
    });

    document.getElementById('game-save-btn').addEventListener('click', () => {
        if (!gameActive) { alert('Game already finished!'); return; }
        localStorage.setItem('savedChessGame', JSON.stringify({
            botName:bot.name, botRating:bot.rating, playerColor,
            fen:game.fen(), moves:movesList, whiteTime, blackTime,
            timestamp: new Date().toISOString(),
        }));
        alert('Game saved! Resume it next time you visit.');
    });

    // ── Start ─────────────────────────────────────────────────────────────────
    console.log(`\n🤖 Game started: You vs ${bot.name} (${bot.rating})`);
    console.log(`   You play: ${playerColor} | Bot: ${botColorCode} | Timed: ${isTimed}`);
    renderBoard();
    updateMovesDisplay();
    updateTimerDisplay();
    const st = document.getElementById('game-status');
    if (st) st.textContent = isPlayerTurn ? 'Your turn' : 'Bot thinking...';
    if (isTimed) startTimer();
    if (!isPlayerTurn) setTimeout(requestBotMove, 500);
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────
const modal = document.getElementById('game-setup-modal');
let selectedBot = null;

const openModal = (bot) => {
    selectedBot = bot;
    modal.classList.add('active');
    const av = document.getElementById('modal-bot-avatar');
    if (av) { av.textContent = bot.code || bot.name.charAt(0); av.className = 'bot-avatar-large' + (bot.isEngine?' engine-avatar':''); }
    const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
    set('modal-bot-name',   bot.name);
    set('modal-bot-rating', bot.rating);
    set('modal-bot-style',  bot.style);
};
const closeModalFn = () => { modal.classList.remove('active'); selectedBot = null; };

document.querySelector('.close-modal')?.addEventListener('click', closeModalFn);
document.getElementById('cancel-game')?.addEventListener('click', closeModalFn);
modal?.addEventListener('click', e => { if (e.target === modal) closeModalFn(); });

document.getElementById('timed-game')?.addEventListener('change', e => {
    const tg = document.getElementById('time-control-group');
    if (tg) tg.style.display = e.target.checked ? 'block' : 'none';
});
document.querySelectorAll('[data-color]').forEach(btn => {
    btn.addEventListener('click', () => { document.querySelectorAll('[data-color]').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); });
});
document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => { document.querySelectorAll('[data-mode]').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); });
});

document.getElementById('start-game')?.addEventListener('click', () => {
    if (!selectedBot) return;
    let color = document.querySelector('[data-color].active')?.dataset.color || 'white';
    if (color === 'random') color = Math.random() > 0.5 ? 'white' : 'black';
    const timed       = document.getElementById('timed-game')?.checked || false;
    const timeMinutes = timed ? parseInt(document.getElementById('time-select')?.value || '10') : 0;
    const b = selectedBot;
    closeModalFn();
    playWithBot(b, color, timeMinutes);
});

// ─────────────────────────────────────────────────────────────────────────────
// FILTERS & SEARCH
// ─────────────────────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        renderBots(btn.dataset.filter, document.getElementById('bot-search')?.value||'', document.getElementById('rating-search')?.value||'');
    });
});
document.getElementById('bot-search')?.addEventListener('input', e => {
    renderBots(document.querySelector('.filter-btn.active')?.dataset.filter||'all', e.target.value, document.getElementById('rating-search')?.value||'');
});
document.getElementById('rating-search')?.addEventListener('input', e => {
    renderBots(document.querySelector('.filter-btn.active')?.dataset.filter||'all', document.getElementById('bot-search')?.value||'', e.target.value);
});

const rcaSlider = document.getElementById('rca-engine-strength');
const rcaValue  = document.getElementById('rca-engine-value');
if (rcaSlider && rcaValue) rcaSlider.addEventListener('input', e => { rcaValue.textContent = e.target.value; });

// ─────────────────────────────────────────────────────────────────────────────
// RESUME SAVED GAME
// ─────────────────────────────────────────────────────────────────────────────
const checkForResumedGame = () => {
    const saved = localStorage.getItem('savedChessGame');
    if (!saved) return;
    try {
        const gd     = JSON.parse(saved);
        const banner = document.getElementById('resume-game-banner');
        if (!banner) return;
        banner.style.display = 'flex';
        const ri = document.getElementById('resume-game-info');
        if (ri) ri.textContent = `Resume vs ${gd.botName} (${gd.botRating}) — ${gd.moves.length} moves`;
        const rb = document.getElementById('resume-game-btn');
        if (rb) rb.onclick = () => {
            const b = Object.values(botsData).flat().find(x => x.name===gd.botName && x.rating===gd.botRating)
                   || { name:gd.botName, rating:gd.botRating, style:'Resumed game', crowns:0 };
            banner.style.display = 'none';
            localStorage.removeItem('savedChessGame');
            playWithBot(b, gd.playerColor, Math.ceil((gd.whiteTime||600)/60), gd);
        };
    } catch(e) {}
};

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
loadBotProgress();
renderBots();
updateFilterCounts();
updatePageSubtitle('all', '', '');
checkForResumedGame();
logAllBotsDatabase();

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
window.scrollToRCAEngine   = () => document.querySelector('.rca-engine-card')?.scrollIntoView({ behavior:'smooth', block:'center' });
window.openCustomBotCreator = () => alert('Custom Bot Creator — PREMIUM ONLY.\nUpgrade to Premium to unlock!');
window.updateBotCrowns     = (id,c) => { const b=Object.values(botsData).flat().find(x=>x.id===id); if(b){b.crowns=Math.max(b.crowns,c);saveBotProgress();renderBots();} };
window.resetBotProgress    = () => { if(!confirm('Reset all progress?'))return; localStorage.removeItem('botProgress'); Object.values(botsData).flat().forEach(b=>b.crowns=0); renderBots(); alert('Reset!'); };
window.getAllBots           = getAllBotsDatabase;
window.exportBotsJSON      = () => { const j=exportBotsAsJSON(); navigator.clipboard?.writeText(j).then(()=>alert('Copied!')); return j; };
window.exportBotsCSV       = () => { const c=exportBotsAsCSV(); const b=new Blob([c],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='bots.csv'; a.click(); URL.revokeObjectURL(u); return c; };
window.logBotsDatabase     = logAllBotsDatabase;
window.findBotByRating     = r => { const res=getAllBotsDatabase().filter(b=>Math.abs(b.rating-r)<=50); console.log(res); return res; };
window.findBotByName       = n => { const res=getAllBotsDatabase().filter(b=>b.name.toLowerCase().includes(n.toLowerCase())); console.log(res); return res; };

console.log('\n✅ bot.js ready | window.getAllBots() | exportBotsJSON() | exportBotsCSV() | findBotByRating(r) | findBotByName(n)\n');

}); // end DOMContentLoaded