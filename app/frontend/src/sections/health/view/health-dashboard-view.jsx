import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';
import { fData, fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetUptime, useGetHealthStatus, useGetHealthHistory } from 'src/actions/health';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CARDS = [
  {
    key: 'status',
    title: 'Status',
    icon: 'solar:shield-check-bold',
    getValue: (status) => status?.status ?? '-',
    getColor: (status) => (status?.status === 'UP' ? 'success' : 'error'),
  },
  {
    key: 'uptime',
    title: 'Uptime',
    icon: 'solar:chart-2-bold',
    getValue: (_, uptime) => (uptime?.uptimePercent != null ? `${uptime.uptimePercent.toFixed(2)}` : '-'),
    unit: '%',
    color: 'primary',
  },
  {
    key: 'dbPool',
    title: 'DB Pool',
    icon: 'solar:server-bold',
    getValue: (status) =>
      status ? `${status.dbPoolActive} / ${status.dbPoolIdle}` : '-',
    subtitle: 'active / idle',
    color: 'info',
  },
  {
    key: 'disk',
    title: 'Disk Free',
    icon: 'solar:ssd-round-bold',
    getValue: (status) => (status?.diskFreeBytes != null ? fData(status.diskFreeBytes) : '-'),
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export function HealthDashboardView() {
  const t = useMonitoringTokens();

  const { healthStatus, healthStatusLoading, healthStatusError } = useGetHealthStatus();
  const { uptime, uptimeLoading } = useGetUptime();

  const historyFrom = useMemo(() => toKSTString(Date.now() - 24 * 60 * 60 * 1000), []);
  const historyTo = useMemo(() => toKSTString(), []);
  const { healthHistory } = useGetHealthHistory(undefined, historyFrom, historyTo);

  const historyChart = useMemo(() => buildHistoryChart(healthHistory), [healthHistory]);
  const loading = healthStatusLoading || uptimeLoading;

  const colorMap = {
    primary: { accent: t.accent.blue, bg: t.accent.blueMuted },
    success: { accent: t.status.success, bg: t.status.successMuted },
    error: { accent: t.status.error, bg: t.status.errorMuted },
    info: { accent: t.status.info, bg: t.status.infoMuted },
    warning: { accent: t.status.warning, bg: t.status.warningMuted },
  };

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        bgcolor: t.bg.body,
        minHeight: '100vh',
        '--layout-dashboard-content-pt': '16px',
        '--layout-dashboard-content-pb': '32px',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ fontSize: '1.25rem', fontWeight: 700, color: t.text.heading, lineHeight: 1.3 }}>
          Server Health
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          서버 상태 및 가용성 모니터링
        </Box>
      </Box>

      {/* Error Alert */}
      {healthStatusError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Picook 서버에 연결할 수 없습니다
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {CARDS.map((card) => {
            const cardColor = typeof card.getColor === 'function'
              ? card.getColor(healthStatus)
              : card.color;
            const colors = colorMap[cardColor] || colorMap.primary;
            const displayValue = card.getValue(healthStatus, uptime);
            const isStatusCard = card.key === 'status';
            const isUp = healthStatus?.status === 'UP';

            return (
              <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: isStatusCard && !loading
                      ? (isUp ? t.status.successMuted : t.status.errorMuted)
                      : t.bg.card,
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

                    {card.subtitle && (
                      <Box sx={{ fontSize: '0.65rem', color: t.text.disabled, mt: 0.25 }}>
                        {card.subtitle}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Health History Chart */}
      <HealthHistoryChart chart={historyChart} />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function HealthHistoryChart({ chart }) {
  const t = useMonitoringTokens();

  const chartOptions = useChart({
    colors: [t.chart.primary],
    chart: {
      background: 'transparent',
      toolbar: { show: false },
    },
    theme: { mode: t.mode },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      categories: chart?.categories ?? [],
      labels: { style: { fontSize: '10px', colors: t.chart.axis } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${fNumber(val)} ms`,
        style: { colors: [t.chart.axis] },
      },
    },
    grid: {
      borderColor: t.chart.grid,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: t.mode,
      y: { formatter: (val) => `${fNumber(val)} ms` },
    },
    legend: { show: false },
  });

  return (
    <Box
      sx={{
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${t.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>
          Health History
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          24시간 응답 시간 추이 (responseTimeMs)
        </Box>
      </Box>

      <Box sx={{ px: 1 }}>
        <Chart type="line" series={chart?.series ?? []} options={chartOptions} sx={{ height: 320 }} />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function formatTime(isoString) {
  if (!isoString) return '';
  const match = isoString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : isoString;
}

function buildHistoryChart(data) {
  if (!data || !data.length) {
    return { categories: [], series: [] };
  }

  return {
    categories: data.map((item) => formatTime(item.checkedAt)),
    series: [{ name: '응답 시간', data: data.map((item) => item.responseTimeMs ?? 0) }],
  };
}
