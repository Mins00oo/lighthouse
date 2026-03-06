import { CONFIG } from 'src/global-config';

import { ServerInstanceListView } from 'src/sections/server-instances/view';

// ----------------------------------------------------------------------

const metadata = { title: `Server instances | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ServerInstanceListView />
    </>
  );
}
