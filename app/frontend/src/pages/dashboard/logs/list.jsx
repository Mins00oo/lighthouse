import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Logs - ${CONFIG.appName}` };

export default function LogListPage() {
  return (
    <title>{metadata.title}</title>
  );
}
