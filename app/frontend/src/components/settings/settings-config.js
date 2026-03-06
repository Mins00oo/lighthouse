import { themeConfig } from 'src/theme/theme-config';

// ----------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY = 'app-settings';

// ----------------------------------------------------------------------

export const defaultSettings = {
  colorScheme: themeConfig.defaultMode,
  direction: themeConfig.direction,
  contrast: 'default',
  navLayout: 'horizontal',
  primaryColor: 'default',
  navColor: 'integrate',
  compactLayout: true,
  fontSize: 14,
  fontFamily: themeConfig.fontFamily.primary,
};
