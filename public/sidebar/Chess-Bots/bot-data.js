// =============================================================================
//  bot-data.js
//  Pure data: bot roster, piece values, piece-square tables, opening book.
//  No Chess.js dependency. Load this FIRST.
//  Load order: bot-data.js → bot-engine.js → bot-backend.js
// =============================================================================
console.log('🔄 bot-data.js: Loading...');
try {

// ── ALL 183 BOTS ──────────────────────────────────────────────────────────────
const BOTS = [
    // Chess GMs (generic placeholders)
    { id:1,   name:"Alexei",          elo:2867, category:"Chess GM",  locked:false },
    { id:2,   name:"Bahar",          elo:2807, category:"Chess GM",  locked:false },
    { id:3,   name:"Chakri",          elo:2784, category:"Chess GM",  locked:false },
    { id:4,   name:"Darius",          elo:2785, category:"Chess GM",  locked:false },
    { id:5,   name:"Ezra",          elo:2777, category:"Chess GM",  locked:false },
    { id:6,   name:"Faisal",          elo:2780, category:"Chess GM",  locked:false },
    { id:7,   name:"Gavin",          elo:2754, category:"Chess GM",  locked:false },
    { id:8,   name:"Hasan",          elo:2764, category:"Chess GM",  locked:false },
    { id:9,   name:"Igor",          elo:2743, category:"Chess GM",  locked:false },
    { id:10,  name:"Javier",         elo:2749, category:"Chess GM",  locked:false },
    { id:11,  name:"Karthik",         elo:2739, category:"Chess GM",  locked:false },
    { id:12,  name:"Leonid",     elo:2747, category:"Chess GM",  locked:false },
    { id:13,  name:"Mikhail",         elo:2750, category:"Chess GM",  locked:false },
    { id:14,  name:"Nikolai",         elo:2735, category:"Chess GM",  locked:false },
    { id:15,  name:"Oleg",         elo:2838, category:"Chess GM",  locked:false },
    { id:16,  name:"Pavel",         elo:2769, category:"Chess GM",  locked:false },
    { id:17,  name:"Quincy",         elo:2714, category:"Chess GM",  locked:false },
    { id:18,  name:"Ravi",         elo:2686, category:"Chess GM",  locked:false },
    { id:19,  name:"Sergei",         elo:2710, category:"Chess GM",  locked:false },
    { id:20,  name:"Tomás",         elo:2708, category:"Chess GM",  locked:false },
    { id:21,  name:"Ulrich",         elo:2673, category:"Chess GM",  locked:false },
    { id:22,  name:"Valentin",         elo:2676, category:"Chess GM",  locked:false },
    { id:23,  name:"Walter",         elo:2670, category:"Chess GM",  locked:false },
    { id:24,  name:"Xavier",         elo:2637, category:"Chess GM",  locked:false },
    { id:25,  name:"Yuki",         elo:2717, category:"Chess GM",  locked:false },
    { id:26,  name:"Zephyr",         elo:2642, category:"Chess GM",  locked:false },
    { id:27,  name:"Andrey",         elo:2575, category:"Chess GM",  locked:false },
    { id:28,  name:"Baris",         elo:2505, category:"Chess GM",  locked:false },
    { id:29,  name:"Cristian",         elo:2541, category:"Chess GM",  locked:false },
    { id:30,  name:"Darren",         elo:2388, category:"Chess GM",  locked:false },
    { id:31,  name:"Emir",         elo:2630, category:"Chess GM",  locked:true  },
    { id:32,  name:"Fabian",         elo:2386, category:"Chess GM",  locked:true  },
    { id:33,  name:"Guillermo",         elo:2157, category:"Chess GM",  locked:true  },
    { id:34,  name:"Henrik",         elo:1880, category:"Chess GM",  locked:true  },
    // Regular bots
    { id:69,  name:"Viktor",    elo:889,  category:"Regular", locked:false },
    { id:70,  name:"Sophia",    elo:938,  category:"Regular", locked:false },
    { id:71,  name:"Diego",     elo:813,  category:"Regular", locked:false },
    { id:72,  name:"Emma",      elo:741,  category:"Regular", locked:false },
    { id:73,  name:"Raj",       elo:909,  category:"Regular", locked:false },
    { id:74,  name:"Olivia",    elo:938,  category:"Regular", locked:false },
    { id:75,  name:"Hassan",    elo:706,  category:"Regular", locked:false },
    { id:76,  name:"Isabella",  elo:870,  category:"Regular", locked:false },
    { id:77,  name:"Yuki",      elo:941,  category:"Regular", locked:false },
    { id:78,  name:"Lucas",     elo:978,  category:"Regular", locked:false },
    { id:79,  name:"Amara",     elo:931,  category:"Regular", locked:false },
    { id:80,  name:"Noah",      elo:972,  category:"Regular", locked:false },
    { id:81,  name:"Zara",      elo:787,  category:"Regular", locked:false },
    { id:82,  name:"Leo",       elo:859,  category:"Regular", locked:false },
    { id:83,  name:"Priya",     elo:926,  category:"Regular", locked:false },
    { id:84,  name:"Mateo",     elo:702,  category:"Regular", locked:false },
    { id:85,  name:"Aaliyah",   elo:643,  category:"Regular", locked:false },
    { id:86,  name:"Oscar",     elo:746,  category:"Regular", locked:false },
    { id:87,  name:"Fatima",    elo:801,  category:"Regular", locked:false },
    { id:88,  name:"Felix",     elo:665,  category:"Regular", locked:true  },
    { id:89,  name:"Nina",      elo:905,  category:"Regular", locked:true  },
    { id:90,  name:"Santiago",  elo:731,  category:"Regular", locked:true  },
    { id:91,  name:"Leila",     elo:627,  category:"Regular", locked:true  },
    { id:92,  name:"Andre",     elo:890,  category:"Regular", locked:true  },
    { id:93,  name:"Jasmine",   elo:608,  category:"Regular", locked:true  },
    { id:94,  name:"Marco",     elo:489,  category:"Regular", locked:false },
    { id:95,  name:"Elena",     elo:921,  category:"Regular", locked:false },
    { id:96,  name:"Kai",       elo:614,  category:"Regular", locked:false },
    { id:97,  name:"Sofia",     elo:719,  category:"Regular", locked:false },
    { id:98,  name:"Dimitri",   elo:518,  category:"Regular", locked:false },
    { id:99,  name:"Ava",       elo:775,  category:"Regular", locked:false },
    { id:100, name:"Pavel",     elo:897,  category:"Regular", locked:false },
    { id:101, name:"Mia",       elo:691,  category:"Regular", locked:false },
    { id:102, name:"Tariq",     elo:905,  category:"Regular", locked:false },
    { id:103, name:"Lily",      elo:406,  category:"Regular", locked:false },
    { id:104, name:"Boris",     elo:938,  category:"Regular", locked:false },
    { id:105, name:"Alex",      elo:679,  category:"Regular", locked:false },
    { id:106, name:"Maria",     elo:650,  category:"Regular", locked:false },
    { id:107, name:"Chen",      elo:811,  category:"Regular", locked:false },
    { id:108, name:"Aisha",     elo:464,  category:"Regular", locked:false },
    { id:109, name:"Viktor",    elo:934,  category:"Regular", locked:false },
    { id:110, name:"Sophia",    elo:836,  category:"Regular", locked:false },
    { id:111, name:"Diego",     elo:418,  category:"Regular", locked:false },
    { id:112, name:"Emma",      elo:850,  category:"Regular", locked:false },
    { id:113, name:"Raj",       elo:827,  category:"Regular", locked:false },
    { id:114, name:"Olivia",    elo:922,  category:"Regular", locked:false },
    { id:115, name:"Hassan",    elo:497,  category:"Regular", locked:false },
    { id:116, name:"Isabella",  elo:910,  category:"Regular", locked:false },
    { id:117, name:"Yuki",      elo:955,  category:"Regular", locked:true  },
    { id:118, name:"Lucas",     elo:896,  category:"Regular", locked:true  },
    { id:119, name:"Amara",     elo:570,  category:"Regular", locked:true  },
    { id:120, name:"Noah",      elo:831,  category:"Regular", locked:true  },
    { id:121, name:"Zara",      elo:757,  category:"Regular", locked:true  },
    { id:122, name:"Leo",       elo:707,  category:"Regular", locked:true  },
    { id:123, name:"Priya",     elo:835,  category:"Regular", locked:true  },
    { id:124, name:"Mateo",     elo:1210, category:"Regular", locked:false },
    { id:125, name:"Aaliyah",   elo:1783, category:"Regular", locked:false },
    { id:126, name:"Oscar",     elo:1687, category:"Regular", locked:false },
    { id:127, name:"Fatima",    elo:1277, category:"Regular", locked:false },
    { id:128, name:"Felix",     elo:1302, category:"Regular", locked:false },
    { id:129, name:"Nina",      elo:1703, category:"Regular", locked:false },
    { id:130, name:"Santiago",  elo:1672, category:"Regular", locked:false },
    { id:131, name:"Leila",     elo:1726, category:"Regular", locked:false },
    { id:132, name:"Andre",     elo:1033, category:"Regular", locked:false },
    { id:133, name:"Jasmine",   elo:1114, category:"Regular", locked:false },
    { id:134, name:"Marco",     elo:1335, category:"Regular", locked:false },
    { id:135, name:"Elena",     elo:1116, category:"Regular", locked:false },
    { id:136, name:"Kai",       elo:1665, category:"Regular", locked:false },
    { id:137, name:"Sofia",     elo:1336, category:"Regular", locked:false },
    { id:138, name:"Dimitri",   elo:1484, category:"Regular", locked:false },
    { id:139, name:"Ava",       elo:1242, category:"Regular", locked:false },
    { id:140, name:"Pavel",     elo:1275, category:"Regular", locked:false },
    { id:141, name:"Mia",       elo:1586, category:"Regular", locked:false },
    { id:142, name:"Tariq",     elo:1535, category:"Regular", locked:false },
    { id:143, name:"Lily",      elo:1624, category:"Regular", locked:true  },
    { id:144, name:"Boris",     elo:1501, category:"Regular", locked:true  },
    { id:145, name:"Alex",      elo:1775, category:"Regular", locked:true  },
    { id:146, name:"Maria",     elo:1075, category:"Regular", locked:true  },
    { id:147, name:"Chen",      elo:1769, category:"Regular", locked:true  },
    { id:148, name:"Aisha",     elo:1130, category:"Regular", locked:true  },
    { id:149, name:"Viktor",    elo:1874, category:"Regular", locked:false },
    { id:150, name:"Sophia",    elo:2318, category:"Regular", locked:false },
    { id:151, name:"Diego",     elo:1871, category:"Regular", locked:false },
    { id:152, name:"Emma",      elo:2468, category:"Regular", locked:false },
    { id:153, name:"Raj",       elo:2264, category:"Regular", locked:false },
    { id:154, name:"Olivia",    elo:2059, category:"Regular", locked:false },
    { id:155, name:"Hassan",    elo:2060, category:"Regular", locked:false },
    { id:156, name:"Isabella",  elo:1824, category:"Regular", locked:false },
    { id:157, name:"Yuki",      elo:2251, category:"Regular", locked:false },
    { id:158, name:"Lucas",     elo:2478, category:"Regular", locked:false },
    { id:159, name:"Amara",     elo:2423, category:"Regular", locked:false },
    { id:160, name:"Noah",      elo:2234, category:"Regular", locked:false },
    { id:161, name:"Zara",      elo:1882, category:"Regular", locked:false },
    { id:162, name:"Leo",       elo:2225, category:"Regular", locked:false },
    { id:163, name:"Priya",     elo:2085, category:"Regular", locked:false },
    { id:164, name:"Mateo",     elo:2383, category:"Regular", locked:true  },
    { id:165, name:"Aaliyah",   elo:2393, category:"Regular", locked:true  },
    { id:166, name:"Oscar",     elo:2165, category:"Regular", locked:true  },
    { id:167, name:"Fatima",    elo:2480, category:"Regular", locked:true  },
    { id:168, name:"Felix",     elo:2447, category:"Regular", locked:true  },
    // New Regular Bots
    { id:169, name:"Casper",     elo:1456, category:"Regular", locked:false },
    { id:170, name:"Dominic",    elo:1527, category:"Regular", locked:false },
    { id:171, name:"Emilia",     elo:1389, category:"Regular", locked:false },
    { id:172, name:"Finn",       elo:1643, category:"Regular", locked:false },
    { id:173, name:"Greta",      elo:1512, category:"Regular", locked:false },
    { id:174, name:"Henrik",     elo:1678, category:"Regular", locked:false },
    { id:175, name:"Iris",       elo:1401, category:"Regular", locked:true  },
    { id:176, name:"Julius",     elo:1734, category:"Regular", locked:true  },
    { id:177, name:"Kira",       elo:1298, category:"Regular", locked:true  },
    { id:178, name:"Laszlo",     elo:1825, category:"Regular", locked:false },
    // Additional Regular Bots to reach 200 total
    { id:179, name:"Marcus",     elo:1421, category:"Regular", locked:false },
    { id:180, name:"Natasha",    elo:1502, category:"Regular", locked:false },
    { id:181, name:"Odin",       elo:1689, category:"Regular", locked:false },
    { id:182, name:"Petra",      elo:1345, category:"Regular", locked:false },
    { id:183, name:"Quinn",      elo:1567, category:"Regular", locked:false },
    { id:184, name:"Rory",       elo:1723, category:"Regular", locked:true  },
    { id:185, name:"Sage",       elo:1412, category:"Regular", locked:true  },
    { id:186, name:"Theo",       elo:1654, category:"Regular", locked:true  },
    { id:187, name:"Uma",        elo:1589, category:"Regular", locked:true  },
    { id:188, name:"Vince",      elo:1478, category:"Regular", locked:false },
    { id:189, name:"Wendy",      elo:1512, category:"Regular", locked:false },
    { id:190, name:"Xander",     elo:1748, category:"Regular", locked:false },
    { id:191, name:"Yasmin",     elo:1381, category:"Regular", locked:false },
    { id:192, name:"Zeke",       elo:1634, category:"Regular", locked:true  },
    { id:193, name:"Aria",       elo:1456, category:"Regular", locked:true  },
    { id:194, name:"Bruno",      elo:1789, category:"Regular", locked:false },
    { id:195, name:"Cara",       elo:1398, category:"Regular", locked:false },
    { id:196, name:"Dante",      elo:1691, category:"Regular", locked:false },
    { id:197, name:"Eden",       elo:1523, category:"Regular", locked:false },
    { id:198, name:"Fraser",     elo:1712, category:"Regular", locked:true  },
    { id:199, name:"Giselle",    elo:1437, category:"Regular", locked:true  },
    { id:200, name:"Hunter",     elo:1568, category:"Regular", locked:true  },
    { id:201, name:"Iris",       elo:1445, category:"Regular", locked:false },
    { id:202, name:"Jax",        elo:1812, category:"Regular", locked:false },
    { id:203, name:"Kendra",     elo:1372, category:"Regular", locked:false },
    { id:204, name:"Lance",      elo:1626, category:"Regular", locked:false },
    { id:205, name:"Mila",       elo:1558, category:"Regular", locked:true  },
    { id:206, name:"Noel",       elo:1759, category:"Regular", locked:true  },
    { id:207, name:"Oscar",      elo:1472, category:"Regular", locked:true  },
    { id:208, name:"Piper",      elo:1681, category:"Regular", locked:false },
    { id:209, name:"Riley",      elo:1418, category:"Regular", locked:false },
    { id:210, name:"Scott",      elo:1547, category:"Regular", locked:false },
    { id:211, name:"Tessa",      elo:1734, category:"Regular", locked:false },
    { id:212, name:"Ulysses",    elo:1403, category:"Regular", locked:true  },
    { id:213, name:"Vita",       elo:1621, category:"Regular", locked:true  },
    { id:214, name:"Wade",       elo:1576, category:"Regular", locked:true  },
    { id:215, name:"Xena",       elo:1798, category:"Regular", locked:false },
    { id:216, name:"York",       elo:1365, category:"Regular", locked:false },
    { id:217, name:"Zoey",       elo:1708, category:"Regular", locked:false },
    { id:218, name:"Adrian",     elo:1519, category:"Regular", locked:false },
    { id:219, name:"Blake",      elo:1687, category:"Regular", locked:true  },
    // Engines — ONLY these use Stockfish
    { id:220, name:"Stockfish 18",             elo:3700, category:"Engine", locked:false },
    { id:221, name:"Stockfish 17",             elo:3650, category:"Engine", locked:false },
    { id:222, name:"Stockfish 16",             elo:3600, category:"Engine", locked:false },
    { id:223, name:"Komodo Dragon 3",          elo:3550, category:"Engine", locked:false },
    { id:224, name:"Leela Chess Zero",         elo:3580, category:"Engine", locked:false },
    { id:225, name:"AlphaZero Style",          elo:3650, category:"Engine", locked:false },
    { id:226, name:"Houdini 6",                elo:3480, category:"Engine", locked:false },
    { id:227, name:"Dragon 3.2",               elo:3520, category:"Engine", locked:false },
    { id:228, name:"Ethereal 14",              elo:3420, category:"Engine", locked:false },
    { id:229, name:"Berserk 12",               elo:3400, category:"Engine", locked:false },
    { id:230, name:"Koivisto 9",               elo:3370, category:"Engine", locked:false },
    { id:231, name:"RubiChess 3",              elo:3390, category:"Engine", locked:true  },
    { id:232, name:"Torch 2",                  elo:3360, category:"Engine", locked:true  },
    { id:233, name:"Caissa 1.15",              elo:3340, category:"Engine", locked:true  },
    { id:234, name:"Royal Chess Arena Engine", elo:1500, category:"Engine", locked:false },
];

// ── PIECE VALUES ──────────────────────────────────────────────────────────────
const PIECE_VALUES = { p:100, n:320, b:330, r:500, q:900, k:20000 };

// ── PIECE-SQUARE TABLES (white's perspective, rank 1→8 = index 0→7) ──────────
// These are CRITICAL for positional play — previously defined but never used!
const PST = {
    p: [
         0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
    ],
    n: [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ],
    b: [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ],
    r: [
         0,  0,  0,  0,  0,  0,  0,  0,
         5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
         0,  0,  0,  5,  5,  0,  0,  0
    ],
    q: [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
         -5,  0,  5,  5,  5,  5,  0, -5,
          0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ],
    // Middlegame king safety (hide the king!)
    k_mid: [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
         20, 20,  0,  0,  0,  0, 20, 20,
         20, 30, 10,  0,  0, 10, 30, 20
    ],
    // Endgame king activity (centralize!)
    k_end: [
        -50,-40,-30,-20,-20,-30,-40,-50,
        -30,-20,-10,  0,  0,-10,-20,-30,
        -30,-10, 20, 30, 30, 20,-10,-30,
        -30,-10, 30, 40, 40, 30,-10,-30,
        -30,-10, 30, 40, 40, 30,-10,-30,
        -30,-10, 20, 30, 30, 20,-10,-30,
        -30,-30,  0,  0,  0,  0,-30,-30,
        -50,-30,-30,-30,-30,-30,-30,-50
    ]
};

// ── PST LOOKUP ─────────────────────────────────────────────────────────────────
// Returns the piece-square bonus for a piece at a board position
function getPSTValue(pieceType, color, rank, file, isEndgame) {
    // rank: 0=rank1, 7=rank8  |  file: 0=fileA, 7=fileH
    let tableIdx;
    if (color === 'w') {
        // White: rank 0 is at the bottom of the board (rank 1), PST index 56+file
        tableIdx = (7 - rank) * 8 + file;
    } else {
        // Black: mirror vertically
        tableIdx = rank * 8 + file;
    }

    if (pieceType === 'k') {
        return isEndgame ? PST.k_end[tableIdx] : PST.k_mid[tableIdx];
    }
    return PST[pieceType] ? PST[pieceType][tableIdx] : 0;
}

// ── ENDGAME DETECTION ─────────────────────────────────────────────────────────
function isEndgame(board) {
    let queens = 0, minors = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            if (p.type === 'q') queens++;
            if (p.type === 'n' || p.type === 'b' || p.type === 'r') minors++;
        }
    }
    return queens === 0 || (queens <= 2 && minors <= 2);
}

