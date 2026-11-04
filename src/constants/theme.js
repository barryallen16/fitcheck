export const COLORS = {
  // Comic Book Panel Inks & Gutters
  bg: '#0B0C12', // Gutter / deep canvas
  card: '#151722', // Story panel surface
  cardLight: '#1E2130', // Inset box / active panel
  cardHover: '#272B3E', // Elevated surface

  // Core Anchors requested by user
  primary: '#D83995', // Action Magenta / Hot Pink
  primaryMuted: '#9B2369',
  primaryGlow: 'rgba(216, 57, 149, 0.10)',

  secondary: '#0593C6', // Electric Cyan / Sky Blue
  secondaryMuted: '#046B90',
  accent: '#0593C6',
  accentMuted: '#046B90',
  accentGlow: 'rgba(5, 147, 198, 0.10)',

  // Comic CMYK & Ben-Day Accent Tones
  yellow: '#FFD400', // Action Yellow / POW Gold
  orange: '#FFD400', // Warning & bright highlight
  green: '#10B981', // Panel Green / success status
  red: '#EF4444', // Impact Red / alert & destructive
  redMuted: '#991B1B',
  purple: '#7A5AF8', // Shadow Violet

  // Comic Dialogue Typography Ramp
  text: '#FCFFFF', // Comic White
  textDim: '#A0A5B8', // Newsprint Silver
  textMuted: '#656B80', // Pencil Gray

  // Inked Panel Hairlines
  border: '#2D3245',
  borderLight: '#3A4058',
  borderActive: '#D83995',

  overlay: 'rgba(11, 12, 18, 0.88)',
  white: '#FCFFFF',
  black: '#000000',
  tabBar: '#0B0C12',
  tabInactive: '#656B80',
};

export const FONTS = {
  pixel: 'GeistPixel',
  regular: 'Geist-Regular',
  medium: 'Geist-Medium',
  semiBold: 'Geist-SemiBold',
  bold: 'Geist-Bold',
};

export const TYPE = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 22,
  xxl: 26,
  hero: 32,
};

// Strict 4px grid
export const GAP = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// 6-8px disciplined radius (no bloated 20-30px bubble radii)
export const RAD = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  full: 999,
};
