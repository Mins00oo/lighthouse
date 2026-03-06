import { useMemo } from 'react';

import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { useGetLogLevelDist } from 'src/actions/monitoring';

import { Chart, useChart } from 'src/components/chart';

import { V2InfoTip } from 'src/sections/overview-v2/v2-info-tip';

// ----------------------------------------------------------------------

const INFO = '선택한 시간 범위 내 전체 로그의 레벨별 비율 분포';

function buildChart(data) {
  if (!data || !data.length) return { series: [] };
  return {
    series: data.map((item) => ({ label: item.level, value: item.count ?? 0 })),
  };
}

// ----------------------------------------------------------------------

export function WidgetLogLevel({ from, to }) {
  const t = useMonitoringTokens();
  const { logLevelDist } = useGetLogLevelDist(from, to);

  const chart = useMemo(() => buildChart(logLevelDist), [logLevelDist]);

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = [
    t.chart.axis, // TRACE
    t.chart.info, // DEBUG
    t.chart.primary, // INFO
    t.chart.warn, // WARN
    t.chart.error, // ERROR
    t.chart.fatal, // FATAL
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true }, background: 'transparent' },
    theme: { mode: t.mode },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
      style: { fontSize: '11px', fontWeight: 600 },
    },
    tooltip: {
      theme: t.mode,
      y: {
        formatter: (val) => fNumber(val),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { color: t.text.secondary },
            value: {
              color: t.text.primary,
              formatter: (val) => fNumber(val),
            },
            total: {
              show: true,
              color: t.text.secondary,
              formatter: (w) => fNumber(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    legend: { show: false },
  });

  return (
    <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>
            Log Level Distribution
          </Box>
          <V2InfoTip text={INFO} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Chart
          type="donut"
          series={chartSeries}
          options={chartOptions}
          sx={{ width: 220, height: 220, mx: 'auto' }}
        />
      </Box>

      <Box
        sx={{
          px: 2.5,
          pb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1.5,
          borderTop: `1px solid ${t.border.subtle}`,
          pt: 1.5,
        }}
      >
        {chart.series.map((item, index) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: chartColors[index] || t.chart.axis,
                flexShrink: 0,
              }}
            />
            <Box sx={{ fontSize: '0.7rem', color: t.text.secondary, whiteSpace: 'nowrap' }}>
              {item.label}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
