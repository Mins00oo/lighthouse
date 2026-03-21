import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';
import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetShortsStats,
  useGetUserActivity,
  useGetBusinessSummary,
} from 'src/actions/business';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

import { OverviewFilterBar } from 'src/sections/overview/overview-filter-bar';

// ----------------------------------------------------------------------

const DEFAULT_RANGE = {
  from: toKSTString(Date.now() - 24 * 60 * 60 * 1000),
  to: toKSTString(),
  label: '24시간',
};

const CARDS = [
  {
    key: 'dau',
    title: 'DAU',
    icon: 'solar:users-group-rounded-bold',
    format: (v) => fShortenNumber(v),
    color: 'primary',
  },
  {
    key: 'totalCoachingCompleted',
    title: '코칭 완료',
    icon: 'solar:check-circle-bold',
    format: (v) => fShortenNumber(v),
    unit: '건',
    color: 'success',
  },
  {
    key: 'totalShortsToday',
    title: '쇼츠 변환',
    icon: 'solar:video-frame-play-horizontal-bold',
    format: (v) => fShortenNumber(v),
    unit: '건',
    color: 'info',
  },
  {
    key: 'shortsCacheHitRate',
    title: '캐시 히트율',
    icon: 'solar:graph-up-bold',
    format: (v) => `${(v * 100).toFixed(1)}`,
    unit: '%',
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export function BusinessDashboardView() {
  const t = useMonitoringTokens();

  const [timeRange, setTimeRange] = useState(DEFAULT_RANGE);
  const handleTimeRangeChange = useCallback((range) => setTimeRange(range), []);

  const { from, to } = timeRange;

  const { businessSummary, businessSummaryLoading } = useGetBusinessSummary();
  const { userActivity } = useGetUserActivity(undefined, from, to);
  const { shortsStats } = useGetShortsStats(undefined, from, to);

  const dauChart = useMemo(() => buildDauChart(userActivity), [userActivity]);
  const coachingChart = useMemo(() => buildCoachingChart(userActivity), [userActivity]);
  const shortsChart = useMemo(() => buildShortsChart(shortsStats), [shortsStats]);

  const colorMap = {
    primary: { accent: t.accent.blue, bg: t.accent.blueMuted },
    success: { accent: t.status.success, bg: t.status.successMuted },
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
            Business
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            비즈니스 지표 대시보드
          </Box>
        </Box>

        <OverviewFilterBar timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {CARDS.map((card) => {
            const colors = colorMap[card.color] || colorMap.primary;
            const rawValue = businessSummary?.[card.key];
            const displayValue = rawValue != null ? card.format(rawValue) : '-';

            return (
              <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
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

                    {businessSummaryLoading ? (
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

      {/* DAU/MAU & Coaching Trend */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BusinessLineChart
            title="DAU / MAU Trend"
            subtitle="일간 / 월간 활성 사용자 추이"
            chart={dauChart}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BusinessLineChart
            title="코칭 Trend"
            subtitle="코칭 요청 수 추이"
            chart={coachingChart}
          />
        </Grid>
      </Grid>

      {/* Shorts Stats */}
      <ShortsChart
        title="쇼츠 성공률 / 변환 시간"
        subtitle="쇼츠 변환 성공률 및 평균 변환 시간 추이"
        chart={shortsChart}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Chart components
// ----------------------------------------------------------------------

function BusinessLineChart({ title, subtitle, chart }) {
  const t = useMonitoringTokens();

  const chartOptions = useChart({
    colors: [t.chart.primary, t.chart.secondary ?? t.status.warning],
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
        formatter: (val) => fShortenNumber(val),
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
      y: { formatter: (val) => fNumber(val) },
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
        <Chart type="line" series={chart?.series ?? []} options={chartOptions} sx={{ height: 320 }} />
      </Box>
    </Box>
  );
}

function ShortsChart({ title, subtitle, chart }) {
  const t = useMonitoringTokens();

  const chartOptions = useChart({
    colors: [t.chart.primary, t.status.warning],
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: t.mode },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      categories: chart?.categories ?? [],
      labels: { style: { fontSize: '10px', colors: t.chart.axis } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: { text: '성공률 (%)', style: { color: t.text.secondary, fontSize: '11px' } },
        labels: {
          formatter: (val) => `${fNumber(val)}%`,
          style: { colors: [t.chart.axis] },
        },
      },
      {
        opposite: true,
        title: { text: '변환 시간 (ms)', style: { color: t.text.secondary, fontSize: '11px' } },
        labels: {
          formatter: (val) => `${fNumber(val)}`,
          style: { colors: [t.chart.axis] },
        },
      },
    ],
    grid: {
      borderColor: t.chart.grid,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    tooltip: { theme: t.mode },
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
        <Chart type="line" series={chart?.series ?? []} options={chartOptions} sx={{ height: 320 }} />
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
  if (match) return match[1];
  const dateMatch = isoString.match(/(\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : isoString;
}

function buildDauChart(data) {
  if (!data || !data.length) return { categories: [], series: [] };

  return {
    categories: data.map((item) => formatTime(item.collectedAt)),
    series: [
      { name: 'DAU', data: data.map((item) => item.dau ?? 0) },
      { name: 'MAU', data: data.map((item) => item.mau ?? 0) },
    ],
  };
}

function buildCoachingChart(data) {
  if (!data || !data.length) return { categories: [], series: [] };

  return {
    categories: data.map((item) => formatTime(item.collectedAt)),
    series: [
      { name: '신규 사용자', data: data.map((item) => item.newUsersToday ?? 0) },
    ],
  };
}

function buildShortsChart(data) {
  if (!data || !data.length) return { categories: [], series: [] };

  return {
    categories: data.map((item) => formatTime(item.collectedAt)),
    series: [
      { name: '성공률 (%)', data: data.map((item) => (item.successRate ?? 0) * 100) },
      { name: '변환 시간 (ms)', data: data.map((item) => item.avgConversionTimeMs ?? 0) },
    ],
  };
}
