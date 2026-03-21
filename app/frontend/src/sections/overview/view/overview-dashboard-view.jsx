import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { useGetHealthStatus } from 'src/actions/health';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetBusinessSummary } from 'src/actions/business';
import {
  useGetSlowApis,
  useGetErrorLogs,
  useGetResponseTime,
  useGetRequestVolume,
  useGetOverviewSummary,
} from 'src/actions/overview';

import { Iconify } from 'src/components/iconify';

import { OverviewFilterBar } from '../overview-filter-bar';
import { OverviewSummaryCards } from '../overview-summary-cards';
import { OverviewSlowApiTable } from '../overview-slow-api-table';
import { OverviewErrorLogTable } from '../overview-error-log-table';
import { OverviewResponseTimeChart } from '../overview-response-time-chart';
import { OverviewRequestVolumeChart } from '../overview-request-volume-chart';

// ----------------------------------------------------------------------

const DEFAULT_RANGE = {
  from: toKSTString(Date.now() - 60 * 60 * 1000),
  to: toKSTString(),
  label: '1시간',
};

/** 선택된 기간에 따라 차트 간격을 자동 결정 */
function deriveInterval(label) {
  switch (label) {
    case '15분': return 1;
    case '1시간': return 10;
    case '6시간': return 30;
    case '24시간': return 60;
    case '7일': return 360;
    default: return 60;
  }
}

// ----------------------------------------------------------------------

export function OverviewDashboardView() {
  const t = useMonitoringTokens();

  const [timeRange, setTimeRange] = useState(DEFAULT_RANGE);

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  const router = useRouter();

  const { from, to } = timeRange;
  const interval = deriveInterval(timeRange.label);

  const handleChartRangeSelect = useCallback(
    (rangeFrom, rangeTo) => {
      const params = new URLSearchParams({ from: rangeFrom, to: rangeTo });
      router.push(`${paths.dashboard.logs.root}?${params.toString()}`);
    },
    [router]
  );

  // --- SWR Hooks ---
  const { summary, summaryLoading } = useGetOverviewSummary(from, to);
  const { requestVolume } = useGetRequestVolume(from, to, interval);
  const { responseTime } = useGetResponseTime(from, to, interval);
  const { slowApis } = useGetSlowApis(from, to);
  const { errorLogs } = useGetErrorLogs(from, to);

  // --- Health & Business ---
  const { healthStatus, healthStatusLoading, healthStatusError } = useGetHealthStatus();
  const { businessSummary, businessSummaryLoading } = useGetBusinessSummary();

  // --- Chart data transforms ---
  const requestVolumeChart = useMemo(() => buildRequestVolumeChart(requestVolume), [requestVolume]);
  const responseTimeChart = useMemo(() => buildResponseTimeChart(responseTime), [responseTime]);

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
            Overview
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            시스템 전체 요약 대시보드
          </Box>
        </Box>

        <OverviewFilterBar
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </Box>

      {/* Server Health Badge */}
      <Box sx={{ mb: 2 }}>
        {healthStatusError ? (
          <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
            Picook 서버에 연결할 수 없습니다
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              bgcolor: t.bg.card,
              borderRadius: t.radius,
              border: `1px solid ${t.border.subtle}`,
            }}
          >
            {healthStatusLoading ? (
              <Skeleton variant="rounded" width={200} height={24} />
            ) : (
              <>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: healthStatus?.status === 'UP' ? t.status.success : t.status.error,
                    boxShadow: `0 0 6px ${healthStatus?.status === 'UP' ? t.status.success : t.status.error}`,
                  }}
                />
                <Box sx={{ fontSize: '0.8rem', fontWeight: 600, color: t.text.primary }}>
                  Picook 서버: {healthStatus?.status || 'UNKNOWN'}
                </Box>
                {healthStatus?.responseTimeMs > 0 && (
                  <Box sx={{ fontSize: '0.7rem', color: t.text.disabled }}>
                    ({healthStatus.responseTimeMs}ms)
                  </Box>
                )}
                {healthStatus?.checkedAt && (
                  <Box sx={{ fontSize: '0.7rem', color: t.text.disabled, ml: 'auto' }}>
                    마지막 체크: {healthStatus.checkedAt?.replace('T', ' ').substring(0, 19)}
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <OverviewSummaryCards data={summary} loading={summaryLoading} />
      </Box>

      {/* Business Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {[
            { key: 'dau', title: 'DAU', icon: 'solar:users-group-rounded-bold', color: t.accent.blue },
            { key: 'totalCoachingToday', title: '오늘 코칭', icon: 'solar:chef-hat-bold', color: t.accent.green },
            { key: 'totalShortsToday', title: '쇼츠 변환', icon: 'solar:video-frame-play-vertical-bold', color: t.accent.purple },
          ].map((card) => (
            <Grid key={card.key} size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: t.bg.card,
                  borderRadius: t.radius,
                  border: `1px solid ${t.border.subtle}`,
                  borderLeft: `3px solid ${card.color}`,
                }}
              >
                <Iconify icon={card.icon} width={22} sx={{ color: card.color, flexShrink: 0 }} />
                <Box>
                  <Box sx={{ fontSize: '0.7rem', fontWeight: 500, color: t.text.secondary }}>
                    {card.title}
                  </Box>
                  {businessSummaryLoading ? (
                    <Skeleton variant="text" width={50} height={28} />
                  ) : (
                    <Box sx={{ fontSize: '1.25rem', fontWeight: 700, color: t.text.primary }}>
                      {businessSummary?.[card.key] != null ? fShortenNumber(businessSummary[card.key]) : '-'}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OverviewRequestVolumeChart chart={requestVolumeChart} onRangeSelect={handleChartRangeSelect} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OverviewResponseTimeChart chart={responseTimeChart} />
        </Grid>
      </Grid>

      {/* Tables */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OverviewSlowApiTable data={slowApis} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OverviewErrorLogTable data={errorLogs} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Data transforms: API response → chart format
// ----------------------------------------------------------------------

function formatTime(isoString) {
  if (!isoString) return '';
  // "2026-03-06T14:00:00" → "14:00"
  const match = isoString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : isoString;
}

function buildRequestVolumeChart(data) {
  if (!data || !data.length) {
    return { categories: [], series: [], rawTimes: [] };
  }

  return {
    categories: data.map((item) => formatTime(item.time)),
    series: [{ name: '요청 수', data: data.map((item) => item.requestCount ?? 0) }],
    rawTimes: data.map((item) => item.time),
  };
}

function buildResponseTimeChart(data) {
  if (!data || !data.length) {
    return { categories: [], series: [] };
  }

  return {
    categories: data.map((item) => formatTime(item.time)),
    series: [
      { name: 'P95', data: data.map((item) => item.p95Ms ?? 0) },
      { name: 'P99', data: data.map((item) => item.p99Ms ?? 0) },
    ],
  };
}
