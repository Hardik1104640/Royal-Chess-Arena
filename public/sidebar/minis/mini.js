// mini.js - compact interactions for the mini game

// Game state persistence
function saveGameState(fen, whiteTime, blackTime, timeControl, moves) {
  const state = { fen, whiteTime, blackTime, timeControl, moves };
  localStorage.setItem('chessGameState', JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem('chessGameState');
  return saved ? JSON.parse(saved) : null;
}

function clearGameState() {
  localStorage.removeItem('chessGameState');
}

document.addEventListener('DOMContentLoaded', () => {
  // Helper to create beautiful confirmation dialogs
  function showCustomAlert(title, message, onConfirm, onCancel) {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = '#2a2a2a';
    dialog.style.border = '2px solid rgb(58, 160, 255)';
    dialog.style.borderRadius = '10px';
    dialog.style.padding = '25px';
    dialog.style.zIndex = '9999';
    dialog.style.textAlign = 'center';
    dialog.style.color = 'white';
    dialog.style.minWidth = '280px';
    dialog.style.fontFamily = 'Arial, sans-serif';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.marginTop = '0';
    titleEl.style.marginBottom = '15px';
    titleEl.style.color = 'rgb(58, 160, 255)';
    dialog.appendChild(titleEl);
    
    const msgEl = document.createElement('p');
    msgEl.textContent = message;
    msgEl.style.marginBottom = '20px';
    msgEl.style.fontSize = '14px';
    msgEl.style.color = '#ccc';
    dialog.appendChild(msgEl);
    
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '10px';
    btnContainer.style.justifyContent = 'center';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Yes';
    confirmBtn.style.padding = '10px 25px';
    confirmBtn.style.background = 'rgb(58, 160, 255)';
    confirmBtn.style.color = 'white';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '5px';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.fontSize = '14px';
    confirmBtn.style.fontWeight = 'bold';
    confirmBtn.onclick = () => {
      document.body.removeChild(dialog);
      if (onConfirm) onConfirm();
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'No';
    cancelBtn.style.padding = '10px 25px';
    cancelBtn.style.background = '#555';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '5px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontSize = '14px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.onclick = () => {
      document.body.removeChild(dialog);
      if (onCancel) onCancel();
    };
    
    btnContainer.appendChild(confirmBtn);
    btnContainer.appendChild(cancelBtn);
    dialog.appendChild(btnContainer);
    
    document.body.appendChild(dialog);
  }
  
  // shared state for the mini game
  let game = null; // chess.js instance (initialized when available)
  let squares = [];
  let pulseInterval = null;
  let passplayMode = false;
  let moves = []; // array to store moves
  const board = document.getElementById('mini-chessboard');
  console.log('mini.js: DOMContentLoaded, board element:', board);
  if (board) {
    // create 8x8 squares
    for (let r = 8; r >= 1; r--) {
      for (let f = 1; f <= 8; f++) {
        const sq = document.createElement('div');
        sq.className = 'square';
        const isLight = (r + f) % 2 === 0;
        sq.classList.add(isLight ? 'light' : 'dark');
        sq.dataset.square = `${String.fromCharCode(96+f)}${r}`;
        board.appendChild(sq);
      }
    }
    console.log('mini.js: Created 64 squares');

    // create squares for display board
    const displayBoard = document.getElementById('display-chessboard');
    if (displayBoard) {
      for (let r = 8; r >= 1; r--) {
        for (let f = 1; f <= 8; f++) {
          const sq = document.createElement('div');
          sq.className = 'square';
          const isLight = (r + f) % 2 === 0;
          sq.classList.add(isLight ? 'light' : 'dark');
          sq.dataset.square = `${String.fromCharCode(96+f)}${r}`;
          displayBoard.appendChild(sq);
        }
      }
      console.log('mini.js: Created display board squares');
      // render starting position on display board
      renderStartingPosition(displayBoard);
    }

    function renderStartingPosition(boardEl) {
      // clear any existing pieces
      boardEl.querySelectorAll('.square').forEach(sq => {
        sq.innerHTML = '';
        delete sq.dataset.piece;
        delete sq.dataset.owner;
      });
      // starting position pieces
      const startingPieces = {
        a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
        a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
        a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
        a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR'
      };
      for (const [sqName, code] of Object.entries(startingPieces)) {
        const sqEl = boardEl.querySelector(`.square[data-square='${sqName}']`);
        if (sqEl) {
          const img = document.createElement('img');
          img.className = 'piece-img';
          img.src = `../../Images/Chesspieces/${code}.png`;
          img.alt = code;
          sqEl.appendChild(img);
          sqEl.dataset.piece = code;
          sqEl.dataset.owner = code[0];
        }
      }
    }

    // demo pulse animation
    squares = Array.from(board.querySelectorAll('.square'));
    console.log('mini.js: Found', squares.length, 'squares');
    function pulseRandom() {
      if (!squares.length) return;
      const idx = Math.floor(Math.random() * squares.length);
      const sq = squares[idx];
      sq.classList.add('pulse');
      setTimeout(() => sq.classList.remove('pulse'), 700);
    }
    pulseInterval = setInterval(pulseRandom, 800);
    // Pass & Play state is tracked by outer-scope `passplayMode`

    function initPassPlay(timeControl) {
      if (passplayMode) return;
      passplayMode = true;
      // stop demo pulses for clarity
      squares.forEach(sq => sq.classList.remove('pulse'));
      try { clearInterval(pulseInterval); } catch (e) {}
      // start a proper game (this will set up chess.js and UI)
      startProperGame(timeControl, {passplay: true});
    }
  }

  // Start / Pass & Play handlers (use event delegation to avoid timing removal issues)
  const status = document.getElementById('mini-status');
  let selectedTimeControl = '10 min'; // default
  let gameOver = false; // Track game state
  let timerInterval = null; // Track timer interval
  
  // Mark default time control button as selected on page load
  setTimeout(() => {
    const defaultBtn = document.querySelector('.time-btn[data-time="10 min"]');
    if (defaultBtn) {
      defaultBtn.classList.add('selected');
    }
    
    // Check if auto-start is requested via URL parameter
    const params = new URLSearchParams(window.location.search);
    const autostartTime = params.get('autostart-time');
    if (autostartTime) {
      selectedTimeControl = autostartTime;
      const btn = document.querySelector(`.time-btn[data-time="${autostartTime}"]`);
      if (btn) {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      }
      // Auto-click the Start button
      setTimeout(() => {
        const startBtn = document.getElementById('mini-start');
        if (startBtn) startBtn.click();
      }, 200);
    }
  }, 100);
  
  // Time control button handlers
  document.addEventListener('click', (e) => {
    const timeBtn = e.target.closest && e.target.closest('.time-btn');
    if (timeBtn) {
      // Clear previous selection
      document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
      // Mark current selection
      timeBtn.classList.add('selected');
      selectedTimeControl = timeBtn.dataset.time;
      return;
    }
  });
  
  // Helper function to parse time control strings (e.g., "1|1" → {baseTime: 60, increment: 1}, "10 min" → {baseTime: 600, increment: 0})
  function parseTimeControl(timeStr) {
    if (timeStr.includes('|')) {
      // Format: "1|1" (minutes|increment)
      const [mins, inc] = timeStr.split('|').map(Number);
      return { baseTime: mins * 60, increment: inc };
    } else {
      // Format: "10 min"
      const match = timeStr.match(/(\d+)\s*min/);
      const baseTime = match ? parseInt(match[1]) * 60 : 600;
      return { baseTime, increment: 0 };
    }
  }
  
  // Show restart buttons after game ends
  function showRestartButtons(lastTimeControl) {
    // Remove any existing restart buttons
    const oldRestart = document.getElementById('restart-buttons');
    if (oldRestart) oldRestart.remove();
    
    const restartDiv = document.createElement('div');
    restartDiv.id = 'restart-buttons';
    restartDiv.style.display = 'flex';
    restartDiv.style.gap = '8px';
    restartDiv.style.marginTop = '8px';
    restartDiv.style.justifyContent = 'center';

    const btn1 = document.createElement('button');
    btn1.className = 'btn';
    btn1.style.background = 'rgb(84, 48, 130)';
    btn1.style.color = 'white';
    btn1.style.padding = '10px 15px';
    btn1.textContent = 'New Game (Different Time)';
    btn1.onclick = () => {
      window.location.href = './game.html'; // Reload to go back to time selection
    };

    const btn2 = document.createElement('button');
    btn2.className = 'btn';
    btn2.style.background = 'rgb(58, 160, 255)';
    btn2.style.color = 'white';
    btn2.style.padding = '10px 15px';
    btn2.textContent = 'New Game (Same Time)';
    btn2.onclick = () => {
      // Start new game with same time control - reload page and auto-start
      const params = new URLSearchParams();
      params.set('autostart-time', lastTimeControl);
      window.location.search = params.toString();
    };

    restartDiv.appendChild(btn1);
    restartDiv.appendChild(btn2);

    const gameActionsDiv = document.getElementById('game-actions');
    if (gameActionsDiv && gameActionsDiv.parentNode) {
      gameActionsDiv.parentNode.insertBefore(restartDiv, gameActionsDiv.nextSibling);
    }
  }
  
  document.body.addEventListener('click', (e) => {
    const startEl = e.target.closest && e.target.closest('#mini-start');
    if (startEl) {
      const time = selectedTimeControl || '10 min';
      if (window.recordMatchTimeControl) window.recordMatchTimeControl(time);
      try {
        startEl.disabled = true;
        
        // Check for saved game and ask user if they want to resume
        const savedState = loadGameState();
        if (savedState && savedState.fen) {
          const resume = window.confirm('Do you want to resume your previous game?');
          if (!resume) {
            clearGameState(); // User wants a fresh game
          }
        }
        
        console.log('mini.js: Start clicked, initializing game with time=', time);
        if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = 'Initializing game...' }
        startProperGame(time);
        
        // Hide Start button and show game action buttons
        const actionsDiv = document.querySelector('.actions');
        if (actionsDiv) actionsDiv.style.display = 'none';
        const gameActionsDiv = document.getElementById('game-actions');
        if (gameActionsDiv) {
          gameActionsDiv.style.display = 'flex';
          console.log('Game actions div found and set to flex');
          console.log('Game actions div children:', gameActionsDiv.children.length);
        } else {
          console.log('Game actions div not found!');
        }
      } catch (err) {
        console.error('mini.js: startProperGame error', err);
        if (status) { status.style.display='block'; status.className='status-message'; status.textContent = 'Could not start game — see console.' }
        startEl.disabled = false;
      }
      return;
    }
    
    // Resign button handler
    const resignEl = e.target.closest && e.target.closest('#resign-btn');
    if (resignEl) {
      if (!game || gameOver) return;
      const currentPlayer = game.turn() === 'w' ? 'White' : 'Black';
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      
      showCustomAlert(`Resign as ${currentPlayer}?`, `Are you sure you want to resign? ${winner} will win the game.`, () => {
        gameOver = true;
        clearInterval(timerInterval);
        const board = document.getElementById('mini-chessboard');
        if (board) {
          board.style.pointerEvents = 'none';
          board.style.opacity = '0.6';
        }
        if (status) {
          status.style.display = 'block';
          status.className = 'status-message info';
          status.textContent = `${currentPlayer} resigned. ${winner} wins!`;
        }
        clearGameState();
        showRestartButtons(selectedTimeControl);
      });
      return;
    }
    
    // Offer Draw button handler
    const drawEl = e.target.closest && e.target.closest('#offer-draw-btn');
    if (drawEl) {
      if (!game || gameOver) return;
      const currentPlayer = game.turn() === 'w' ? 'White' : 'Black';
      const otherPlayer = currentPlayer === 'White' ? 'Black' : 'White';
      
      showCustomAlert(`Offer Draw as ${currentPlayer}?`, `You want to offer a draw. Do you want to proceed?`, () => {
        // Offer accepted by current player, now ask other player
        showCustomAlert(`${currentPlayer} offers a draw`, `${otherPlayer}, do you accept the draw offer?`, () => {
          // Both players accepted draw
          gameOver = true;
          clearInterval(timerInterval);
          const board = document.getElementById('mini-chessboard');
          if (board) {
            board.style.pointerEvents = 'none';
            board.style.opacity = '0.6';
          }
          if (status) {
            status.style.display = 'block';
            status.className = 'status-message info';
            status.textContent = 'Game drawn by agreement.';
          }
          clearGameState();
          setTimeout(() => {
            if (typeof showRestartButtons === 'function') {
              showRestartButtons(selectedTimeControl);
            }
          }, 100);
        });
      })
      return;
    }
  });

    // Start a proper chess game: place images, hide controls, add full-rule click-to-move (via chess.js)
    function startProperGame(timeControl) {
      try { clearInterval(pulseInterval); } catch (e) {}
        // ensure chess.js is available and initialize shared game instance
        if (typeof Chess !== 'function') {
          // chess.js is not available (likely blocked by CSP). Inform user and abort start.
          if (status) {
            status.style.display = 'block';
            status.className = 'status-message';
            status.textContent = 'Cannot start: chess.js is blocked by Content Security Policy. Serve a local copy at /sidebar/minis/chess.min.js or allow the CDN.';
          }
          // re-enable the Start button if present
          const startBtnEl = document.getElementById('mini-start');
          if (startBtnEl) startBtnEl.disabled = false;
          return;
        }
        if (!game) {
          try { game = new Chess(); } catch (e) { game = null; }
        }
        if (game) { try { game.reset(); } catch (e) {} }
        moves = []; // reset moves array
        const movesList = document.getElementById('moves-list');
        if (movesList) movesList.innerHTML = ''; // clear moves display
        // hide display board, show play board
        const displayContainer = document.getElementById('display-container');
        if (displayContainer) displayContainer.style.display = 'none';
        const boardContainer = document.getElementById('board-container');
        if (boardContainer) boardContainer.style.display = 'flex';
      
      // Parse time control using the helper function
      const timeControlObj = parseTimeControl(timeControl);
      const totalSeconds = timeControlObj.baseTime;
      const incrementSeconds = timeControlObj.increment;
      let whiteTimeLeft = totalSeconds;
      let blackTimeLeft = totalSeconds;
      gameOver = false;
      timerInterval = null;
      
      // remove controls section entirely (everything below board)
      const controls = document.querySelector('.mini-controls');
      if (controls && controls.parentNode) {
        controls.parentNode.removeChild(controls);
      }

      // create time displays above and below the board
      const boardWrap = document.querySelector('.mini-board-wrap');
      const board = document.getElementById('mini-chessboard');
      if (!boardWrap || !board) return;

      const topTime = document.createElement('div');
      topTime.className = 'game-time-display active';
      topTime.id = 'top-timer';
      topTime.textContent = `⏱ ${formatTime(blackTimeLeft)}`;
      boardWrap.insertBefore(topTime, board);

      const bottomTime = document.createElement('div');
      bottomTime.className = 'game-time-display active';
      bottomTime.id = 'bottom-timer';
      bottomTime.textContent = `⏱ ${formatTime(whiteTimeLeft)}`;
      boardWrap.appendChild(bottomTime);
      
      // Helper function to format seconds as MM:SS
      function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
      
      // Update timer display and check for timeout
      function updateTimer() {
        if (gameOver) return;
        
        const currentTurn = game.turn();
        if (currentTurn === 'w') {
          whiteTimeLeft--;
          bottomTime.textContent = `⏱ ${formatTime(whiteTimeLeft)}`;
          if (whiteTimeLeft <= 0) {
            gameOver = true;
            clearInterval(timerInterval);
            clearGameState();
            bottomTime.className = 'game-time-display timeout';
            board.style.pointerEvents = 'none';
            board.style.opacity = '0.5';
            // Hide game action buttons and show restart buttons
            const gameActionsDiv = document.getElementById('game-actions');
            if (gameActionsDiv) gameActionsDiv.style.display = 'none';
            showRestartButtons(timeControl);
            if (status) { 
              status.style.display='block'; 
              status.className='status-message success'; 
              status.textContent = `Time's up! Black wins by timeout.`; 
            }
            return;
          }
        } else {
          blackTimeLeft--;
          topTime.textContent = `⏱ ${formatTime(blackTimeLeft)}`;
          if (blackTimeLeft <= 0) {
            gameOver = true;
            clearInterval(timerInterval);
            clearGameState();
            topTime.className = 'game-time-display timeout';
            board.style.pointerEvents = 'none';
            board.style.opacity = '0.5';
            // Hide game action buttons and show restart buttons
            const gameActionsDiv = document.getElementById('game-actions');
            if (gameActionsDiv) gameActionsDiv.style.display = 'none';
            showRestartButtons(timeControl);
            if (status) { 
              status.style.display='block'; 
              status.className='status-message success'; 
              status.textContent = `Time's up! White wins by timeout.`; 
            }
            return;
          }
        }
      }
      
      // Start the timer
      timerInterval = setInterval(updateTimer, 1000);
      
      // Update timer colors based on whose turn it is
      function updateTimerDisplay() {
        const currentTurn = game.turn();
        if (currentTurn === 'w') {
          bottomTime.classList.add('active');
          topTime.classList.remove('active');
        } else {
          topTime.classList.add('active');
          bottomTime.classList.remove('active');
        }
      }

      // initialize chess.js game and render board
      if (typeof Chess === 'function') {
        try { game = new Chess(); } catch (e) { game = null; }
      }

      function clearBoardSquares() {
        const sqs = Array.from(board.querySelectorAll('.square'));
        sqs.forEach(sq => {
          sq.innerHTML = '';
          delete sq.dataset.piece;
          delete sq.dataset.owner;
          sq.classList.remove('selected');
        });
      }

      // Show restart buttons after game ends
      function showRestartButtons(lastTimeControl) {
        const restartDiv = document.createElement('div');
        restartDiv.id = 'restart-buttons';
        restartDiv.style.display = 'flex';
        restartDiv.style.gap = '8px';
        restartDiv.style.marginTop = '8px';
        restartDiv.style.justifyContent = 'center';

        const btn1 = document.createElement('button');
        btn1.className = 'btn';
        btn1.style.background = 'rgb(84, 48, 130)';
        btn1.style.color = 'white';
        btn1.style.padding = '10px 15px';
        btn1.textContent = 'New Game (Different Time)';
        btn1.onclick = () => {
          window.location.href = './game.html';
        };

        const btn2 = document.createElement('button');
        btn2.className = 'btn';
        btn2.style.background = 'rgb(58, 160, 255)';
        btn2.style.color = 'white';
        btn2.style.padding = '10px 15px';
        btn2.textContent = 'New Game (Same Time)';
        btn2.onclick = () => {
          // Start new game with same time control - reload page and auto-start
          const params = new URLSearchParams();
          params.set('autostart-time', lastTimeControl);
          window.location.search = params.toString();
        };

        restartDiv.appendChild(btn1);
        restartDiv.appendChild(btn2);

        const gameActionsDiv = document.getElementById('game-actions');
        if (gameActionsDiv && gameActionsDiv.parentNode) {
          gameActionsDiv.parentNode.insertBefore(restartDiv, gameActionsDiv.nextSibling);
        }
      }

      function renderBoardFromGame() {
        clearBoardSquares();
        if (!game) return;
        const boardState = game.board(); // returns 8x8 array, ranks 8->1 as rows
        // boardState[0] is rank 8, boardState[7] is rank 1
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            const piece = boardState[r][f];
            const file = String.fromCharCode(97 + f);
            const rank = 8 - r;
            const sqName = `${file}${rank}`;
            const sqEl = board.querySelector(`.square[data-square='${sqName}']`);
            if (!sqEl) continue;
            if (piece) {
              const code = (piece.color === 'w' ? 'w' : 'b') + piece.type.toUpperCase();
              const img = document.createElement('img');
              img.className = 'piece-img';
              img.src = `../../Images/Chesspieces/${code}.png`;
              img.alt = code;
              sqEl.appendChild(img);
              sqEl.dataset.piece = code;
              sqEl.dataset.owner = piece.color;
            }
          }
        }
        attachSquareHandlers();
      }

      function clearValidMoveHighlights() {
        const sqs = Array.from(board.querySelectorAll('.square'));
        sqs.forEach(sq => sq.classList.remove('valid-move'));
      }

      function showValidMoves(fromSquare) {
        clearValidMoveHighlights();
        if (!game) return;
        const moves = game.moves({ square: fromSquare, verbose: true });
        moves.forEach(move => {
          const targetSq = board.querySelector(`.square[data-square='${move.to}']`);
          if (targetSq) targetSq.classList.add('valid-move');
        });
      }

      function showInvalidMoveMessage(message) {
        if (!status) return;
        status.style.display = 'block';
        status.className = 'status-message error';
        status.textContent = message;
        // auto-hide after 2 seconds
        setTimeout(() => {
          if (status.textContent === message) {
            status.style.display = 'none';
          }
        }, 2000);
      }

      function showPromotionDialog(moveObj) {
        return new Promise((resolve) => {
          const dialog = document.getElementById('promotion-dialog');
          if (!dialog) {
            resolve('q'); // default to queen if dialog missing
            return;
          }
          
          const pieces = dialog.querySelectorAll('.promotion-piece');
          const handleClick = (e) => {
            const piece = e.target.closest('.promotion-piece');
            if (piece) {
              const promotionPiece = piece.dataset.piece;
              pieces.forEach(p => p.removeEventListener('click', handleClick));
              dialog.style.display = 'none';
              resolve(promotionPiece);
            }
          };
          
          pieces.forEach(piece => piece.addEventListener('click', handleClick));
          dialog.style.display = 'flex';
        });
      }

      function attachSquareHandlers() {
        const sqs = Array.from(board.querySelectorAll('.square'));
        // remove previous handlers by cloning nodes
        sqs.forEach(sq => {
          const newSq = sq.cloneNode(true);
          sq.parentNode.replaceChild(newSq, sq);
        });
        // re-query
        const fresh = Array.from(board.querySelectorAll('.square'));
        let selected = null;
        fresh.forEach(sq => {
          sq.addEventListener('click', async () => {
            const hasPiece = !!sq.dataset.piece;
            if (!game) return; // safety
            if (gameOver) return; // prevent moves when game is over
            
            // allow switching pieces: if clicking a different own piece, select it instead
            if (selected && hasPiece && sq.dataset.owner === game.turn() && selected !== sq) {
              selected.classList.remove('selected');
              clearValidMoveHighlights();
              selected = sq;
              selected.classList.add('selected');
              showValidMoves(selected.dataset.square);
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Selected ${sq.dataset.piece} on ${sq.dataset.square}`; }
              return;
            }
            
            if (!selected) {
              if (hasPiece && sq.dataset.owner === game.turn()) {
                selected = sq;
                selected.classList.add('selected');
                showValidMoves(selected.dataset.square);
                if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Selected ${sq.dataset.piece} on ${sq.dataset.square}`; }
              }
              return;
            }
            // deselect if same square clicked
            if (selected === sq) {
              selected.classList.remove('selected');
              clearValidMoveHighlights();
              selected = null;
              if (status) { status.style.display='none'; }
              return;
            }
            const moveObj = { from: selected.dataset.square, to: sq.dataset.square, promotion: 'q' };
            let result = null;
            try {
              // check if this is a pawn promotion move
              const piece = game.get(selected.dataset.square);
              const targetRank = parseInt(sq.dataset.square.charAt(1));
              const isPawnPromotion = piece && piece.type === 'p' && ((piece.color === 'w' && targetRank === 8) || (piece.color === 'b' && targetRank === 1));
              
              if (isPawnPromotion) {
                const chosenPromotion = await showPromotionDialog(moveObj);
                moveObj.promotion = chosenPromotion;
              }
              
              result = game.move(moveObj);
            } catch (err) {
              showInvalidMoveMessage(`Invalid move — try a different target.`);
              selected.classList.remove('selected');
              clearValidMoveHighlights();
              selected = null;
              return;
            }
            if (!result) {
              showInvalidMoveMessage(`Invalid move — try a different target.`);
              return;
            }
            // clear selection and highlights
            selected.classList.remove('selected');
            clearValidMoveHighlights();
            selected = null;
            // add move to moves list
            moves.push(result);
            updateMovesDisplay();
            // render full board from game state (handles captures, en-passant, castling, promotions)
            renderBoardFromGame();
            
            // Add increment time to the player who just moved
            if (incrementSeconds > 0) {
              if (result.color === 'w') {
                whiteTimeLeft += incrementSeconds;
                bottomTime.textContent = `⏱ ${formatTime(whiteTimeLeft)}`;
              } else {
                blackTimeLeft += incrementSeconds;
                topTime.textContent = `⏱ ${formatTime(blackTimeLeft)}`;
              }
            }
            
            // save game state to localStorage
            saveGameState(game.fen(), whiteTimeLeft, blackTimeLeft, timeControl, moves);
            
            // update timer display after move
            updateTimerDisplay();
            
            // check game end conditions
            if (game.isCheckmate()) {
              gameOver = true;
              clearInterval(timerInterval);
              clearGameState();
              board.style.pointerEvents = 'none';
              board.style.opacity = '0.6';
              // Hide game action buttons and show restart buttons
              const gameActionsDiv = document.getElementById('game-actions');
              if (gameActionsDiv) gameActionsDiv.style.display = 'none';
              showRestartButtons(timeControl);
              if (status) { status.style.display='block'; status.className='status-message success'; status.textContent = `Checkmate — ${result.color === 'w' ? 'White' : 'Black'} wins!`; }
            } else if (game.isStalemate()) {
              gameOver = true;
              clearInterval(timerInterval);
              clearGameState();
              board.style.pointerEvents = 'none';
              board.style.opacity = '0.6';
              // Hide game action buttons and show restart buttons
              const gameActionsDiv = document.getElementById('game-actions');
              if (gameActionsDiv) gameActionsDiv.style.display = 'none';
              showRestartButtons(timeControl);
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Game ended by stalemate — Draw!`; }
            } else if (game.isThreefoldRepetition()) {
              gameOver = true;
              clearInterval(timerInterval);
              clearGameState();
              board.style.pointerEvents = 'none';
              board.style.opacity = '0.6';
              // Hide game action buttons and show restart buttons
              const gameActionsDiv = document.getElementById('game-actions');
              if (gameActionsDiv) gameActionsDiv.style.display = 'none';
              showRestartButtons(timeControl);
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Game ended by threefold repetition — Draw!`; }
            } else if (game.isInsufficientMaterial()) {
              gameOver = true;
              clearInterval(timerInterval);
              clearGameState();
              board.style.pointerEvents = 'none';
              board.style.opacity = '0.6';
              // Hide game action buttons and show restart buttons
              const gameActionsDiv = document.getElementById('game-actions');
              if (gameActionsDiv) gameActionsDiv.style.display = 'none';
              showRestartButtons(timeControl);
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Game ended by insufficient material — Draw!`; }
            } else if (game.isDrawByFiftyMoves()) {
              gameOver = true;
              clearInterval(timerInterval);
              clearGameState();
              board.style.pointerEvents = 'none';
              board.style.opacity = '0.6';
              // Hide game action buttons and show restart buttons
              const gameActionsDiv = document.getElementById('game-actions');
              if (gameActionsDiv) gameActionsDiv.style.display = 'none';
              showRestartButtons(timeControl);
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Game ended by fifty-move rule — Draw!`; }
            } else if (game.isCheck()) {
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `Check — ${game.turn() === 'w' ? 'White' : 'Black'} to move.`; }
            } else {
              if (status) { status.style.display='block'; status.className='status-message info'; status.textContent = `${game.turn() === 'w' ? 'White' : 'Black'} to move.`; }
            }
          });
        });
      }

      // initialize board with chess.js initial position
      if (game) {
        // Try to restore saved game state
        const savedState = loadGameState();
        if (savedState && savedState.fen) {
          try {
            game.load(savedState.fen);
            whiteTimeLeft = savedState.whiteTime || totalSeconds;
            blackTimeLeft = savedState.blackTime || totalSeconds;
            moves = savedState.moves || [];
            bottomTime.textContent = `⏱ ${formatTime(whiteTimeLeft)}`;
            topTime.textContent = `⏱ ${formatTime(blackTimeLeft)}`;
            renderBoardFromGame();
            updateMovesDisplay();
            updateTimerDisplay();
            console.log('Restored game state from localStorage');
          } catch (e) {
            console.warn('Failed to restore game state:', e);
            game.reset();
            renderBoardFromGame();
          }
        } else {
          game.reset();
          renderBoardFromGame();
        }
      }
    }

    function getPieceImage(piece, color) {
      const pieceMap = { p: 'P', r: 'R', n: 'N', b: 'B', q: 'Q', k: 'K' };
      const img = pieceMap[piece] || piece.toUpperCase();
      return `../../Images/Chesspieces/${color}${img}.png`;
    }

    function updateMovesDisplay() {
      const movesList = document.getElementById('moves-list');
      if (!movesList) return;
      movesList.innerHTML = '';
      moves.forEach((move, index) => {
        const moveNumber = Math.floor(index / 2) + 1;
        const isWhite = index % 2 === 0;
        const prefix = isWhite ? `${moveNumber}. ` : `${moveNumber}... `;
        const item = document.createElement('div');
        item.className = 'move-item';
        const img = document.createElement('img');
        img.src = getPieceImage(move.piece, move.color);
        img.alt = move.piece;
        const span = document.createElement('span');
        span.textContent = prefix + move.san;
        item.appendChild(img);
        item.appendChild(span);
        movesList.appendChild(item);
      });
    }

  // parse URL params to auto-start game when requested
  try {
    const params = new URLSearchParams(window.location.search);
    const time = params.get('time');
    const auto = params.get('auto');
    if (time && auto === '1') {
      setTimeout(() => startProperGame(time), 200);
    }
  } catch (e) {
    // ignore URL parsing errors
    console.warn('mini.js: could not parse URL params', e);
  }

});
