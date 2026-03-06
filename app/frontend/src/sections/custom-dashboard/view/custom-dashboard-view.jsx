import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useMemo, useState, useCallback } from 'react';
import { useContainerWidth, ResponsiveGridLayout } from 'react-grid-layout';

import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDashboardStore } from 'src/store/use-dashboard-store';

import { WidgetWrapper } from '../widget-wrapper';
import { WidgetAddDrawer } from '../widget-add-drawer';
import { DashboardToolbar } from '../dashboard-toolbar';

// ----------------------------------------------------------------------

const DEFAULT_RANGE = {
  from: toKSTString(Date.now() - 60 * 60 * 1000),
  to: toKSTString(),
  label: 'Last 1 hour',
};

// ----------------------------------------------------------------------

export function CustomDashboardView() {
  const t = useMonitoringTokens();
  const { width, containerRef, mounted } = useContainerWidth();

  const [timeRange, setTimeRange] = useState(DEFAULT_RANGE);

  const layouts = useDashboardStore((s) => s.layouts);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const editMode = useDashboardStore((s) => s.editMode);
  const setLayouts = useDashboardStore((s) => s.setLayouts);

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  const handleLayoutChange = useCallback(
    (_currentLayout, allLayouts) => {
      // 편집 모드에서만 레이아웃 저장 (뷰 모드 시 브라우저 리사이즈 등에 의한 변경 무시)
      if (editMode) {
        setLayouts(allLayouts);
      }
    },
    [editMode, setLayouts]
  );

  // 뷰 모드에서는 모든 아이템을 static으로 설정하여 드래그/리사이즈 완전 차단
  const effectiveLayouts = useMemo(() => {
    if (editMode) return layouts;

    const locked = {};
    Object.keys(layouts).forEach((bp) => {
      locked[bp] = (layouts[bp] || []).map((item) => ({ ...item, static: true }));
    });
    return locked;
  }, [layouts, editMode]);

  const { from, to } = timeRange;

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        bgcolor: t.bg.body,
        minHeight: '100vh',
        '--layout-dashboard-content-pt': '16px',
        '--layout-dashboard-content-pb': '32px',
      }}
    >
      <DashboardToolbar timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />

      <Box
        ref={containerRef}
        sx={{
          // react-grid-layout 스타일 오버라이드
          '& .react-grid-item.react-grid-placeholder': {
            bgcolor: t.accent.blueMuted,
            borderRadius: t.radius,
            border: `2px dashed ${t.accent.blue}`,
            opacity: 0.4,
          },
          '& .react-grid-item > .react-resizable-handle::after': {
            borderColor: t.text.disabled,
          },
          // 뷰 모드에서 리사이즈 핸들 숨김
          ...(!editMode && {
            '& .react-resizable-handle': { display: 'none' },
          }),
        }}
      >
        {mounted && (
          <ResponsiveGridLayout
            width={width}
            layouts={effectiveLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 12, sm: 6 }}
            rowHeight={80}
            isDraggable={editMode}
            isResizable={editMode}
            draggableHandle=".widget-drag-handle"
            onLayoutChange={handleLayoutChange}
            containerPadding={[0, 0]}
            margin={[16, 16]}
          >
            {activeWidgets.map((id) => (
              <div key={id}>
                <WidgetWrapper widgetId={id} editMode={editMode} from={from} to={to} />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </Box>

      <WidgetAddDrawer />
    </DashboardContent>
  );
}
