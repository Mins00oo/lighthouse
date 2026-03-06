import { CONFIG } from 'src/global-config';

import { OverviewV2DashboardView } from 'src/sections/overview-v2/view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard V2 - ${CONFIG.appName}` };

export default function OverviewV2Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <OverviewV2DashboardView />
    </>
  );
}
