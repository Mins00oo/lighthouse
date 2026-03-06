import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

import { V2InfoTip } from './v2-info-tip';

// ----------------------------------------------------------------------

export function V2ErrorTrendChart({ title, subheader, info, chart, sx }) {
  const t = useMonitoringTokens();

  const chartColors = chart?.colors ?? [t.chart.error, t.chart.fatal];

  const chartOptions = useChart({
    colors: chartColors,
    chart: {
      background: 'transparent',
      toolbar: { show: false },
    },
    theme: { mode: t.mode },
    xaxis: {
      categories: chart?.categories ?? [],
      labels: {
        style: { fontSize: '10px', colors: t.chart.axis },
      },
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
    ...chart?.options,
  });

  return (
    <Box
      sx={{
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${t.border.subtle}`,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>{title}</Box>
          <V2InfoTip text={info} />
        </Box>
        {subheader && (
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>{subheader}</Box>
        )}
      </Box>

      <Box sx={{ px: 1 }}>
        <Chart
          type="line"
          series={chart?.series ?? []}
          options={chartOptions}
          sx={{ height: 320 }}
        />
      </Box>
    </Box>
  );
}
