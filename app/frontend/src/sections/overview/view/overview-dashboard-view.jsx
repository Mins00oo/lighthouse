import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetSlowApis,
  useGetErrorLogs,
  useGetResponseTime,
  useGetRequestVolume,
  useGetOverviewSummary,
} from 'src/actions/overview';

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

      {/* Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <OverviewSummaryCards data={summary} loading={summaryLoading} />
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
