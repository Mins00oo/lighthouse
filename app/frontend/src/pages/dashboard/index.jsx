import { CONFIG } from 'src/global-config';

import { OverviewDashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function OverviewPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <OverviewDashboardView />
    </>
  );
}
