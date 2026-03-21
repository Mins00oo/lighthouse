import { CONFIG } from 'src/global-config';

import { HealthDashboardView } from 'src/sections/health/view';

// ----------------------------------------------------------------------

const metadata = { title: `Server Health - ${CONFIG.appName}` };

export default function HealthPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <HealthDashboardView />
    </>
  );
}
