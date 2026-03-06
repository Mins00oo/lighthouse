import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { ServerInstanceDetailInfo } from '../server-instance-detail-info';
import { ServerInstanceDetailResources } from '../server-instance-detail-resources';

// ----------------------------------------------------------------------

export function ServerInstanceDetailView({ instance }) {
  return (
    <DashboardContent>
      <Box
        sx={{
          gap: 3,
          display: 'flex',
          mb: { xs: 3, md: 5 },
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ gap: 1, display: 'flex', alignItems: 'flex-start' }}>
          <IconButton component={RouterLink} href={paths.dashboard.serverInstances.root}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4">{instance?.name || 'Server Instance'}</Typography>
              <Label
                variant="soft"
                color={
                  (instance?.status === 'online' && 'success') ||
                  (instance?.status === 'warning' && 'warning') ||
                  (instance?.status === 'offline' && 'error') ||
                  'default'
                }
              >
                {instance?.status}
              </Label>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {instance?.host}:{instance?.port}
            </Typography>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ServerInstanceDetailInfo instance={instance} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <ServerInstanceDetailResources instance={instance} />
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
