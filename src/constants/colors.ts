export const Colors = {
  // Accent
  primary: '#2a6cbf',
  accentLight: '#3f8bd8',
  accentMid: '#5aa6e6',
  accentMid2: '#7cc1e9',

  // Text
  ink: '#14222e',
  body: '#51687a',
  muted: '#6f8799',
  faint: '#8198a8',
  faint2: '#9bb0c2',
  eyebrow: '#7aa6cf',

  // Semantic
  destructive: '#c94a4a',

  // Backgrounds (light screens)
  bgLight: ['#f4fafe', '#e3eff8', '#d8e9f6'] as const,
  bgReveal: ['#eef6fd', '#dde9f5', '#cfe0f1'] as const,
  bgStart: ['#eaf4fc', '#cfe3f4', '#b7d3ec'] as const,

  // Backgrounds (session screens)
  bgSession: ['#0e3a63', '#14507f', '#1b6193'] as const,
  bgRefreeze: ['#0a2c4d', '#0c324f'] as const,
  bgPaused: ['#3a5a78', '#456a8c'] as const,

  // Ice profiles
  iceGlacier: ['#eef9ff', '#b9ddf3', '#4ea6dd'] as const,
  iceFrost: ['#ffffff', '#eaf3fa', '#cfe0ee'] as const,

  // Cards
  cardWhiteSelected: 'rgba(255,255,255,0.72)',
  cardWhiteIdle: 'rgba(255,255,255,0.5)',
  cardBorder: 'rgba(255,255,255,0.85)',

  // Tracks / rings
  track: 'rgba(31,77,120,0.13)',
  trackDark: 'rgba(255,255,255,0.25)',

  // White
  white: '#ffffff',
} as const;
