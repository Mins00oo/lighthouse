import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const metadata = { title: `Log Details - ${CONFIG.appName}` };

export default function LogDetailsPage() {
  return (
    <title>{metadata.title}</title>
  );
}
