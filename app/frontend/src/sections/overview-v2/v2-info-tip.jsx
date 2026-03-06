import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function V2InfoTip({ text, sx }) {
  const t = useMonitoringTokens();

  if (!text) return null;

  return (
    <Tooltip
      title={
        <Box sx={{ fontSize: '0.75rem', lineHeight: 1.5, p: 0.25 }}>
          {text}
        </Box>
      }
      placement="top"
      arrow
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: t.text.disabled,
          cursor: 'help',
          flexShrink: 0,
          transition: 'color 0.15s',
          '&:hover': { color: t.text.secondary },
          ...sx,
        }}
      >
        <Iconify icon="solar:info-circle-linear" width={16} />
      </Box>
    </Tooltip>
  );
}
