import { memo } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { useDashboardStore } from 'src/store/use-dashboard-store';

import { Iconify } from 'src/components/iconify';

import { WIDGET_MAP } from './widget-registry';

// ----------------------------------------------------------------------

export const WidgetWrapper = memo(function WidgetWrapper({ widgetId, editMode, from, to }) {
  const t = useMonitoringTokens();
  const removeWidget = useDashboardStore((s) => s.removeWidget);

  const widget = WIDGET_MAP[widgetId];
  if (!widget) return null;

  const Component = widget.component;

  // summary 위젯의 경우 왼쪽 보더 색상
  const accentColorMap = {
    primary: t.accent.blue,
    error: t.status.error,
    info: t.status.info,
    warning: t.status.warning,
  };
  const accentColor = widget.isSummary ? accentColorMap[widget.summaryColor] : null;

  return (
    <Box
      sx={{
        height: 1,
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${editMode ? t.border.strong : t.border.subtle}`,
        ...(accentColor && { borderLeft: `3px solid ${accentColor}` }),
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        ...(editMode && { boxShadow: t.shadow }),
        '&:hover': {
          borderColor: editMode ? t.accent.blue : t.border.default,
          ...(accentColor && { borderLeftColor: accentColor }),
        },
      }}
    >
      {/* 편집 모드 크롬 */}
      {editMode && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.5,
            borderBottom: `1px solid ${t.border.subtle}`,
            bgcolor: t.bg.surface,
            minHeight: 32,
          }}
        >
          <Box
            className="widget-drag-handle"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              cursor: 'grab',
              color: t.text.disabled,
              '&:hover': { color: t.text.secondary },
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <Iconify icon="solar:hamburger-menu-linear" width={16} />
            <Box sx={{ fontSize: '0.7rem', fontWeight: 600, color: t.text.secondary }}>
              {widget.title}
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={() => removeWidget(widgetId)}
            sx={{
              width: 24,
              height: 24,
              color: t.text.disabled,
              '&:hover': { color: t.status.error, bgcolor: t.status.errorMuted },
            }}
          >
            <Iconify icon="solar:close-circle-linear" width={16} />
          </IconButton>
        </Box>
      )}

      {/* 위젯 컨텐츠 */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Component widgetId={widgetId} from={from} to={to} />
      </Box>
    </Box>
  );
});
