import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function MonitoringErrorTrend({ title, subheader, chart, sx, ...other }) {
  const theme = useTheme();

  const chartColors = chart?.colors ?? [
    theme.palette.error.main,
    theme.palette.error.dark,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: chart?.categories ?? [],
      labels: { style: { fontSize: '11px' } },
    },
    yaxis: {
      labels: { formatter: (val) => fNumber(val) },
    },
    stroke: { width: 2.5, curve: 'smooth' },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => fNumber(val) },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    ...chart?.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <CardContent>
        <Chart
          type="line"
          series={chart?.series ?? []}
          options={chartOptions}
          sx={{ height: 364 }}
        />
      </CardContent>
    </Card>
  );
}
