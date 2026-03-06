import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { Iconify } from 'src/components/iconify';

import { V2InfoTip } from './v2-info-tip';

// ----------------------------------------------------------------------

export function V2WidgetSummary({ title, total, unit, icon, color = 'primary', info, loading, sx }) {
  const t = useMonitoringTokens();

  const colorMap = {
    primary: t.accent.blue,
    error: t.status.error,
    info: t.status.info,
    warning: t.status.warning,
    success: t.status.success,
  };

  const bgMap = {
    primary: t.accent.blueMuted,
    error: t.status.errorMuted,
    info: t.status.infoMuted,
    warning: t.status.warningMuted,
    success: t.status.successMuted,
  };

  const accentColor = colorMap[color] || t.accent.blue;
  const bgColor = bgMap[color] || t.accent.blueMuted;

  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${t.border.subtle}`,
        borderLeft: `3px solid ${accentColor}`,
        transition: 'border-color 0.2s',
        '&:hover': {
          borderColor: t.border.default,
          borderLeftColor: accentColor,
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: t.radiusSm,
          bgcolor: bgColor,
          color: accentColor,
        }}
      >
        <Iconify icon={icon} width={24} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: t.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 0.5,
          }}
        >
          {title}
          <V2InfoTip text={info} />
        </Box>

        {loading ? (
          <CircularProgress size={24} sx={{ color: accentColor }} />
        ) : (
          <Box
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: t.text.primary,
              lineHeight: 1.2,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {total ?? '-'}
            {unit && (
              <Box
                component="span"
                sx={{ ml: 0.5, fontSize: '0.875rem', fontWeight: 500, color: t.text.secondary }}
              >
                {unit}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
