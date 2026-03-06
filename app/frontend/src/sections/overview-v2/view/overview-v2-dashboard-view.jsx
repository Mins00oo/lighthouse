import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

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

import { V2WidgetSummary } from '../v2-widget-summary';
import { V2LogLevelChart } from '../v2-log-level-chart';
import { V2LogVolumeChart } from '../v2-log-volume-chart';
import { V2ErrorTrendChart } from '../v2-error-trend-chart';
import { V2ApiRankingTable } from '../v2-api-ranking-table';
import { V2TimeRangePicker } from '../v2-time-range-picker';
import { V2RecentErrorsTable } from '../v2-recent-errors-table';
import { V2ServerStatusTable } from '../v2-server-status-table';

// ----------------------------------------------------------------------

const INFO = {
  totalRequests: '선택한 시간 범위 내 수신된 전체 HTTP 요청 수',
  errorRate: '전체 요청 중 4xx/5xx 응답 비율',
  avgResponse: '전체 요청의 평균 응답 시간 (ms)',
  p95Response: '상위 5% 느린 요청의 응답 시간. 대부분의 사용자가 체감하는 최대 지연',
  logVolume: '시간대별 로그 레벨(INFO/WARN/ERROR) 발생량 추이',
  serverStatus: '등록된 서버 인스턴스의 실시간 가동 상태 및 최근 로그/에러 수',
  errorTrend: '시간대별 ERROR 및 FATAL 로그 발생 추이. 급증 구간 확인용',
  logLevel: '선택한 시간 범위 내 전체 로그의 레벨별 비율 분포',
  apiRanking: '요청량 기준 상위 10개 API 엔드포인트의 응답 시간 및 에러율',
  recentErrors: '최근 발생한 예외(Exception) 목록과 발생 빈도. 빈도순 정렬',
};

// ----------------------------------------------------------------------

const DEFAULT_RANGE = {
  from: toKSTString(Date.now() - 60 * 60 * 1000),
  to: toKSTString(),
  label: 'Last 1 hour',
};

// ----------------------------------------------------------------------

export function OverviewV2DashboardView() {
  const t = useMonitoringTokens();

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

  // Transform data
  const logVolumeChart = buildLogVolumeChart(logVolume);
  const logLevelChart = buildLogLevelChart(logLevelDist);
  const errorTrendChart = buildErrorTrendChart(errorTrend);

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        bgcolor: t.bg.body,
        minHeight: '100vh',
        // override layout padding for a tighter feel
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
        }}
      >
        <Box>
          <Box
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: t.text.heading,
              lineHeight: 1.3,
            }}
          >
            Monitoring Dashboard
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            Real-time system overview
          </Box>
        </Box>

        <V2TimeRangePicker value={timeRange} onChange={handleTimeRangeChange} />
      </Box>

      <Grid container spacing={2}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <V2WidgetSummary
            title="Total Requests"
            total={summary?.totalRequestCount}
            icon="solar:bill-list-bold"
            color="primary"
            info={INFO.totalRequests}
            loading={summaryLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <V2WidgetSummary
            title="Error Rate"
            total={summary?.errorRate != null ? `${summary.errorRate.toFixed(2)}` : null}
            unit="%"
            icon="solar:danger-triangle-bold"
            color="error"
            info={INFO.errorRate}
            loading={summaryLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <V2WidgetSummary
            title="Avg Response"
            total={
              summary?.avgResponseTimeMs != null ? `${Math.round(summary.avgResponseTimeMs)}` : null
            }
            unit="ms"
            icon="solar:clock-circle-bold"
            color="info"
            info={INFO.avgResponse}
            loading={summaryLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <V2WidgetSummary
            title="P95 Response"
            total={
              summary?.p95ResponseTimeMs != null ? `${Math.round(summary.p95ResponseTimeMs)}` : null
            }
            unit="ms"
            icon="solar:sort-by-time-bold-duotone"
            color="warning"
            info={INFO.p95Response}
            loading={summaryLoading}
          />
        </Grid>

        {/* Log Volume + Server Status */}
        <Grid size={{ xs: 12, md: 8 }}>
          <V2LogVolumeChart
            title="Log Volume"
            subheader="Logs by level over time"
            info={INFO.logVolume}
            chart={logVolumeChart}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <V2ServerStatusTable title="Server Status" info={INFO.serverStatus} data={servers} />
        </Grid>

        {/* Error Trend + Log Level Distribution */}
        <Grid size={{ xs: 12, md: 8 }}>
          <V2ErrorTrendChart
            title="Error Trend"
            subheader="Error & Fatal counts over time"
            info={INFO.errorTrend}
            chart={errorTrendChart}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <V2LogLevelChart
            title="Log Level Distribution"
            info={INFO.logLevel}
            chart={logLevelChart}
          />
        </Grid>

        {/* API Ranking + Recent Errors */}
        <Grid size={{ xs: 12, md: 6 }}>
          <V2ApiRankingTable
            title="API Ranking (Top 10)"
            info={INFO.apiRanking}
            data={apiRanking}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <V2RecentErrorsTable
            title="Recent Errors"
            info={INFO.recentErrors}
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
