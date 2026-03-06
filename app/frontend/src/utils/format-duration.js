/**
 * ms 값을 읽기 좋은 단위로 변환한다.
 * - 1000ms 미만: "123ms"
 * - 1000ms ~ 60000ms: "1.2s"
 * - 60000ms 이상: "2.1m"
 */
export function fDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '-';

  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return `${(ms / 60000).toFixed(1)}m`;
}
