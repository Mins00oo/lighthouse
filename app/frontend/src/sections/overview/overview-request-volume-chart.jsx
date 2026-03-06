import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function OverviewRequestVolumeChart({ chart, sx }) {
  const t = useMonitoringTokens();

  const chartOptions = useChart({
    colors: [t.chart.primary],
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: t.mode },
    plotOptions: {
      bar: {
        borderRadius: 2,
        columnWidth: '60%',
      },
    },
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
      y: { formatter: (val) => `${fNumber(val)} 건` },
    },
    legend: { show: false },
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
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>
          시간대별 요청량
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          선택 기간 내 시간 구간별 총 요청 수
        </Box>
      </Box>

      <Box sx={{ px: 1 }}>
        <Chart type="bar" series={chart?.series ?? []} options={chartOptions} sx={{ height: 320 }} />
      </Box>
    </Box>
  );
}
