import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { NavSectionHorizontal } from 'src/components/nav-section';

import { layoutClasses } from '../core/classes';

// ----------------------------------------------------------------------

export function NavHorizontal({
  sx,
  data,
  className,
  checkPermissions,
  layoutQuery = 'md',
  ...other
}) {
  return (
    <Box
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.horizontal, className])}
      sx={[
        () => ({
          display: { xs: 'none', [layoutQuery]: 'flex' },
          alignItems: 'center',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <NavSectionHorizontal data={data} checkPermissions={checkPermissions} {...other} />
    </Box>
  );
}
