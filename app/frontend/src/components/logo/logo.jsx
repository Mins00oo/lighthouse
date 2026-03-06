import { useId } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export function Logo({ sx, disabled, className, href = '/', isSingle = true, ...other }) {
  const theme = useTheme();

  const gradientId = useId();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  /*
    * OR using local (public folder)
    *
    const singleLogo = (
      <img
        alt="Single logo"
        src={`${CONFIG.assetsDir}/logo/logo-single.svg`}
        width="100%"
        height="100%"
      />
    );

    const fullLogo = (
      <img
        alt="Full logo"
        src={`${CONFIG.assetsDir}/logo/logo-full.svg`}
        width="100%"
        height="100%"
      />
    );
    *
    */

  const singleLogo = (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${gradientId}-1`} x1="50" y1="8" x2="50" y2="93" gradientUnits="userSpaceOnUse">
          <stop stopColor={PRIMARY_LIGHT} />
          <stop offset="1" stopColor={PRIMARY_DARKER} />
        </linearGradient>
        <radialGradient id={`${gradientId}-g`} cx="50%" cy="30%" r="45%">
          <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={PRIMARY_MAIN} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Light glow */}
      <circle cx="50" cy="28" r="20" fill={`url(#${gradientId}-g)`} />
      {/* Light beams */}
      <polygon points="50,22 22,10 27,16" fill={PRIMARY_MAIN} opacity="0.25" />
      <polygon points="50,22 78,10 73,16" fill={PRIMARY_MAIN} opacity="0.25" />
      {/* Lamp room cap */}
      <polygon points="38,20 62,20 56,14 44,14" fill={`url(#${gradientId}-1)`} />
      {/* Dome */}
      <ellipse cx="50" cy="14" rx="6" ry="4" fill={PRIMARY_MAIN} />
      {/* Lamp room */}
      <rect x="40" y="20" width="20" height="14" rx="2" fill={PRIMARY_MAIN} />
      <rect x="43" y="22" width="14" height="10" rx="1" fill={PRIMARY_LIGHT} opacity="0.45" />
      {/* Body */}
      <polygon points="38,34 62,34 58,82 42,82" fill={`url(#${gradientId}-1)`} />
      {/* Stripes */}
      <polygon points="38.8,38 61.2,38 60.4,44 39.6,44" fill="white" opacity="0.85" />
      <polygon points="40.4,50 59.6,50 58.8,56 41.2,56" fill="white" opacity="0.85" />
      <polygon points="42,62 58,62 57.2,68 42.8,68" fill="white" opacity="0.85" />
      {/* Door */}
      <rect x="46" y="72" width="8" height="10" rx="4" fill="white" opacity="0.85" />
      {/* Base */}
      <rect x="36" y="82" width="28" height="5" rx="1" fill={PRIMARY_MAIN} />
      <rect x="30" y="87" width="40" height="5" rx="2" fill={PRIMARY_DARKER} opacity="0.8" />
    </svg>
  );

  const fullLogo = (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${gradientId}-f1`} x1="20" y1="2" x2="20" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={PRIMARY_LIGHT} />
          <stop offset="1" stopColor={PRIMARY_DARKER} />
        </linearGradient>
      </defs>
      {/* Mini lighthouse icon */}
      <polygon points="15,10 25,10 23,7 17,7" fill={PRIMARY_MAIN} />
      <ellipse cx="20" cy="7" rx="3" ry="2" fill={PRIMARY_MAIN} />
      <rect x="15" y="10" width="10" height="7" rx="1" fill={PRIMARY_MAIN} />
      <rect x="16.5" y="11" width="7" height="5" rx="0.5" fill={PRIMARY_LIGHT} opacity="0.4" />
      <polygon points="15,17 25,17 23.5,41 16.5,41" fill={`url(#${gradientId}-f1)`} />
      <polygon points="15.2,19 24.8,19 24.4,22 15.6,22" fill="white" opacity="0.85" />
      <polygon points="16,25 24,25 23.6,28 16.4,28" fill="white" opacity="0.85" />
      <polygon points="16.8,31 23.2,31 22.8,34 17.2,34" fill="white" opacity="0.85" />
      <rect x="18.5" y="36" width="3" height="5" rx="1.5" fill="white" opacity="0.85" />
      <rect x="14" y="41" width="12" height="3" rx="0.5" fill={PRIMARY_MAIN} />
      <rect x="11" y="44" width="18" height="3" rx="1" fill={PRIMARY_DARKER} opacity="0.8" />
      {/* "Lighthouse" text */}
      <text
        x="44"
        y="33"
        fontFamily="Public Sans Variable, Inter, Arial, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="-0.5"
        fill={TEXT_PRIMARY}
      >
        Lighthouse
      </text>
    </svg>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 160, height: 40 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
