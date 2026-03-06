import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function MonitoringLogLevelPie({ title, subheader, chart, sx, ...other }) {
  const theme = useTheme();

  const chartSeries = chart?.series?.map((item) => item.value) ?? [];

  const chartColors = chart?.colors ?? [
    theme.palette.grey[500],      // TRACE
    theme.palette.info.main,      // DEBUG
    theme.palette.primary.main,   // INFO
    theme.palette.warning.main,   // WARN
    theme.palette.error.main,     // ERROR
    theme.palette.error.dark,     // FATAL
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart?.series?.map((item) => item.label) ?? [],
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (val) => fNumber(val),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: { formatter: (val) => fNumber(val) },
          },
        },
      },
    },
    ...chart?.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        sx={{
          my: 6,
          mx: 'auto',
          width: { xs: 240, xl: 260 },
          height: { xs: 240, xl: 260 },
        }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
