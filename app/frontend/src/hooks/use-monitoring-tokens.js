import { useMemo } from 'react';

import { useColorScheme } from '@mui/material/styles';

import { getTokens } from 'src/sections/overview-v2/v2-tokens';

// ----------------------------------------------------------------------

/**
 * Returns monitoring design tokens for the current color scheme (light/dark).
 */
export function useMonitoringTokens() {
  const { mode, systemMode } = useColorScheme();

  const resolvedMode = mode === 'system' ? systemMode : mode;

  return useMemo(() => getTokens(resolvedMode || 'light'), [resolvedMode]);
}
