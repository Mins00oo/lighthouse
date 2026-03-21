import { CONFIG } from 'src/global-config';

import { MetricsDashboardView } from 'src/sections/metrics/view';

// ----------------------------------------------------------------------

const metadata = { title: `Metrics - ${CONFIG.appName}` };

export default function MetricsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <MetricsDashboardView />
    </>
  );
}
