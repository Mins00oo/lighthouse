import { CONFIG } from 'src/global-config';

import { CustomDashboardView } from 'src/sections/custom-dashboard/view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function OverviewAppPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <CustomDashboardView />
    </>
  );
}
