import { CONFIG } from 'src/global-config';

import { BusinessDashboardView } from 'src/sections/business/view';

// ----------------------------------------------------------------------

const metadata = { title: `Business - ${CONFIG.appName}` };

export default function BusinessPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BusinessDashboardView />
    </>
  );
}
