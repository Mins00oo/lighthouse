import { useMemo } from 'react';

import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { useGetLogVolume } from 'src/actions/monitoring';

import { Chart, useChart } from 'src/components/chart';

import { V2InfoTip } from 'src/sections/overview-v2/v2-info-tip';

// ----------------------------------------------------------------------

const INFO = '시간대별 로그 레벨(INFO/WARN/ERROR) 발생량 추이';

function buildChart(data) {
  if (!data || !data.length) return { categories: [], series: [] };

  const categories = data.map((item) => item.time ?? '');
  const series = [
    { name: 'INFO', data: data.map((item) => item.infoCount ?? 0) },
    { name: 'WARN', data: data.map((item) => item.warnCount ?? 0) },
    { name: 'ERROR', data: data.map((item) => item.errorCount ?? 0) },
  ];

  return { categories, series };
}

// ----------------------------------------------------------------------

export function WidgetLogVolume({ from, to }) {
  const t = useMonitoringTokens();
  const { logVolume } = useGetLogVolume(from, to);

  const chart = useMemo(() => buildChart(logVolume), [logVolume]);

  const chartOptions = useChart({
    colors: [t.chart.info, t.chart.warn, t.chart.error],
    chart: { stacked: true, background: 'transparent', toolbar: { show: false } },
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
    stroke: { width: 1.5, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.02 } },
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
            Log Volume
          </Box>
          <V2InfoTip text={INFO} />
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          Logs by level over time
        </Box>
      </Box>

      <Box sx={{ flex: 1, px: 1, minHeight: 0 }}>
        <Chart type="area" series={chart.series} options={chartOptions} sx={{ height: 1 }} />
      </Box>
    </Box>
  );
}
