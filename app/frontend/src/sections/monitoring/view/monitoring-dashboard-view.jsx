import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { toKSTString } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetLogVolume,
  useGetApiRanking,
  useGetErrorTrend,
  useGetServerStatus,
  useGetRecentErrors,
  useGetLogLevelDist,
  useGetDashboardSummary,
} from 'src/actions/monitoring';

import { TimeRangePicker } from '../time-range-picker';
import { MonitoringLogVolume } from '../monitoring-log-volume';
import { MonitoringApiRanking } from '../monitoring-api-ranking';
import { MonitoringErrorTrend } from '../monitoring-error-trend';
import { MonitoringLogLevelPie } from '../monitoring-log-level-pie';
import { MonitoringRecentErrors } from '../monitoring-recent-errors';
import { MonitoringServerStatus } from '../monitoring-server-status';
import { MonitoringWidgetSummary } from '../monitoring-widget-summary';

// ----------------------------------------------------------------------

const DEFAULT_RANGE = {
  from: toKSTString(Date.now() - 60 * 60 * 1000),
  to: toKSTString(),
  label: 'Last 1 hour',
};

// ----------------------------------------------------------------------

export function MonitoringDashboardView() {
  const [timeRange, setTimeRange] = useState(DEFAULT_RANGE);

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  const { from, to } = timeRange;

  // API hooks
  const { summary, summaryLoading } = useGetDashboardSummary(from, to);
  const { servers } = useGetServerStatus(30);
  const { logVolume } = useGetLogVolume(from, to);
  const { logLevelDist } = useGetLogLevelDist(from, to);
  const { errorTrend } = useGetErrorTrend(from, to);
  const { apiRanking } = useGetApiRanking(from, to);
  const { recentErrors } = useGetRecentErrors(from, to);

  // Transform log volume for stacked area chart
  const logVolumeChart = buildLogVolumeChart(logVolume);

  // Transform log level distribution for donut chart
  const logLevelChart = buildLogLevelChart(logLevelDist);

  // Transform error trend for line chart
  const errorTrendChart = buildErrorTrendChart(errorTrend);

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Monitoring Dashboard</Typography>
        <TimeRangePicker value={timeRange} onChange={handleTimeRangeChange} />
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MonitoringWidgetSummary
            title="Total Requests"
            total={summary?.totalRequestCount}
            icon="solar:bill-list-bold"
            color="primary"
            loading={summaryLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MonitoringWidgetSummary
            title="Error Rate"
            total={summary?.errorRate != null ? `${summary.errorRate.toFixed(2)}` : null}
            unit="%"
            icon="solar:danger-triangle-bold"
            color="error"
            loading={summaryLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MonitoringWidgetSummary
            title="Avg Response"
            total={summary?.avgResponseTimeMs != null ? `${Math.round(summary.avgResponseTimeMs)}` : null}
            unit="ms"
            icon="solar:clock-circle-bold"
            color="info"
            loading={summaryLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MonitoringWidgetSummary
            title="P95 Response"
            total={summary?.p95ResponseTimeMs != null ? `${Math.round(summary.p95ResponseTimeMs)}` : null}
            unit="ms"
            icon="solar:sort-by-time-bold-duotone"
            color="warning"
            loading={summaryLoading}
          />
        </Grid>

        {/* Log Volume + Log Level Pie */}
        <Grid size={{ xs: 12, md: 8 }}>
          <MonitoringLogVolume
            title="Log Volume"
            subheader="Logs by level over time"
            chart={logVolumeChart}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MonitoringLogLevelPie
            title="Log Level Distribution"
            chart={logLevelChart}
          />
        </Grid>

        {/* Error Trend + Server Status */}
        <Grid size={{ xs: 12, md: 8 }}>
          <MonitoringErrorTrend
            title="Error Trend"
            subheader="Error & Fatal counts over time"
            chart={errorTrendChart}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MonitoringServerStatus
            title="Server Status"
            data={servers}
          />
        </Grid>

        {/* API Ranking + Recent Errors */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MonitoringApiRanking
            title="API Ranking (Top 10)"
            data={apiRanking}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MonitoringRecentErrors
            title="Recent Errors"
            data={recentErrors}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function buildLogVolumeChart(data) {
  if (!data || !data.length) {
    return { categories: [], series: [] };
  }

  const categories = data.map((item) => item.time ?? '');

  const series = [
    { name: 'INFO', data: data.map((item) => item.infoCount ?? 0) },
    { name: 'WARN', data: data.map((item) => item.warnCount ?? 0) },
    { name: 'ERROR', data: data.map((item) => item.errorCount ?? 0) },
  ];

  return { categories, series };
}

function buildLogLevelChart(data) {
  if (!data || !data.length) {
    return { series: [] };
  }

  const series = data.map((item) => ({
    label: item.level,
    value: item.count ?? 0,
  }));

  return { series };
}

function buildErrorTrendChart(data) {
  if (!data || !data.length) {
    return { categories: [], series: [] };
  }

  const categories = data.map((item) => item.time ?? '');

  const series = [
    { name: 'ERROR', data: data.map((item) => item.errorCount ?? 0) },
    { name: 'FATAL', data: data.map((item) => item.fatalCount ?? 0) },
  ];

  return { categories, series };
}
