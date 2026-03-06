import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fShortenNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CARDS = [
  {
    key: 'totalRequests',
    title: '총 요청 수',
    icon: 'solar:bill-list-bold',
    color: 'primary',
    format: (v) => fShortenNumber(v),
  },
  {
    key: 'errorCount',
    title: '에러 건수',
    icon: 'solar:danger-triangle-bold',
    color: 'error',
    format: (v) => fShortenNumber(v),
    unit: '건',
  },
  {
    key: 'avgResponseTimeMs',
    title: '평균 응답 시간',
    icon: 'solar:clock-circle-bold',
    color: 'info',
    format: (v) => Math.round(v),
    unit: 'ms',
  },
];

// ----------------------------------------------------------------------

export function OverviewSummaryCards({ data, loading }) {
  const t = useMonitoringTokens();

  const colorMap = {
    primary: { accent: t.accent.blue, bg: t.accent.blueMuted },
    error: { accent: t.status.error, bg: t.status.errorMuted },
    info: { accent: t.status.info, bg: t.status.infoMuted },
  };

  return (
    <Grid container spacing={2}>
      {CARDS.map((card) => {
        const colors = colorMap[card.color] || colorMap.primary;
        const rawValue = data?.[card.key];
        const displayValue = rawValue != null ? card.format(rawValue) : '-';

        return (
          <Grid key={card.key} size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: t.bg.card,
                borderRadius: t.radius,
                border: `1px solid ${t.border.subtle}`,
                borderLeft: `3px solid ${colors.accent}`,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: t.border.default, borderLeftColor: colors.accent },
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
                  bgcolor: colors.bg,
                  color: colors.accent,
                }}
              >
                <Iconify icon={card.icon} width={24} />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: t.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 0.5,
                  }}
                >
                  {card.title}
                </Box>

                {loading ? (
                  <Skeleton variant="text" width={80} height={32} />
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
                    {displayValue}
                    {card.unit && (
                      <Box
                        component="span"
                        sx={{ ml: 0.5, fontSize: '0.875rem', fontWeight: 500, color: t.text.secondary }}
                      >
                        {card.unit}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
