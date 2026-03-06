import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { useDashboardStore } from 'src/store/use-dashboard-store';

import { Iconify } from 'src/components/iconify';

import { CATEGORIES, WIDGET_REGISTRY } from './widget-registry';

// ----------------------------------------------------------------------

export function WidgetAddDrawer() {
  const t = useMonitoringTokens();
  const drawerOpen = useDashboardStore((s) => s.drawerOpen);
  const setDrawerOpen = useDashboardStore((s) => s.setDrawerOpen);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const addWidget = useDashboardStore((s) => s.addWidget);

  const handleAdd = (widget) => {
    addWidget(widget.id, widget.defaultLayout);
  };

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: t.bg.surface,
          borderLeft: `1px solid ${t.border.default}`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${t.border.subtle}`,
        }}
      >
        <Box sx={{ fontSize: '1rem', fontWeight: 700, color: t.text.heading }}>위젯 추가</Box>
        <IconButton
          size="small"
          onClick={() => setDrawerOpen(false)}
          sx={{ color: t.text.disabled }}
        >
          <Iconify icon="solar:close-circle-linear" width={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {CATEGORIES.map((cat) => {
          const widgets = WIDGET_REGISTRY.filter((w) => w.category === cat.key);
          if (!widgets.length) return null;

          return (
            <Box key={cat.key} sx={{ mb: 2 }}>
              {/* Category header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1,
                }}
              >
                <Iconify icon={cat.icon} width={16} sx={{ color: t.accent.blue }} />
                <Box
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: t.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {cat.label}
                </Box>
              </Box>

              {/* Widget list */}
              {widgets.map((widget) => {
                const isActive = activeWidgets.includes(widget.id);

                return (
                  <Box
                    key={widget.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2.5,
                      py: 1.25,
                      mx: 1,
                      borderRadius: t.radiusSm,
                      transition: 'all 0.15s',
                      ...(isActive
                        ? {
                            opacity: 0.4,
                            cursor: 'default',
                          }
                        : {
                            cursor: 'pointer',
                            '&:hover': { bgcolor: t.bg.cardHover },
                          }),
                    }}
                    onClick={() => !isActive && handleAdd(widget)}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: t.radiusSm,
                        bgcolor: isActive ? t.bg.card : t.accent.blueMuted,
                        color: isActive ? t.text.disabled : t.accent.blue,
                      }}
                    >
                      <Iconify icon={widget.icon} width={20} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: isActive ? t.text.disabled : t.text.primary,
                        }}
                      >
                        {widget.title}
                      </Box>
                      <Box
                        sx={{
                          fontSize: '0.7rem',
                          color: t.text.disabled,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {widget.description}
                      </Box>
                    </Box>

                    {isActive ? (
                      <Iconify
                        icon="solar:check-circle-bold"
                        width={18}
                        sx={{ color: t.status.success, flexShrink: 0 }}
                      />
                    ) : (
                      <Button
                        size="small"
                        sx={{
                          minWidth: 'auto',
                          px: 1,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: t.accent.blue,
                          flexShrink: 0,
                        }}
                      >
                        + 추가
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
}
