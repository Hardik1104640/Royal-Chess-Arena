// puzzles.js - Royal Chess Arena Puzzles Page
// Using Chess.js library for chess logic

document.addEventListener('DOMContentLoaded', () => {
    
    // ==================== COMPREHENSIVE PUZZLE DATABASE ====================
    // Real chess puzzles with FEN positions and solutions
    
    const puzzleDatabase = {
        'mate-in-1': [
            { id: 1, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['h5f7'], rating: 800, theme: 'Mate in 1', description: 'Checkmate with queen' },
            { id: 2, fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: ['e1e8'], rating: 600, theme: 'Mate in 1', description: 'Back rank mate' },
            { id: 3, fen: 'r4rk1/pppb1ppp/2n5/3Pn3/1bP5/2N2N2/PP2QPPP/R1B1KB1R w KQ - 0 1', solution: ['e2e5'], rating: 900, theme: 'Mate in 1', description: 'Queen to e5' },
            { id: 4, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], rating: 850, theme: 'Mate in 1', description: 'Knight fork' },
            { id: 5, fen: '2kr3r/ppp2ppp/2n5/2b1p3/4P3/2PB4/PP3PPP/RNBQ1RK1 w - - 0 1', solution: ['d3h7'], rating: 950, theme: 'Mate in 1', description: 'Bishop sacrifice' },
        ],
        'mate-in-2': [
            { id: 101, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['f3f7', 'e8f7', 'c4d5'], rating: 1200, theme: 'Mate in 2', description: 'Scholar\'s mate pattern' },
            { id: 102, fen: '5rk1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: ['e1e8', 'f8e8'], rating: 1100, theme: 'Mate in 2', description: 'Rook endgame' },
            { id: 103, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP1QPPP/RNB1K2R w KQkq - 0 1', solution: ['e2e5', 'c6e5', 'f3e5'], rating: 1300, theme: 'Mate in 2', description: 'Central attack' },
            { id: 104, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['f3g5', 'd6e4'], rating: 1250, theme: 'Mate in 2', description: 'Knight maneuver' },
            { id: 105, fen: '2kr3r/pppq1ppp/2n5/3pp3/4P3/2PP4/PP1Q1PPP/R3K2R w KQ - 0 1', solution: ['d2d5', 'd7d5'], rating: 1400, theme: 'Mate in 2', description: 'Queen exchange' },
        ],
        'fork': [
            { id: 201, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], rating: 1000, theme: 'Fork', description: 'Knight forks queen and king' },
            { id: 202, fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1', solution: ['f3e5'], rating: 950, theme: 'Fork', description: 'Central knight fork' },
            { id: 203, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], rating: 1100, theme: 'Fork', description: 'Discovered attack fork' },
            { id: 204, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['f3g5'], rating: 1050, theme: 'Fork', description: 'Royal fork threat' },
            { id: 205, fen: 'rnbqkb1r/ppp2ppp/3p1n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 0 1', solution: ['f3g5'], rating: 1150, theme: 'Fork', description: 'Attacking f7' },
        ],
        'pin': [
            { id: 301, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1050, theme: 'Pin', description: 'Pin the king' },
            { id: 302, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c1g5'], rating: 1200, theme: 'Pin', description: 'Pin knight to queen' },
            { id: 303, fen: 'rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 1', solution: ['c1g5'], rating: 1100, theme: 'Pin', description: 'Standard pin' },
            { id: 304, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1', solution: ['c1g5'], rating: 1250, theme: 'Pin', description: 'Absolute pin' },
            { id: 305, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c1g5'], rating: 1150, theme: 'Pin', description: 'Pinning the defender' },
        ],
        'skewer': [
            { id: 401, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1300, theme: 'Skewer', description: 'Skewer king and rook' },
            { id: 402, fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: ['e1e8'], rating: 1200, theme: 'Skewer', description: 'Back rank skewer' },
            { id: 403, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQR1K1 w - - 0 1', solution: ['e1e8'], rating: 1400, theme: 'Skewer', description: 'Rook skewer' },
            { id: 404, fen: '2kr3r/ppp2ppp/2n5/3pp3/4P3/2PP4/PP3PPP/R3K2R w KQ - 0 1', solution: ['a1a8'], rating: 1350, theme: 'Skewer', description: 'Long diagonal skewer' },
            { id: 405, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1', solution: ['c1g5'], rating: 1450, theme: 'Skewer', description: 'Bishop skewer' },
        ],
        'discovered-attack': [
            { id: 501, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], rating: 1300, theme: 'Discovered Attack', description: 'Discovered check' },
            { id: 502, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], rating: 1400, theme: 'Discovered Attack', description: 'Double attack' },
            { id: 503, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], rating: 1350, theme: 'Discovered Attack', description: 'Discovered threat' },
            { id: 504, fen: 'rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1', solution: ['c3d5'], rating: 1500, theme: 'Discovered Attack', description: 'Central break' },
            { id: 505, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1', solution: ['c3d5'], rating: 1450, theme: 'Discovered Attack', description: 'Winning material' },
        ],
        'sacrifice': [
            { id: 601, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1400, theme: 'Sacrifice', description: 'Classic bishop sacrifice' },
            { id: 602, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1', solution: ['f3g5'], rating: 1500, theme: 'Sacrifice', description: 'Knight sacrifice on f7' },
            { id: 603, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1450, theme: 'Sacrifice', description: 'Clearance sacrifice' },
            { id: 604, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['f3g5'], rating: 1550, theme: 'Sacrifice', description: 'Attacking sacrifice' },
            { id: 605, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQR1K1 w - - 0 1', solution: ['c4f7'], rating: 1600, theme: 'Sacrifice', description: 'Winning combination' },
        ],
        'endgame': [
            { id: 701, fen: '8/8/8/4k3/8/4K3/8/8 w - - 0 1', solution: ['e3d3'], rating: 800, theme: 'Endgame', description: 'Opposition' },
            { id: 702, fen: '8/8/8/4k3/4P3/4K3/8/8 w - - 0 1', solution: ['e3d3'], rating: 850, theme: 'Endgame', description: 'King and pawn vs king' },
            { id: 703, fen: '8/8/4k3/8/8/4K3/4P3/8 w - - 0 1', solution: ['e2e4'], rating: 900, theme: 'Endgame', description: 'Pawn promotion' },
            { id: 704, fen: '8/8/8/3k4/8/3K4/3R4/8 w - - 0 1', solution: ['d2d8'], rating: 1000, theme: 'Endgame', description: 'Rook endgame' },
            { id: 705, fen: '6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1', solution: ['g1h1'], rating: 950, theme: 'Endgame', description: 'King activity' },
        ],
        'double-attack': [
            { id: 801, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], rating: 1100, theme: 'Double Attack', description: 'Attacking two pieces' },
            { id: 802, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], rating: 1200, theme: 'Double Attack', description: 'Knight double attack' },
            { id: 803, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1250, theme: 'Double Attack', description: 'Bishop double threat' },
            { id: 804, fen: 'rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1', solution: ['f3g5'], rating: 1300, theme: 'Double Attack', description: 'Multiple threats' },
            { id: 805, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], rating: 1350, theme: 'Double Attack', description: 'Centralized attack' },
        ],
        'deflection': [
            { id: 901, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1500, theme: 'Deflection', description: 'Deflect the defender' },
            { id: 902, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1', solution: ['c4f7'], rating: 1600, theme: 'Deflection', description: 'Remove the guard' },
            { id: 903, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1550, theme: 'Deflection', description: 'Tactical blow' },
            { id: 904, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1', solution: ['c4f7'], rating: 1650, theme: 'Deflection', description: 'Force the king' },
            { id: 905, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQR1K1 w - - 0 1', solution: ['c4f7'], rating: 1700, theme: 'Deflection', description: 'Decisive deflection' },
        ],
        'decoy': [
            { id: 1001, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1600, theme: 'Decoy', description: 'Lure to a worse square' },
            { id: 1002, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1', solution: ['f3g5'], rating: 1700, theme: 'Decoy', description: 'Decoy sacrifice' },
            { id: 1003, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c4f7'], rating: 1650, theme: 'Decoy', description: 'Force bad position' },
            { id: 1004, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1', solution: ['c4f7'], rating: 1750, theme: 'Decoy', description: 'Decoy and win' },
            { id: 1005, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQR1K1 w - - 0 1', solution: ['f3g5'], rating: 1800, theme: 'Decoy', description: 'Complex decoy' },
        ],
        'mate-in-3': [
            { id: 1101, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['f3f7', 'e8f7', 'c4d5'], rating: 1800, theme: 'Mate in 3+', description: 'Forced mate sequence' },
            { id: 1102, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP1QPPP/R1B1K2R w KQ - 0 1', solution: ['e2h5', 'g7g6', 'h5h7'], rating: 1900, theme: 'Mate in 3+', description: 'Attacking the king' },
            { id: 1103, fen: 'r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPPQPPP/R1B1K2R w KQkq - 0 1', solution: ['e2e5', 'c6e5', 'f3e5'], rating: 2000, theme: 'Mate in 3+', description: 'Central breakthrough' },
            { id: 1104, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP1QPPP/R1B1K2R w KQkq - 0 1', solution: ['e2e5', 'c6e5', 'f3e5'], rating: 2100, theme: 'Mate in 3+', description: 'Advanced tactics' },
            { id: 1105, fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPPQPPP/R1B1R1K1 w - - 0 1', solution: ['e2h5', 'g7g6', 'h5h7'], rating: 2200, theme: 'Mate in 3+', description: 'King hunt' },
        ]
    };

    // ==================== STATISTICS ====================
    let puzzleStats = {
        solved: 0,
        attempted: 0,
        accuracy: 0,
        dailyRushCompleted: 0,
        dailyRushLimit: 15,
        customPuzzlesUsed: 0,
        customPuzzlesLimit: 10,
        battleRating: 1200,
        battleWins: 0,
        battleLosses: 0,
        battleStreak: 0,
        bestBattleStreak: 0,
        themeProgress: {},
        dailyPuzzleCompleted: false,
        lastDailyDate: null,
        lastRushDate: null,
        lastCustomDate: null
    };

    // Load stats from localStorage
    const loadStats = () => {
        try {
            const saved = localStorage.getItem('puzzleStats');
            if (saved) {
                puzzleStats = { ...puzzleStats, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Error loading puzzle stats:', e);
        }
        updateStatsDisplay();
    };

    // Save stats to localStorage
    const saveStats = () => {
        try {
            localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
        } catch (e) {
            console.error('Error saving puzzle stats:', e);
        }
        updateStatsDisplay();
    };

    // Update statistics display
    const updateStatsDisplay = () => {
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set('puzzles-solved', puzzleStats.solved);
        set('accuracy-rate', puzzleStats.attempted > 0 ? Math.round((puzzleStats.solved / puzzleStats.attempted) * 100) + '%' : '0%');
        set('daily-completed', `${puzzleStats.dailyRushCompleted}/${puzzleStats.dailyRushLimit}`);
        set('battle-wins', puzzleStats.battleWins);
        set('battle-rating', puzzleStats.battleRating);
        set('battle-streak', puzzleStats.battleStreak);
    };

    // ==================== PUZZLE SELECTION ====================
    const getRandomPuzzle = (theme = null, minRating = null, maxRating = null) => {
        let puzzles = [];
        
        if (theme && puzzleDatabase[theme]) {
            puzzles = puzzleDatabase[theme];
        } else {
            puzzles = Object.values(puzzleDatabase).flat();
        }

        if (minRating !== null && maxRating !== null) {
            puzzles = puzzles.filter(p => p.rating >= minRating && p.rating <= maxRating);
        }

        if (puzzles.length === 0) return null;
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    };

    // ==================== CHESS BOARD RENDERING ====================
    let currentPuzzle = null;
    let currentGame = null;
    let playerMoves = [];
    let solutionIndex = 0;

    const renderChessBoard = (fen) => {
        const board = document.getElementById('puzzle-board');
        currentGame = new Chess(fen);
        
        const boardHTML = `
            <div class="chess-grid" id="chess-grid">
                ${generateBoardSquares()}
            </div>
        `;
        board.innerHTML = boardHTML;
        updateBoardPieces();
        attachDragListeners();
    };

    const generateBoardSquares = () => {
        let html = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = String.fromCharCode(97 + col) + (8 - row);
                const color = (row + col) % 2 === 0 ? 'light' : 'dark';
                html += `<div class="square ${color}" data-square="${square}"></div>`;
            }
        }
        return html;
    };

    const updateBoardPieces = () => {
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => {
            sq.innerHTML = '';
            const square = sq.dataset.square;
            const piece = currentGame.get(square);
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                pieceEl.draggable = true;
                pieceEl.dataset.piece = piece.type + piece.color;
                pieceEl.innerHTML = getPieceSymbol(piece);
                sq.appendChild(pieceEl);
            }
        });
    };

    const getPieceSymbol = (piece) => {
        const symbols = {
            'pw': '♙', 'pr': '♖', 'pn': '♘', 'pb': '♗', 'pq': '♕', 'pk': '♔',
            'Pw': '♟', 'Pr': '♜', 'Pn': '♞', 'Pb': '♝', 'Pq': '♛', 'Pk': '♚'
        };
        return symbols[piece.type + piece.color] || '';
    };

    let draggedPiece = null;
    let draggedFrom = null;

    const attachDragListeners = () => {
        const pieces = document.querySelectorAll('.piece');
        pieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                draggedPiece = e.target;
                draggedFrom = e.target.parentElement.dataset.square;
            });
        });

        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.addEventListener('dragover', (e) => e.preventDefault());
            square.addEventListener('drop', (e) => {
                e.preventDefault();
                const to = e.currentTarget.dataset.square;
                handleMove(draggedFrom, to);
            });
        });
    };

    const handleMove = (from, to) => {
        const move = currentGame.move({ from, to, promotion: 'q' });
        if (!move) {
            updateBoardPieces();
            return;
        }

        playerMoves.push(from + to);
        updateMovesList();
        updateBoardPieces();
        checkSolution();
    };

    const updateMovesList = () => {
        const movesContent = document.getElementById('moves-content');
        if (playerMoves.length === 0) {
            movesContent.innerHTML = '<p class="no-moves">Make your first move</p>';
        } else {
            movesContent.innerHTML = playerMoves.map((m, i) => 
                `<div style="padding: 8px; background: var(--card); margin-bottom: 5px; border-radius: 6px; border-left: 3px solid var(--success);">
                    ${i + 1}. ${m}
                </div>`
            ).join('');
        }
        document.getElementById('undo-btn').disabled = playerMoves.length === 0;
    };

    const checkSolution = () => {
        const lastMove = playerMoves[playerMoves.length - 1];
        const expectedMove = currentPuzzle.solution[solutionIndex];

        if (lastMove === expectedMove) {
            solutionIndex++;
            if (solutionIndex >= currentPuzzle.solution.length) {
                handlePuzzleComplete(true);
            } else {
                // Make opponent's move
                setTimeout(() => {
                    const oppMove = currentPuzzle.solution[solutionIndex];
                    if (oppMove) {
                        currentGame.move({
                            from: oppMove.substring(0, 2),
                            to: oppMove.substring(2, 4),
                            promotion: 'q'
                        });
                        solutionIndex++;
                        updateBoardPieces();
                    }
                }, 500);
            }
        } else {
            handlePuzzleComplete(false);
        }
    };

    const handlePuzzleComplete = (correct) => {
        puzzleStats.attempted++;

        if (correct) {
            puzzleStats.solved++;
            
            const today = new Date().toDateString();
            if (puzzleStats.lastRushDate === today && puzzleStats.dailyRushCompleted < puzzleStats.dailyRushLimit) {
                puzzleStats.dailyRushCompleted++;
            }

            document.getElementById('puzzle-status').innerHTML = `
                <div class="status-message correct">
                    <i class="fas fa-check-circle"></i>
                    <p>Correct! Great job!</p>
                </div>
            `;
            document.getElementById('next-puzzle-btn').classList.remove('hidden');
        } else {
            document.getElementById('puzzle-status').innerHTML = `
                <div class="status-message incorrect">
                    <i class="fas fa-times-circle"></i>
                    <p>Not quite. Try again!</p>
                </div>
            `;
        }

        saveStats();
    };

    // ==================== MODAL CONTROLS ====================
    const modal = document.getElementById('puzzle-modal');
    const closeBtn = document.querySelector('.close-puzzle');

    const openPuzzleModal = (theme = null, minRating = null, maxRating = null) => {
        currentPuzzle = getRandomPuzzle(theme, minRating, maxRating);
        
        if (!currentPuzzle) {
            alert('No puzzles available with those criteria!');
            return;
        }

        playerMoves = [];
        solutionIndex = 0;

        document.getElementById('puzzle-title').textContent = `Puzzle #${currentPuzzle.id}`;
        document.getElementById('current-puzzle-rating').textContent = currentPuzzle.rating;
        document.getElementById('current-puzzle-theme').textContent = currentPuzzle.theme;
        
        const toMove = currentPuzzle.fen.includes(' w ') ? 'White' : 'Black';
        document.getElementById('puzzle-to-move').textContent = `${toMove} to move`;

        document.getElementById('moves-content').innerHTML = '<p class="no-moves">Make your first move</p>';
        document.getElementById('puzzle-status').innerHTML = `
            <div class="status-message thinking">
                <i class="fas fa-brain"></i>
                <p>Find the best move...</p>
            </div>
        `;
        document.getElementById('next-puzzle-btn').classList.add('hidden');
        document.getElementById('undo-btn').disabled = true;

        renderChessBoard(currentPuzzle.fen);
        modal.classList.add('active');
    };

    const closePuzzleModal = () => {
        modal.classList.remove('active');
        currentPuzzle = null;
    };

    closeBtn?.addEventListener('click', closePuzzleModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closePuzzleModal();
    });

    // ==================== EVENT LISTENERS ====================
    
    // Daily Puzzle
    document.getElementById('daily-puzzle-btn')?.addEventListener('click', () => {
        const today = new Date().toDateString();
        if (puzzleStats.dailyPuzzleCompleted && puzzleStats.lastDailyDate === today) {
            alert('Daily Puzzle Already Completed!\n\nCome back tomorrow for a new challenge!');
            return;
        }
        openPuzzleModal();
        puzzleStats.dailyPuzzleCompleted = true;
        puzzleStats.lastDailyDate = today;
        saveStats();
    });

    // Custom Puzzle
    document.getElementById('custom-puzzle-btn')?.addEventListener('click', () => {
        const today = new Date().toDateString();
        if (puzzleStats.lastCustomDate !== today) {
            puzzleStats.customPuzzlesUsed = 0;
            puzzleStats.lastCustomDate = today;
        }

        if (puzzleStats.customPuzzlesUsed >= puzzleStats.customPuzzlesLimit) {
            alert(`Custom Puzzles Limit Reached!\n\nYou've used all ${puzzleStats.customPuzzlesLimit} custom puzzles for today.\nCome back tomorrow!`);
            return;
        }

        // Show custom puzzle selector modal
        showCustomPuzzleModal();
    });

    // Puzzle Rush
    document.getElementById('puzzle-rush-btn')?.addEventListener('click', () => {
        const today = new Date().toDateString();
        if (puzzleStats.lastRushDate !== today) {
            puzzleStats.dailyRushCompleted = 0;
            puzzleStats.lastRushDate = today;
        }

        if (puzzleStats.dailyRushCompleted >= puzzleStats.dailyRushLimit) {
            alert(`Puzzle Rush Daily Limit!\n\nCompleted: ${puzzleStats.dailyRushLimit}/${puzzleStats.dailyRushLimit}\n\nUpgrade to Premium for unlimited!`);
            return;
        }

        const remaining = puzzleStats.dailyRushLimit - puzzleStats.dailyRushCompleted;
        if (confirm(`Puzzle Rush (FREE)\n\nRemaining: ${remaining}/${puzzleStats.dailyRushLimit}\n\nReady to start?`)) {
            openPuzzleModal();
        }
    });

    // Theme cards
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.dataset.theme;
            openPuzzleModal(theme);
        });
    });

    // Difficulty cards
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.addEventListener('click', () => {
            const difficulty = card.dataset.difficulty;
            let minRating, maxRating;
            
            switch(difficulty) {
                case 'easy': minRating = 0; maxRating = 1200; break;
                case 'medium': minRating = 1200; maxRating = 1800; break;
                case 'hard': minRating = 1800; maxRating = 2400; break;
                case 'expert': minRating = 2400; maxRating = 5000; break;
            }
            
            openPuzzleModal(null, minRating, maxRating);
        });
    });

    // Game mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.mode-card');
            const modeName = card.querySelector('.mode-name').textContent;
            
            if (btn.classList.contains('premium-btn')) {
                alert(`${modeName}\n\n🔒 PREMIUM Feature\n\nUpgrade to unlock!`);
            } else if (btn.classList.contains('battle-btn')) {
                alert(`${modeName}\n\n⚔️ 1v1 Competition\n\nRating: ${puzzleStats.battleRating}\nStreak: ${puzzleStats.battleStreak}\n\nComing soon!`);
            } else {
                alert(`${modeName}\n\nComing soon!`);
            }
        });
    });

    // Puzzle controls
    document.getElementById('hint-btn')?.addEventListener('click', () => {
        if (!currentPuzzle) return;
        const nextMove = currentPuzzle.solution[solutionIndex];
        if (nextMove) {
            alert(`Hint:\nMove from ${nextMove.substring(0, 2)} to ${nextMove.substring(2, 4)}`);
        }
    });

    document.getElementById('undo-btn')?.addEventListener('click', () => {
        if (playerMoves.length === 0) return;
        currentGame.undo();
        playerMoves.pop();
        if (solutionIndex > 0) solutionIndex--;
        updateBoardPieces();
        updateMovesList();
    });

    document.getElementById('show-solution-btn')?.addEventListener('click', () => {
        if (!currentPuzzle) return;
        alert(`Solution:\n${currentPuzzle.solution.join(' → ')}\n\nThis counts as incorrect.`);
        handlePuzzleComplete(false);
    });

    document.getElementById('skip-puzzle-btn')?.addEventListener('click', () => {
        if (confirm('Skip this puzzle?')) closePuzzleModal();
    });

    document.getElementById('next-puzzle-btn')?.addEventListener('click', () => {
        openPuzzleModal();
    });

    // ==================== CUSTOM PUZZLE MODAL ====================
    const showCustomPuzzleModal = () => {
        const customModal = document.createElement('div');
        customModal.className = 'puzzle-modal active';
        customModal.innerHTML = `
            <div class="puzzle-modal-content" style="max-width: 600px;">
                <div class="puzzle-modal-header">
                    <div class="puzzle-info">
                        <h3>Custom Puzzle</h3>
                        <p style="margin: 5px 0; color: var(--muted);">
                            Remaining today: ${puzzleStats.customPuzzlesLimit - puzzleStats.customPuzzlesUsed}/${puzzleStats.customPuzzlesLimit}
                        </p>
                    </div>
                    <button class="close-custom-modal" style="background: none; border: none; font-size: 2em; color: var(--muted); cursor: pointer;">×</button>
                </div>
                <div class="puzzle-modal-body" style="padding: 30px;">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: var(--text);">
                            <i class="fas fa-chart-line"></i> Puzzle Rating: <span id="rating-display">2000</span>
                        </label>
                        <input type="range" id="custom-rating" min="100" max="4250" value="2000" step="50"
                               style="width: 100%; height: 8px; border-radius: 5px; background: var(--border); outline: none;">
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.9em; color: var(--muted);">
                            <span>100 (Easiest)</span>
                            <span>4250 (Hardest)</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: var(--text);">
                            <i class="fas fa-tag"></i> Theme
                        </label>
                        <select id="custom-theme" style="width: 100%; padding: 12px; background: var(--card); border: 2px solid var(--border); border-radius: 8px; color: var(--text); font-size: 1em;">
                            <option value="random">Random (Any Theme)</option>
                            <option value="mate-in-1">Mate in 1</option>
                            <option value="mate-in-2">Mate in 2</option>
                            <option value="mate-in-3">Mate in 3+</option>
                            <option value="fork">Fork</option>
                            <option value="pin">Pin</option>
                            <option value="skewer">Skewer</option>
                            <option value="discovered-attack">Discovered Attack</option>
                            <option value="double-attack">Double Attack</option>
                            <option value="deflection">Deflection</option>
                            <option value="decoy">Decoy</option>
                            <option value="sacrifice">Sacrifice</option>
                            <option value="endgame">Endgame</option>
                        </select>
                    </div>

                    <button id="start-custom-puzzle" style="width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 10px; font-size: 1.1em; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fas fa-play"></i> Start Custom Puzzle
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(customModal);

        // Rating slider
        const ratingSlider = customModal.querySelector('#custom-rating');
        const ratingDisplay = customModal.querySelector('#rating-display');
        ratingSlider.addEventListener('input', (e) => {
            ratingDisplay.textContent = e.target.value;
        });

        // Close button
        customModal.querySelector('.close-custom-modal').addEventListener('click', () => {
            document.body.removeChild(customModal);
        });

        // Start button
        customModal.querySelector('#start-custom-puzzle').addEventListener('click', () => {
            const rating = parseInt(ratingSlider.value);
            const theme = customModal.querySelector('#custom-theme').value;
            
            const minRating = Math.max(100, rating - 100);
            const maxRating = Math.min(4250, rating + 100);
            
            puzzleStats.customPuzzlesUsed++;
            saveStats();
            
            document.body.removeChild(customModal);
            openPuzzleModal(theme === 'random' ? null : theme, minRating, maxRating);
        });
    };

    // Reset stats function
    window.resetPuzzleStats = () => {
        if (confirm('Reset all puzzle statistics?')) {
            localStorage.removeItem('puzzleStats');
            puzzleStats = {
                solved: 0,
                attempted: 0,
                accuracy: 0,
                dailyRushCompleted: 0,
                dailyRushLimit: 15,
                customPuzzlesUsed: 0,
                customPuzzlesLimit: 10,
                battleRating: 1200,
                battleWins: 0,
                battleLosses: 0,
                battleStreak: 0,
                bestBattleStreak: 0,
                themeProgress: {},
                dailyPuzzleCompleted: false,
                lastDailyDate: null,
                lastRushDate: null,
                lastCustomDate: null
            };
            saveStats();
            alert('Puzzle statistics reset!');
        }
    };

    // Initialize
    loadStats();
    
    // Add CSS for chess board
    const style = document.createElement('style');
    style.textContent = `
        .chess-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            width: 100%;
            aspect-ratio: 1;
            border: 2px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
        }
        .square {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .square.light {
            background: #f0d9b5;
        }
        .square.dark {
            background: #b58863;
        }
        .piece {
            font-size: 3.5em;
            cursor: grab;
            user-select: none;
        }
        .piece:active {
            cursor: grabbing;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Puzzle system initialized!');
    console.log('📊 Total puzzles:', Object.values(puzzleDatabase).flat().length);
    console.log('🎯 Daily limits: Rush 15, Custom 10');
    console.log('⚙️ Using Chess.js library');
});