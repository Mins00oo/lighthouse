import { useCallback } from 'react';

import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function OverviewRequestVolumeChart({ chart, onRangeSelect, sx }) {
  const t = useMonitoringTokens();
  const handleZoomed = useCallback(
    (_ctx, { xaxis }) => {
      const times = chart?.rawTimes ?? [];
      if (!onRangeSelect || !times.length) return;

      // ApexCharts categorical zoom: min/max are 1-based indices
      const minIdx = Math.max(0, Math.round(xaxis.min) - 1);
      const maxIdx = Math.min(times.length - 1, Math.round(xaxis.max) - 1);

      const from = times[minIdx];
      const to = times[maxIdx];

      if (from && to) {
        onRangeSelect(from, to);
      }
    },
    [onRangeSelect, chart?.rawTimes]
  );

  const chartOptions = useChart({
    colors: [t.chart.primary],
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: !!onRangeSelect },
      selection: {
        enabled: !!onRangeSelect,
        type: 'x',
        fill: { color: t.accent.blue, opacity: 0.1 },
        stroke: { color: t.accent.blue, width: 1, dashArray: 3, opacity: 0.4 },
      },
      events: {
        zoomed: handleZoomed,
      },
    },
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

      {onRangeSelect && (
        <Box sx={{ px: 2.5, pb: 1.5, textAlign: 'right' }}>
          <Box sx={{ fontSize: '0.65rem', color: t.text.disabled, fontStyle: 'italic' }}>
            구간을 드래그하면 해당 시간대 로그를 조회합니다
          </Box>
        </Box>
      )}
    </Box>
  );
}
