// ─── SimTelecom Design System ────────────────────────────────────────────────
// Dark telecom aesthetic — consistent across all pages

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

export const fonts = {
  heading: "'Space Grotesk', sans-serif",
  body:    "'DM Sans', sans-serif",
};

// Shared card style
export const card = {
  background:    colors.bgCard,
  border:        `0.5px solid ${colors.border}`,
  borderRadius:  16,
  backdropFilter:'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:     '0 0 40px rgba(26,143,255,0.06), 0 16px 40px rgba(0,0,0,0.45)',
};

// Shared input style
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

// Shared primary button
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

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #070d18; color: #e8f0ff; font-family: 'DM Sans', sans-serif; }
  a { text-decoration: none; }
  button { font-family: 'DM Sans', sans-serif; }
  input, select, textarea { font-family: 'DM Sans', sans-serif; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: rgba(26,143,255,0.55) !important; background: rgba(26,143,255,0.06) !important; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(26,143,255,0.25); border-radius: 4px; }
  @keyframes gridScroll { from { background-position: 0 0; } to { background-position: 40px 40px; } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #0f1621 inset !important; -webkit-text-fill-color: #c8d4e8 !important; }
`;
