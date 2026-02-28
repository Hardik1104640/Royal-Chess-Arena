// welcome.js — page-specific JS for welcome.html
// home.js handles: session check, sidebar, topbar avatar, theme toggle, collapse, logout

document.addEventListener('DOMContentLoaded', () => {

  // ── Graceful fallback if chess piece images fail to load ──
  // Replace broken <img> pieces with a unicode fallback character
  const PIECE_UNICODE = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
  };

  document.querySelectorAll('.piece').forEach(img => {
    img.addEventListener('error', () => {
      // Determine piece code from class name e.g. "piece-wk" → "wk"
      const cls = Array.from(img.classList).find(c => c.startsWith('piece-'));
      const code = cls ? cls.replace('piece-', '') : null;
      if (!code) { img.style.display = 'none'; return; }

      const span = document.createElement('span');
      span.textContent = PIECE_UNICODE[code] || '♟';
      span.className   = img.className;           // keep positioning classes
      span.style.cssText = [
        'display:flex', 'align-items:center', 'justify-content:center',
        'font-size:32px', 'line-height:1',
        'position:absolute',
        'filter:drop-shadow(0 2px 5px rgba(0,0,0,0.5))'
      ].join(';');
      // Copy inline styles (top/left/right/bottom/opacity set by CSS via class)
      img.replaceWith(span);
    });
  });

  // ── Pass the chosen mode to play page ──
  // Cards already have href with ?mode=... so nothing extra needed.
  // This block is a hook in case you want to remember the last-played mode.
  document.querySelectorAll('.play-card').forEach(card => {
    card.addEventListener('click', () => {
      try {
        const url   = new URL(card.href, location.href);
        const mode  = url.searchParams.get('mode');
        if (mode) localStorage.setItem('lastPlayMode', mode);
      } catch (e) { /* ignore */ }
    });
  });

});