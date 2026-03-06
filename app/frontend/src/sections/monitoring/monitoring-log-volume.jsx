import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function MonitoringLogVolume({ title, subheader, chart, loading, sx, ...other }) {
  const theme = useTheme();

  const chartColors = chart?.colors ?? [
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    chart: { stacked: true },
    xaxis: {
      categories: chart?.categories ?? [],
      labels: { style: { fontSize: '11px' } },
    },
    yaxis: {
      labels: { formatter: (val) => fNumber(val) },
    },
    stroke: { width: 1, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.56, opacityTo: 0.08 },
    },
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
          type="area"
          series={chart?.series ?? []}
          options={chartOptions}
          sx={{ height: 364 }}
        />
      </CardContent>
    </Card>
  );
}
