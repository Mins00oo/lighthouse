import { useMemo } from 'react';

import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { useGetErrorTrend } from 'src/actions/monitoring';

import { Chart, useChart } from 'src/components/chart';

import { V2InfoTip } from 'src/sections/overview-v2/v2-info-tip';

// ----------------------------------------------------------------------

const INFO = '시간대별 ERROR 및 FATAL 로그 발생 추이. 급증 구간 확인용';

function buildChart(data) {
  if (!data || !data.length) return { categories: [], series: [] };

  const categories = data.map((item) => item.time ?? '');
  const series = [
    { name: 'ERROR', data: data.map((item) => item.errorCount ?? 0) },
    { name: 'FATAL', data: data.map((item) => item.fatalCount ?? 0) },
  ];

  return { categories, series };
}

// ----------------------------------------------------------------------

export function WidgetErrorTrend({ from, to }) {
  const t = useMonitoringTokens();
  const { errorTrend } = useGetErrorTrend(from, to);

  const chart = useMemo(() => buildChart(errorTrend), [errorTrend]);

  const chartOptions = useChart({
    colors: [t.chart.error, t.chart.fatal],
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: t.mode },
    xaxis: {
      categories: chart.categories,
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
    stroke: { width: 2.5, curve: 'smooth' },
    tooltip: {
      theme: t.mode,
      shared: true,
      intersect: false,
      y: { formatter: (val) => fNumber(val) },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: t.text.secondary },
      markers: { size: 6, shape: 'circle' },
      itemMargin: { horizontal: 12 },
    },
  });

  return (
    <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>
            Error Trend
          </Box>
          <V2InfoTip text={INFO} />
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          Error &amp; Fatal counts over time
        </Box>
      </Box>

      <Box sx={{ flex: 1, px: 1, minHeight: 0 }}>
        <Chart type="line" series={chart.series} options={chartOptions} sx={{ height: 1 }} />
      </Box>
    </Box>
  );
}