// (evaluateAbsolute defined below replaces this)


// ── PST LOOKUP ─────────────────────────────────────────────────────────────────
// Returns the piece-square bonus for a piece at a board position
function getPSTValue(pieceType, color, rank, file, isEndgame) {
    // rank: 0=rank1, 7=rank8  |  file: 0=fileA, 7=fileH
    let tableIdx;
    if (color === 'w') {
        // White: rank 0 is at the bottom of the board (rank 1), PST index 56+file
        tableIdx = (7 - rank) * 8 + file;
    } else {
        // Black: mirror vertically
        tableIdx = rank * 8 + file;
    }

    if (pieceType === 'k') {
        return isEndgame ? PST.k_end[tableIdx] : PST.k_mid[tableIdx];
    }
    return PST[pieceType] ? PST[pieceType][tableIdx] : 0;
}

// ── ENDGAME DETECTION ─────────────────────────────────────────────────────────
function isEndgame(board) {
    let queens = 0, minors = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            if (p.type === 'q') queens++;
            if (p.type === 'n' || p.type === 'b' || p.type === 'r') minors++;
        }
    }
    return queens === 0 || (queens <= 2 && minors <= 2);
}

// (evaluateAbsolute defined below replaces this)


// ── OPENING BOOK ─────────────────────────────────────────────────────────────
// Weighted move table keyed by FEN position prefix (first 3 fields = position + turn).
// Each entry: [uci_move, weight] — higher weight = more likely to be chosen.
// Covers: e4/d4/c4/Nf3 systems, Sicilian, French, Caro, KID, QGD, Italian, Spanish,
//         London, King's Indian Attack, English, and many sub-lines.
const OPENING_BOOK = {
    // ── START POSITION ────────────────────────────────────────────────────────
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': [
        ['e2e4',10],['d2d4',9],['c2c4',6],['g1f3',5],['g2g3',3],['b2b3',2],['f2f4',2]
    ],

    // ── AFTER 1.e4 ───────────────────────────────────────────────────────────
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b': [
        ['e7e5',10],['c7c5',10],['e7e6',8],['c7c6',7],['d7d5',6],['g8f6',5],['d7d6',4],['g7g6',3]
    ],
    // 1.e4 e5 responses
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w': [
        ['g1f3',10],['f1c4',7],['f2f4',4],['b1c3',4],['d2d4',3]
    ],
    // 1.e4 e5 2.Nf3
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b': [
        ['b8c6',10],['g8f6',8],['d7d6',5],['f7f5',3],['b7b5',2]
    ],
    // 1.e4 e5 2.Nf3 Nc6 — Spanish / Italian / Scotch
    'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w': [
        ['f1b5',10],['f1c4',9],['d2d4',7],['b1c3',5],['f1e2',3]
    ],
    // Spanish main line: 3.Bb5
    'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b': [
        ['a7a6',10],['g8f6',8],['f8c5',6],['d7d6',4],['b7b5',3],['g7g6',3]
    ],
    // Italian: 3.Bc4
    'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b': [
        ['f8c5',10],['g8f6',9],['f8e7',5],['d7d6',4]
    ],
    // Scotch: 3.d4
    'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b': [
        ['e5d4',10],['d7d6',4]
    ],

    // ── SICILIAN ─────────────────────────────────────────────────────────────
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w': [
        ['g1f3',10],['b1c3',7],['f2f4',5],['c2c3',4],['d2d4',3]
    ],
    // 1.e4 c5 2.Nf3
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b': [
        ['d7d6',10],['b8c6',9],['e7e6',8],['g7g6',6],['a7a6',4]
    ],
    // Sicilian Najdorf setup: 2...d6 3.d4
    'rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b': [
        ['c5d4',10]
    ],
    'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w': [
        ['f3d4',10]
    ],
    // Sicilian after 2...Nc6 3.d4
    'r1bqkbnr/pp1ppppp/2n5/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b': [
        ['c5d4',10]
    ],

    // ── FRENCH ───────────────────────────────────────────────────────────────
    'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w': [
        ['d2d4',10],['b1c3',5],['b1d2',4],['g1f3',3]
    ],
    // 1.e4 e6 2.d4
    'rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b': [
        ['d7d5',10],['c7c5',5]
    ],
    // French 2...d5 3.Nc3
    'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b': [
        ['g8f6',10],['d5e4',8],['f8b4',7],['c7c5',6]
    ],

    // ── CARO-KANN ────────────────────────────────────────────────────────────
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w': [
        ['d2d4',10],['b1c3',6],['g1f3',4]
    ],
    'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b': [
        ['d7d5',10]
    ],

    // ── AFTER 1.d4 ───────────────────────────────────────────────────────────
    'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b': [
        ['d7d5',10],['g8f6',9],['e7e6',7],['c7c5',7],['g7g6',6],['f7f5',4]
    ],
    // 1.d4 d5
    'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w': [
        ['c2c4',10],['g1f3',7],['e2e3',5],['b1c3',4],['c1f4',4]
    ],
    // QGD: 1.d4 d5 2.c4
    'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b': [
        ['e7e6',10],['c7c6',9],['d5c4',7],['g8f6',6],['e7e5',4]
    ],
    // 1.d4 d5 2.c4 e6 — QGD
    'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w': [
        ['b1c3',10],['g1f3',9],['c1f4',6]
    ],
    // 1.d4 d5 2.c4 c6 — Slav
    'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w': [
        ['g1f3',10],['b1c3',9],['e2e3',5]
    ],
    // 1.d4 Nf6 — Indian defenses
    'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w': [
        ['c2c4',10],['g1f3',8],['c1f4',5],['e2e3',4]
    ],
    // 1.d4 Nf6 2.c4 — KID / Nimzo / QID
    'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b': [
        ['g7g6',10],['e7e6',9],['c7c5',7],['d7d5',6],['b7b6',5],['c7c6',4]
    ],
    // KID: 2...g6 3.Nc3
    'rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b': [
        ['f8g7',10],['d7d5',5]
    ],
    // Nimzo: 2...e6 3.Nc3
    'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b': [
        ['f8b4',10],['d7d5',8],['b7b6',5],['c7c5',4]
    ],

    // ── AFTER 1.c4 (English) ─────────────────────────────────────────────────
    'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b': [
        ['e7e5',10],['c7c5',8],['g8f6',7],['e7e6',5],['g7g6',4],['d7d5',4]
    ],

    // ── AFTER 1.Nf3 ──────────────────────────────────────────────────────────
    'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b': [
        ['d7d5',10],['g8f6',9],['c7c5',7],['e7e6',6],['g7g6',5],['b7b6',4]
    ],

    // ── KING'S GAMBIT ─────────────────────────────────────────────────────────
    'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b': [
        ['e5f4',10],['d7d5',7],['f8c5',5],['d7d6',4]
    ],

    // ── LONDON SYSTEM ─────────────────────────────────────────────────────────
    'rnbqkbnr/pppppppp/8/8/3P4/5N2/PPP1PPPP/RNBQKB1R b': [
        ['d7d5',10],['g8f6',9],['e7e6',7],['c7c5',6],['g7g6',5]
    ],
    'rnbqkb1r/pppppppp/5n2/8/3P1B2/5N2/PPP1PPPP/RN1QKB1R b': [
        ['e7e6',10],['d7d5',9],['c7c5',7],['g7g6',5],['c7c6',4]
    ],
};

