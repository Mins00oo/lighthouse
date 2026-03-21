import { CONFIG } from 'src/global-config';

import { AlertListView } from 'src/sections/alerts/view';

// ----------------------------------------------------------------------

const metadata = { title: `Alerts - ${CONFIG.appName}` };

export default function AlertsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <AlertListView />
    </>
  );
}
