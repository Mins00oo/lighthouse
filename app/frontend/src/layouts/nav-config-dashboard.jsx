import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  logs: icon('ic-analytics'),
  serverInstances: icon('ic-order'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Logs', path: paths.dashboard.logs.root, icon: ICONS.logs },
      {
        title: 'Server Instances',
        path: paths.dashboard.serverInstances.root,
        icon: ICONS.serverInstances,
      },
    ],
  },
];
