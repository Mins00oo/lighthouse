import { WidgetSummary } from './widgets/widget-summary';
import { WidgetLogLevel } from './widgets/widget-log-level';
import { WidgetLogVolume } from './widgets/widget-log-volume';
import { WidgetApiRanking } from './widgets/widget-api-ranking';
import { WidgetErrorTrend } from './widgets/widget-error-trend';
import { WidgetRecentErrors } from './widgets/widget-recent-errors';
import { WidgetServerStatus } from './widgets/widget-server-status';

// ----------------------------------------------------------------------

/**
 * 위젯 레지스트리: 새 위젯 추가 시 여기만 등록하면 됨
 *
 * - id: 고유 식별자 (Zustand 스토어 키)
 * - title: 표시명
 * - description: 위젯 설명 (드로어에서 표시)
 * - category: 'summary' | 'chart' | 'table'
 * - icon: iconify 아이콘명
 * - component: 자기완결형 React 컴포넌트
 * - defaultLayout: react-grid-layout 기본 크기/제약
 * - isSummary: 요약 카드 여부 (WidgetWrapper에서 좌측 보더 표시용)
 */
export const WIDGET_REGISTRY = [
  // ── 요약 카드 ──
  {
    id: 'summary-total-requests',
    title: 'Total Requests',
    description: '선택한 시간 범위 내 수신된 전체 HTTP 요청 수',
    category: 'summary',
    icon: 'solar:bill-list-bold',
    component: WidgetSummary,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    isSummary: true,
    summaryColor: 'primary',
  },
  {
    id: 'summary-error-rate',
    title: 'Error Rate',
    description: '전체 요청 중 4xx/5xx 응답 비율',
    category: 'summary',
    icon: 'solar:danger-triangle-bold',
    component: WidgetSummary,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    isSummary: true,
    summaryColor: 'error',
  },
  {
    id: 'summary-avg-response',
    title: 'Avg Response',
    description: '전체 요청의 평균 응답 시간 (ms)',
    category: 'summary',
    icon: 'solar:clock-circle-bold',
    component: WidgetSummary,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    isSummary: true,
    summaryColor: 'info',
  },
  {
    id: 'summary-p95-response',
    title: 'P95 Response',
    description: '상위 5% 느린 요청의 응답 시간',
    category: 'summary',
    icon: 'solar:sort-by-time-bold-duotone',
    component: WidgetSummary,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2, maxH: 3 },
    isSummary: true,
    summaryColor: 'warning',
  },

  // ── 차트 ──
  {
    id: 'log-volume',
    title: 'Log Volume',
    description: '시간대별 로그 발생량 추이 (INFO/WARN/ERROR)',
    category: 'chart',
    icon: 'solar:chart-2-bold',
    component: WidgetLogVolume,
    defaultLayout: { w: 8, h: 4, minW: 4, minH: 3, maxH: 8 },
  },
  {
    id: 'error-trend',
    title: 'Error Trend',
    description: '시간대별 ERROR 및 FATAL 로그 발생 추이',
    category: 'chart',
    icon: 'solar:graph-up-bold',
    component: WidgetErrorTrend,
    defaultLayout: { w: 8, h: 4, minW: 4, minH: 3, maxH: 8 },
  },
  {
    id: 'log-level',
    title: 'Log Level Distribution',
    description: '전체 로그의 레벨별 비율 분포 (도넛 차트)',
    category: 'chart',
    icon: 'solar:pie-chart-2-bold',
    component: WidgetLogLevel,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3, maxH: 8 },
  },

  // ── 테이블 ──
  {
    id: 'server-status',
    title: 'Server Status',
    description: '등록된 서버 인스턴스의 실시간 가동 상태',
    category: 'table',
    icon: 'solar:server-bold',
    component: WidgetServerStatus,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3, maxH: 8 },
  },
  {
    id: 'api-ranking',
    title: 'API Ranking',
    description: '요청량 기준 상위 10개 API 엔드포인트',
    category: 'table',
    icon: 'solar:ranking-bold',
    component: WidgetApiRanking,
    defaultLayout: { w: 6, h: 4, minW: 4, minH: 3, maxH: 8 },
  },
  {
    id: 'recent-errors',
    title: 'Recent Errors',
    description: '최근 발생한 예외 목록과 발생 빈도',
    category: 'table',
    icon: 'solar:bug-bold',
    component: WidgetRecentErrors,
    defaultLayout: { w: 6, h: 4, minW: 4, minH: 3, maxH: 8 },
  },
];

// 빠른 lookup용 Map
export const WIDGET_MAP = Object.fromEntries(WIDGET_REGISTRY.map((w) => [w.id, w]));

// 카테고리 메타
export const CATEGORIES = [
  { key: 'summary', label: '요약', icon: 'solar:chart-square-bold' },
  { key: 'chart', label: '차트', icon: 'solar:chart-2-bold' },
  { key: 'table', label: '테이블', icon: 'solar:document-bold' },
];
