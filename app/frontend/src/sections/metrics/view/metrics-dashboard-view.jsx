import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';
import { fData, fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetMetricTrend, useGetSystemMetrics } from 'src/actions/metrics';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

import { OverviewFilterBar } from 'src/sections/overview/overview-filter-bar';

// ----------------------------------------------------------------------

const DEFAULT_RANGE = {
  from: toKSTString(Date.now() - 60 * 60 * 1000),
  to: toKSTString(),
  label: '1시간',
};

const CARDS = [
  {
    key: 'cpuUsagePercent',
    title: 'CPU 사용률',
    icon: 'solar:monitor-bold',
    format: (v) => `${v.toFixed(1)}`,
    unit: '%',
    color: 'primary',
  },
  {
    key: 'memory',
    title: 'Memory',
    icon: 'solar:ssd-round-bold',
    getValue: (d) =>
      d ? `${fData(d.memoryUsedBytes)} / ${fData(d.memoryMaxBytes)}` : '-',
    color: 'info',
  },
  {
    key: 'jvmHeap',
    title: 'JVM Heap',
    icon: 'solar:cup-star-bold',
    getValue: (d) =>
      d ? `${fData(d.jvmHeapUsed)} / ${fData(d.jvmHeapMax)}` : '-',
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export function MetricsDashboardView() {
  const t = useMonitoringTokens();

  const [timeRange, setTimeRange] = useState(DEFAULT_RANGE);
  const handleTimeRangeChange = useCallback((range) => setTimeRange(range), []);

  const { from, to } = timeRange;

  const { systemMetrics, systemMetricsLoading } = useGetSystemMetrics();
  const { metricTrend } = useGetMetricTrend(undefined, from, to);

  const cpuTrendChart = useMemo(() => buildTrendChart(metricTrend, 'cpuUsagePercent', 'CPU %'), [metricTrend]);
  const memoryTrendChart = useMemo(() => buildTrendChart(metricTrend, 'memoryUsedBytes', 'Memory Used', true), [metricTrend]);
  const threadChart = useMemo(() => buildTrendChart(metricTrend, 'jvmThreadsLive', 'JVM Threads'), [metricTrend]);
  const hikariChart = useMemo(() => buildHikariChart(metricTrend), [metricTrend]);

  const colorMap = {
    primary: { accent: t.accent.blue, bg: t.accent.blueMuted },
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ fontSize: '1.25rem', fontWeight: 700, color: t.text.heading, lineHeight: 1.3 }}>
            Metrics
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            시스템 리소스 모니터링
          </Box>
        </Box>

        <OverviewFilterBar timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {CARDS.map((card) => {
            const colors = colorMap[card.color] || colorMap.primary;
            const displayValue = card.getValue
              ? card.getValue(systemMetrics)
              : systemMetrics?.[card.key] != null
                ? card.format(systemMetrics[card.key])
                : '-';

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

                    {systemMetricsLoading ? (
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
      </Box>

      {/* CPU & Memory Trend Charts */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MetricLineChart title="CPU Trend" subtitle="CPU 사용률 추이" chart={cpuTrendChart} unitSuffix="%" />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MetricLineChart title="Memory Trend" subtitle="메모리 사용량 추이" chart={memoryTrendChart} isBytes />
        </Grid>
      </Grid>

      {/* JVM Threads & HikariCP Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MetricLineChart title="JVM Thread Count" subtitle="JVM 라이브 스레드 수 추이" chart={threadChart} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <HikariStackedBarChart title="HikariCP Pool" subtitle="커넥션 풀 (active / idle)" chart={hikariChart} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Reusable chart components
// ----------------------------------------------------------------------

function MetricLineChart({ title, subtitle, chart, unitSuffix = '', isBytes = false }) {
  const t = useMonitoringTokens();

  const chartOptions = useChart({
    colors: [t.chart.primary],
    chart: { background: 'transparent', toolbar: { show: false } },
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
        formatter: (val) => (isBytes ? fData(val) : `${fNumber(val)}${unitSuffix}`),
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
      y: { formatter: (val) => (isBytes ? fData(val) : `${fNumber(val)}${unitSuffix}`) },
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
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>{title}</Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>{subtitle}</Box>
      </Box>
      <Box sx={{ px: 1 }}>
        <Chart type="line" series={chart?.series ?? []} options={chartOptions} sx={{ height: 320 }} />
      </Box>
    </Box>
  );
}

function HikariStackedBarChart({ title, subtitle, chart }) {
  const t = useMonitoringTokens();

  const chartOptions = useChart({
    colors: [t.chart.primary, t.chart.secondary ?? t.accent.blue],
    chart: { background: 'transparent', toolbar: { show: false }, stacked: true },
    theme: { mode: t.mode },
    plotOptions: { bar: { borderRadius: 2, columnWidth: '60%' } },
    xaxis: {
      categories: chart?.categories ?? [],
      labels: { style: { fontSize: '10px', colors: t.chart.axis } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => fNumber(val),
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
      y: { formatter: (val) => `${fNumber(val)} 개` },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: t.text.secondary },
    },
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
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>{title}</Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>{subtitle}</Box>
      </Box>
      <Box sx={{ px: 1 }}>
        <Chart type="bar" series={chart?.series ?? []} options={chartOptions} sx={{ height: 320 }} />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Data transforms
// ----------------------------------------------------------------------

function formatTime(isoString) {
  if (!isoString) return '';
  const match = isoString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : isoString;
}

function buildTrendChart(data, field, name, _isBytes = false) {
  if (!data || !data.length) {
    return { categories: [], series: [] };
  }

  return {
    categories: data.map((item) => formatTime(item.timestamp)),
    series: [{ name, data: data.map((item) => item[field] ?? 0) }],
  };
}

function buildHikariChart(data) {
  if (!data || !data.length) {
    return { categories: [], series: [] };
  }

  return {
    categories: data.map((item) => formatTime(item.timestamp)),
    series: [
      { name: 'Active', data: data.map((item) => item.hikariActive ?? 0) },
      { name: 'Idle', data: data.map((item) => item.hikariIdle ?? 0) },
    ],
  };
}
