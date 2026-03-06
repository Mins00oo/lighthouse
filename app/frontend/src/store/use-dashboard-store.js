import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------------------------------------------------------------

/**
 * 위젯 기본 레이아웃 (lg 12-column 기준)
 *
 * ┌──────┬──────┬──────┬──────┐
 * │총요청 │에러율 │평균응답│ P95  │  h=2
 * ├──────────────┬─────────────┤
 * │ 로그 볼륨    │ 서버 상태    │  h=4
 * │  (8col)     │  (4col)     │
 * ├──────────────┼─────────────┤
 * │ 에러 추이    │ 로그레벨     │  h=4
 * │  (8col)     │  (4col)     │
 * ├──────────────┼─────────────┤
 * │ API 순위     │ 최근 에러    │  h=4
 * │  (6col)     │  (6col)     │
 * └──────────────┴─────────────┘
 */
const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'summary-total-requests', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-error-rate', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-avg-response', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-p95-response', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'log-volume', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3, maxH: 8 },
    { i: 'server-status', x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'error-trend', x: 0, y: 6, w: 8, h: 4, minW: 4, minH: 3, maxH: 8 },
    { i: 'log-level', x: 8, y: 6, w: 4, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'api-ranking', x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3, maxH: 8 },
    { i: 'recent-errors', x: 6, y: 10, w: 6, h: 4, minW: 4, minH: 3, maxH: 8 },
  ],
  md: [
    { i: 'summary-total-requests', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-error-rate', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-avg-response', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-p95-response', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'log-volume', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3, maxH: 8 },
    { i: 'server-status', x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'error-trend', x: 0, y: 6, w: 8, h: 4, minW: 4, minH: 3, maxH: 8 },
    { i: 'log-level', x: 8, y: 6, w: 4, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'api-ranking', x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3, maxH: 8 },
    { i: 'recent-errors', x: 6, y: 10, w: 6, h: 4, minW: 4, minH: 3, maxH: 8 },
  ],
  sm: [
    { i: 'summary-total-requests', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-error-rate', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-avg-response', x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'summary-p95-response', x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    { i: 'log-volume', x: 0, y: 4, w: 6, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'server-status', x: 0, y: 8, w: 6, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'error-trend', x: 0, y: 12, w: 6, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'log-level', x: 0, y: 16, w: 6, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'api-ranking', x: 0, y: 20, w: 6, h: 4, minW: 3, minH: 3, maxH: 8 },
    { i: 'recent-errors', x: 0, y: 24, w: 6, h: 4, minW: 3, minH: 3, maxH: 8 },
  ],
};

const DEFAULT_ACTIVE_WIDGETS = [
  'summary-total-requests',
  'summary-error-rate',
  'summary-avg-response',
  'summary-p95-response',
  'log-volume',
  'server-status',
  'error-trend',
  'log-level',
  'api-ranking',
  'recent-errors',
];

// ----------------------------------------------------------------------

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      layouts: DEFAULT_LAYOUTS,
      activeWidgets: DEFAULT_ACTIVE_WIDGETS,
      editMode: false,
      drawerOpen: false,

      setLayouts: (layouts) => set({ layouts }),

      addWidget: (widgetId, defaultLayout) => {
        const { activeWidgets, layouts } = get();
        if (activeWidgets.includes(widgetId)) return;

        const newActiveWidgets = [...activeWidgets, widgetId];

        // 각 브레이크포인트에 새 위젯 레이아웃 추가 (그리드 하단에 배치)
        const newLayouts = {};
        Object.keys(layouts).forEach((bp) => {
          const bpLayouts = layouts[bp] || [];
          const maxY = bpLayouts.reduce((max, item) => Math.max(max, item.y + item.h), 0);
          const cols = bp === 'sm' ? 6 : 12;

          newLayouts[bp] = [
            ...bpLayouts,
            {
              i: widgetId,
              x: 0,
              y: maxY,
              w: Math.min(defaultLayout?.w ?? 6, cols),
              h: defaultLayout?.h ?? 4,
              minW: defaultLayout?.minW ?? 3,
              minH: defaultLayout?.minH ?? 3,
              maxH: defaultLayout?.maxH ?? 8,
            },
          ];
        });

        set({ activeWidgets: newActiveWidgets, layouts: newLayouts });
      },

      removeWidget: (widgetId) => {
        const { activeWidgets, layouts } = get();

        const newActiveWidgets = activeWidgets.filter((id) => id !== widgetId);

        const newLayouts = {};
        Object.keys(layouts).forEach((bp) => {
          newLayouts[bp] = (layouts[bp] || []).filter((item) => item.i !== widgetId);
        });

        set({ activeWidgets: newActiveWidgets, layouts: newLayouts });
      },

      toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),

      setDrawerOpen: (open) => set({ drawerOpen: open }),

      resetToDefault: () =>
        set({
          layouts: DEFAULT_LAYOUTS,
          activeWidgets: DEFAULT_ACTIVE_WIDGETS,
          editMode: false,
          drawerOpen: false,
        }),
    }),
    {
      name: 'lighthouse-dashboard-layout',
      // layouts/activeWidgets만 영속화 (editMode/drawerOpen은 제외)
      partialize: (state) => ({
        layouts: state.layouts,
        activeWidgets: state.activeWidgets,
      }),
    }
  )
);
