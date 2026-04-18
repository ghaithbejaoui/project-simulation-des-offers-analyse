// ─── SimTelecom Design System ────────────────────────────────────────────────
// Dark and Light theme support

export const colors = {
  bg:        '#070d18',
  bgCard:    'rgba(13, 22, 40, 0.88)',
  bgCard2:   'rgba(16, 28, 52, 0.75)',
  border:    'rgba(26, 143, 255, 0.18)',
  borderHov: 'rgba(26, 143, 255, 0.38)',
  blue:      '#1a8fff',
  blueDim:   'rgba(26, 143, 255, 0.12)',
  blueMid:   'rgba(26, 143, 255, 0.25)',
  orange:    '#e35b35',
  green:     '#43c78b',
  yellow:    '#f0b429',
  red:       '#e35b5b',
  text:      '#e8f0ff',
  textMuted: 'rgba(200, 212, 232, 0.55)',
  textDim:   'rgba(200, 212, 232, 0.28)',
};

export const lightColors = {
  bg:        '#f9fafb',
  bgCard:    '#ffffff',
  bgCard2:   '#f3f4f6',
  border:    '#e5e7eb',
  borderHov: '#d1d5db',
  blue:      '#2563eb',
  blueDim:   'rgba(37, 99, 235, 0.1)',
  blueMid:   'rgba(37, 99, 235, 0.15)',
  orange:    '#ea580c',
  green:     '#16a34a',
  yellow:    '#ca8a04',
  red:       '#dc2626',
  text:      '#111827',
  textMuted: '#6b7280',
  textDim:   '#9ca3af',
};

export const fonts = {
  heading: "'Space Grotesk', sans-serif",
  body:    "'DM Sans', sans-serif",
};

export const card = {
  background:    colors.bgCard,
  border:        `0.5px solid ${colors.border}`,
  borderRadius:  16,
  backdropFilter:'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:     '0 0 40px rgba(26,143,255,0.06), 0 16px 40px rgba(0,0,0,0.45)',
};

export const input = {
  width:        '100%',
  height:       42,
  background:   'rgba(255,255,255,0.04)',
  border:       `0.5px solid ${colors.border}`,
  borderRadius: 10,
  color:        colors.text,
  fontSize:     14,
  fontFamily:   fonts.body,
  padding:      '0 14px',
};

export const select = {
  width:        '100%',
  height:       42,
  background:   'rgba(255,255,255,0.04)',
  border:       `0.5px solid ${colors.border}`,
  borderRadius: 10,
  color:        colors.text,
  fontSize:     14,
  fontFamily:   fonts.body,
  padding:      '0 14px',
  cursor:       'pointer',
  appearance:   'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c8d4e8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

export const btnPrimary = {
  display:        'inline-flex',
  alignItems:     'center',
  gap:            8,
  padding:        '0 20px',
  height:         40,
  background:     'linear-gradient(135deg, #0d5fd4 0%, #1a8fff 100%)',
  border:         'none',
  borderRadius:   10,
  color:          '#fff',
  fontSize:       13,
  fontWeight:     500,
  fontFamily:     fonts.body,
  cursor:         'pointer',
  letterSpacing:  '0.02em',
  boxShadow:      '0 4px 16px rgba(26,143,255,0.28)',
  transition:     'opacity 0.2s, transform 0.15s',
  whiteSpace:     'nowrap',
};

export const btnGhost = {
  ...btnPrimary,
  background:   'rgba(255,255,255,0.04)',
  border:       `0.5px solid ${colors.border}`,
  boxShadow:    'none',
  color:        colors.textMuted,
};

export const btnDanger = {
  ...btnPrimary,
  background: 'rgba(227,91,91,0.15)',
  border:     '0.5px solid rgba(227,91,91,0.35)',
  color:      '#e35b5b',
  boxShadow:  'none',
};

export const getPalette = (theme = 'dark') => theme === 'light' ? lightColors : colors;

export const globalStyles = (theme = 'dark') => {
  const palette = theme === 'light' ? lightColors : colors;
  const isLight = theme === 'light';
  
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap');
    :root {
      --bg: ${palette.bg};
      --bg-card: ${palette.bgCard};
      --bg-card2: ${palette.bgCard2};
      --border: ${palette.border};
      --border-hov: ${palette.borderHov};
      --blue: ${palette.blue};
      --blue-dim: ${palette.blueDim};
      --blue-mid: ${palette.blueMid};
      --orange: ${palette.orange};
      --green: ${palette.green};
      --yellow: ${palette.yellow};
      --red: ${palette.red};
      --text: ${palette.text};
      --text-muted: ${palette.textMuted};
      --text-dim: ${palette.textDim};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      background: ${isLight ? '#f9fafb' : 'var(--bg)'}; 
      color: var(--text); 
      font-family: 'DM Sans', sans-serif; 
      font-weight: 400; 
      line-height: 1.6; 
      font-size: 14px; 
      transition: background 0.3s ease, color 0.3s ease; 
      -webkit-font-smoothing: antialiased; 
      -moz-osx-font-smoothing: grayscale; 
    }
    h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: var(--text); line-height: 1.3; letter-spacing: -0.01em; }
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    h4 { font-size: 16px; }
    p { margin-bottom: 12px; color: var(--text); }
    small { font-size: 12px; color: var(--text-muted); }
    a { text-decoration: none; color: var(--blue); transition: color 0.2s ease; }
    a:hover { color: var(--blue); filter: brightness(0.9); }
    button { font-family: 'DM Sans', sans-serif; }
    input, select, textarea { font-family: 'DM Sans', sans-serif; color: var(--text); }
    select option { background: ${isLight ? '#ffffff' : '#0f1621'}; color: var(--text); }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--blue) !important; background: var(--blue-dim) !important; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${isLight ? 'rgba(107, 114, 128, 0.3)' : 'rgba(26,143,255,0.25)'}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${isLight ? 'rgba(107, 114, 128, 0.5)' : 'rgba(26,143,255,0.4)'}; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
    @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px ${isLight ? '#ffffff' : '#0f1621'} inset !important; -webkit-text-fill-color: var(--text) !important; }
  `;
};