// ── LOOKUP OPENING BOOK ───────────────────────────────────────────────────────
// Takes a chess.js game object, returns a UCI move string or null.
// Uses the board position (first 2 FEN fields) as key, randomly weighted selection.
function lookupBook(game) {
    try {
        const fenParts = game.fen().split(' ');
        // Key = "board turn" — ignore castling/ep/clocks so transpositions match
        const key = fenParts[0] + ' ' + fenParts[1];
        const entry = OPENING_BOOK[key];
        if (!entry || !entry.length) return null;
        // Weighted random selection
        const totalWeight = entry.reduce((s, [, w]) => s + w, 0);
        let rand = Math.random() * totalWeight;
        for (const [move, weight] of entry) {
            rand -= weight;
            if (rand <= 0) return move;
        }
        return entry[0][0];
    } catch(e) { return null; }
}

// ── DEVELOPMENT BONUS (used inside evaluateAbsolute) ─────────────────────────
// Rewards: pieces off back rank, centre pawns moved, castled king
// Penalises: unmoved minor pieces in opening, queen out too early, blocked centre
function developmentScore(board, color) {
    let dev = 0;
    const backRank    = color === 'w' ? 7 : 0;
    const pawnRank2   = color === 'w' ? 6 : 1;   // starting pawn rank
    const pawnRank3   = color === 'w' ? 5 : 2;   // one push
    const centrePawns = [3, 4]; // d and e files

    let unmovedMinors  = 0;
    let movedMinors    = 0;
    let centrePawnMoved = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p || p.color !== color) continue;

            // Minor pieces still on back rank = undeveloped
            if ((p.type === 'n' || p.type === 'b') && r === backRank) {
                unmovedMinors++;
                dev -= 18; // strong penalty for each lagging minor
            }
            // Minor pieces developed (off back rank)
            if ((p.type === 'n' || p.type === 'b') && r !== backRank) {
                movedMinors++;
            }
            // Rooks on back rank are fine — don't penalise
            // Queen out too early (on rank 2-5 before minors developed) — handled implicitly

            // Centre pawns: reward if moved from starting square
            if (p.type === 'p' && centrePawns.includes(c)) {
                if (r !== pawnRank2) centrePawnMoved++; // pawn has moved
            }
        }
    }

    // Bonus for centre pawn advances
    dev += centrePawnMoved * 12;

    // Bonus for completing development (all 4 minors off back rank)
    if (unmovedMinors === 0) dev += 20;

    return dev;
}


// ── EXPORTS ───────────────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports !== undefined) {
    module.exports = {
        BOTS, PIECE_VALUES, PST,
        getPSTValue, isEndgame,
        OPENING_BOOK, lookupBook,
        developmentScore
    };
}
if (typeof window !== 'undefined') {
    window.BOTS             = BOTS;
    window.PIECE_VALUES     = PIECE_VALUES;
    window.PST              = PST;
    window.getPSTValue      = getPSTValue;
    window.isEndgame        = isEndgame;
    window.OPENING_BOOK     = OPENING_BOOK;
    window.lookupBook       = lookupBook;
    window.developmentScore = developmentScore;
    window._BotDataLoaded   = true;
    console.log('✅ bot-data.js: 183 bots + opening book loaded');
}

} catch(err) {
    console.error('🔴 FATAL in bot-data.js:', err.message, err.stack);
    if (typeof window !== 'undefined') window._BotDataLoaded = false;
}