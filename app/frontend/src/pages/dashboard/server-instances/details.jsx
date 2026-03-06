import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { _serverInstances } from 'src/_mock/_server-instances';

import { ServerInstanceDetailView } from 'src/sections/server-instances/view';

// ----------------------------------------------------------------------

const metadata = { title: `Server instance details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentInstance = _serverInstances.find((instance) => instance.id === id);

  return (
    <>
      <title>{metadata.title}</title>

      <ServerInstanceDetailView instance={currentInstance} />
    </>
  );
}
