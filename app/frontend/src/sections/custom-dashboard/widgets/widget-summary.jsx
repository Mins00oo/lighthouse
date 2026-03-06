import { useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { useGetDashboardSummary } from 'src/actions/monitoring';

import { Iconify } from 'src/components/iconify';

import { V2InfoTip } from 'src/sections/overview-v2/v2-info-tip';

// ----------------------------------------------------------------------

const VARIANTS = {
  'summary-total-requests': {
    title: 'Total Requests',
    icon: 'solar:bill-list-bold',
    color: 'primary',
    info: '선택한 시간 범위 내 수신된 전체 HTTP 요청 수',
    extract: (s) => s?.totalRequestCount,
  },
  'summary-error-rate': {
    title: 'Error Rate',
    icon: 'solar:danger-triangle-bold',
    color: 'error',
    info: '전체 요청 중 4xx/5xx 응답 비율',
    unit: '%',
    extract: (s) => (s?.errorRate != null ? `${s.errorRate.toFixed(2)}` : null),
  },
  'summary-avg-response': {
    title: 'Avg Response',
    icon: 'solar:clock-circle-bold',
    color: 'info',
    info: '전체 요청의 평균 응답 시간 (ms)',
    unit: 'ms',
    extract: (s) => (s?.avgResponseTimeMs != null ? `${Math.round(s.avgResponseTimeMs)}` : null),
  },
  'summary-p95-response': {
    title: 'P95 Response',
    icon: 'solar:sort-by-time-bold-duotone',
    color: 'warning',
    info: '상위 5% 느린 요청의 응답 시간. 대부분의 사용자가 체감하는 최대 지연',
    unit: 'ms',
    extract: (s) => (s?.p95ResponseTimeMs != null ? `${Math.round(s.p95ResponseTimeMs)}` : null),
  },
};

// ----------------------------------------------------------------------

export function WidgetSummary({ widgetId, from, to }) {
  const t = useMonitoringTokens();
  const { summary, summaryLoading } = useGetDashboardSummary(from, to);

  const variant = VARIANTS[widgetId];

  const total = useMemo(() => variant?.extract(summary) ?? null, [variant, summary]);

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

  const accentColor = colorMap[variant?.color] || t.accent.blue;
  const bgColor = bgMap[variant?.color] || t.accent.blueMuted;

  if (!variant) return null;

  return (
    <Box
      sx={{
        p: 2.5,
        height: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'transparent',
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
        <Iconify icon={variant.icon} width={24} />
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
          {variant.title}
          <V2InfoTip text={variant.info} />
        </Box>

        {summaryLoading ? (
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
            {variant.unit && (
              <Box
                component="span"
                sx={{ ml: 0.5, fontSize: '0.875rem', fontWeight: 500, color: t.text.secondary }}
              >
                {variant.unit}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
