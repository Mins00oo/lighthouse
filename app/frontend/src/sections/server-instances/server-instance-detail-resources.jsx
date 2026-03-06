import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

function ResourceBar({ label, value }) {
  const color =
    (value >= 90 && 'error') || (value >= 70 && 'warning') || 'success';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold' }}>
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function ServerInstanceDetailResources({ instance }) {
  const resources = [
    { label: 'CPU Usage', value: instance?.cpuUsage ?? 0 },
    { label: 'Memory Usage', value: instance?.memoryUsage ?? 0 },
    { label: 'Disk Usage', value: instance?.diskUsage ?? 0 },
  ];

  return (
    <>
      <Card>
        <CardHeader title="Resource Usage" />

        <Stack spacing={3} sx={{ p: 3 }}>
          {resources.map((resource) => (
            <ResourceBar
              key={resource.label}
              label={resource.label}
              value={resource.value}
            />
          ))}
        </Stack>
      </Card>

      <Card>
        <CardHeader title="Environment & Tags" />

        <Stack spacing={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', typography: 'body2' }}>
            <Box component="span" sx={{ width: 120, flexShrink: 0, color: 'text.secondary' }}>
              Environment
            </Box>
            <Chip label={instance?.env} size="small" variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', typography: 'body2' }}>
            <Box component="span" sx={{ width: 120, flexShrink: 0, color: 'text.secondary', pt: 0.5 }}>
              Tags
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {(instance?.tags || []).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="soft" />
              ))}
            </Box>
          </Box>
        </Stack>
      </Card>
    </>
  );
}
