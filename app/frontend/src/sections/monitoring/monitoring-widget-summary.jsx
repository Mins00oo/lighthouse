import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function MonitoringWidgetSummary({
  sx,
  icon,
  title,
  total,
  unit,
  loading,
  color = 'primary',
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          boxShadow: 'none',
          position: 'relative',
          color: `${color}.darker`,
          backgroundColor: 'common.white',
          backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Iconify icon={icon} width={48} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 112 }}>
        <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>

        {loading ? (
          <CircularProgress size={28} color="inherit" />
        ) : (
          <Box sx={{ typography: 'h4' }}>
            {total ?? '-'}
            {unit && (
              <Box component="span" sx={{ ml: 0.5, typography: 'subtitle1' }}>
                {unit}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <SvgColor
        src={`${CONFIG.assetsDir}/assets/background/shape-square.svg`}
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}
