// ----------------------------------------------------------------------
// Monitoring Design Tokens — Dark & Light mode
// ----------------------------------------------------------------------

const darkTokens = {
  mode: 'dark',

  // Backgrounds
  bg: {
    body: '#0B1120',
    surface: '#111927',
    card: '#1A2332',
    cardHover: '#1E2A3A',
    elevated: '#243447',
    input: '#0F1923',
  },

  // Borders
  border: {
    subtle: 'rgba(148, 163, 184, 0.08)',
    default: 'rgba(148, 163, 184, 0.12)',
    strong: 'rgba(148, 163, 184, 0.2)',
  },

  // Text
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    disabled: '#64748B',
    heading: '#F1F5F9',
  },

  // Accent
  accent: {
    blue: '#3B82F6',
    blueDark: '#2563EB',
    blueLight: '#60A5FA',
    blueMuted: 'rgba(59, 130, 246, 0.15)',
  },

  // Semantic / Status
  status: {
    success: '#10B981',
    successMuted: 'rgba(16, 185, 129, 0.12)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.12)',
    error: '#EF4444',
    errorMuted: 'rgba(239, 68, 68, 0.12)',
    info: '#06B6D4',
    infoMuted: 'rgba(6, 182, 212, 0.12)',
  },

  // Chart colors
  chart: {
    info: '#38BDF8',
    warn: '#FBBF24',
    error: '#F87171',
    fatal: '#F43F5E',
    success: '#34D399',
    primary: '#3B82F6',
    purple: '#A78BFA',
    grid: 'rgba(148, 163, 184, 0.08)',
    axis: '#64748B',
  },

  // Misc
  shadow: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
  shadowLg: '0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
  radius: '6px',
  radiusSm: '4px',
};

// ----------------------------------------------------------------------

const lightTokens = {
  mode: 'light',

  // Backgrounds
  bg: {
    body: '#F1F5F9',
    surface: '#E8ECF1',
    card: '#FFFFFF',
    cardHover: '#F8FAFC',
    elevated: '#F1F5F9',
    input: '#F8FAFC',
  },

  // Borders
  border: {
    subtle: 'rgba(100, 116, 139, 0.10)',
    default: 'rgba(100, 116, 139, 0.18)',
    strong: 'rgba(100, 116, 139, 0.28)',
  },

  // Text
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    disabled: '#94A3B8',
    heading: '#0F172A',
  },

  // Accent
  accent: {
    blue: '#2563EB',
    blueDark: '#1D4ED8',
    blueLight: '#3B82F6',
    blueMuted: 'rgba(37, 99, 235, 0.10)',
  },

  // Semantic / Status
  status: {
    success: '#059669',
    successMuted: 'rgba(5, 150, 105, 0.10)',
    warning: '#D97706',
    warningMuted: 'rgba(217, 119, 6, 0.10)',
    error: '#DC2626',
    errorMuted: 'rgba(220, 38, 38, 0.08)',
    info: '#0891B2',
    infoMuted: 'rgba(8, 145, 178, 0.10)',
  },

  // Chart colors
  chart: {
    info: '#0EA5E9',
    warn: '#F59E0B',
    error: '#EF4444',
    fatal: '#E11D48',
    success: '#10B981',
    primary: '#2563EB',
    purple: '#8B5CF6',
    grid: 'rgba(100, 116, 139, 0.10)',
    axis: '#94A3B8',
  },

  // Misc
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowLg: '0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  radius: '6px',
  radiusSm: '4px',
};

// ----------------------------------------------------------------------

/** Return tokens for the given color-scheme mode ('light' | 'dark') */
export function getTokens(mode) {
  return mode === 'dark' ? darkTokens : lightTokens;
}

/** @deprecated — use getTokens(mode) or useMonitoringTokens() hook instead */
export const v2 = darkTokens;
