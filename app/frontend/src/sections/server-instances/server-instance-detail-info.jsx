import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';

import { fDate, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

function formatUptime(hours) {
  if (!hours) return '-';
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${remainingHours}h`;
}

// ----------------------------------------------------------------------

export function ServerInstanceDetailInfo({ instance }) {
  const fields = [
    { label: 'Name', value: instance?.name },
    { label: 'Host', value: instance?.host },
    { label: 'Port', value: instance?.port },
    { label: 'OS', value: instance?.os },
    { label: 'Status', value: instance?.status },
    { label: 'Env', value: instance?.env },
    { label: 'Uptime', value: formatUptime(instance?.uptimeHours) },
    { label: 'Last Check', value: fDateTime(instance?.lastHealthCheck) },
    { label: 'Registered', value: fDate(instance?.registeredAt) },
  ];

  return (
    <Card>
      <CardHeader title="Basic Information" />

      <Stack spacing={2} sx={{ p: 3 }}>
        {fields.map((field) => (
          <Box
            key={field.label}
            sx={{ display: 'flex', alignItems: 'center', typography: 'body2' }}
          >
            <Box component="span" sx={{ width: 120, flexShrink: 0, color: 'text.secondary' }}>
              {field.label}
            </Box>

            {field.label === 'Status' ? (
              <Label
                variant="soft"
                color={
                  (instance?.status === 'online' && 'success') ||
                  (instance?.status === 'warning' && 'warning') ||
                  (instance?.status === 'offline' && 'error') ||
                  'default'
                }
              >
                {field.value}
              </Label>
            ) : (
              <Box component="span" sx={{ color: 'text.primary' }}>
                {field.value || '-'}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
