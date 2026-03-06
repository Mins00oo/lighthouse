import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { useGetApiRanking } from 'src/actions/monitoring';

import { V2InfoTip } from 'src/sections/overview-v2/v2-info-tip';

// ----------------------------------------------------------------------

const INFO = '요청량 기준 상위 10개 API 엔드포인트의 응답 시간 및 에러율';

const COLUMNS = [
  { id: 'method', label: 'Method', width: 60 },
  { id: 'path', label: 'Endpoint', flex: 1 },
  { id: 'requests', label: 'Requests', width: 80, align: 'right' },
  { id: 'avg', label: 'Avg', width: 65, align: 'right' },
  { id: 'p95', label: 'P95', width: 65, align: 'right' },
  { id: 'errors', label: 'Err%', width: 55, align: 'right' },
];

// ----------------------------------------------------------------------

export function WidgetApiRanking({ from, to }) {
  const t = useMonitoringTokens();
  const { apiRanking } = useGetApiRanking(from, to);
  const rows = apiRanking ?? [];

  const methodColors = {
    GET: t.status.info,
    POST: t.status.success,
    PUT: t.status.warning,
    PATCH: t.status.warning,
    DELETE: t.status.error,
  };

  return (
    <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>
            API Ranking (Top 10)
          </Box>
          <V2InfoTip text={INFO} />
        </Box>
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          px: 2.5,
          py: 1,
          borderBottom: `1px solid ${t.border.subtle}`,
          borderTop: `1px solid ${t.border.subtle}`,
          bgcolor: t.bg.surface,
        }}
      >
        {COLUMNS.map((col) => (
          <Box
            key={col.id}
            sx={{
              fontSize: '0.675rem',
              fontWeight: 600,
              color: t.text.disabled,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              ...(col.flex ? { flex: col.flex } : { width: col.width }),
              ...(col.align && { textAlign: col.align }),
            }}
          >
            {col.label}
          </Box>
        ))}
      </Box>

      {/* Rows */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {rows.map((row, index) => {
          const errorRate = row.errorRate ?? 0;
          const isHighError = errorRate > 5;
          const methodColor = methodColors[row.httpMethod] || t.text.disabled;

          return (
            <Box
              key={`${row.httpMethod}-${row.httpPath}-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2.5,
                py: 1.25,
                borderBottom: `1px solid ${t.border.subtle}`,
                transition: 'background 0.15s',
                '&:hover': { bgcolor: t.bg.cardHover },
                '&:last-child': { borderBottom: 'none' },
                ...(isHighError && { bgcolor: t.status.errorMuted }),
              }}
            >
              <Box sx={{ width: 60 }}>
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: methodColor,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: t.radiusSm,
                    border: `1px solid ${methodColor}`,
                    opacity: 0.9,
                  }}
                >
                  {row.httpMethod}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  fontSize: '0.775rem',
                  color: t.text.primary,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  pr: 1,
                }}
              >
                {row.httpPath}
              </Box>

              <Box
                sx={{
                  width: 80,
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  color: t.text.secondary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fNumber(row.requestCount)}
              </Box>

              <Box
                sx={{
                  width: 65,
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  color: t.text.secondary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fNumber(row.avgResponseTimeMs)}
              </Box>

              <Box
                sx={{
                  width: 65,
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  fontVariantNumeric: 'tabular-nums',
                  color:
                    row.p95ResponseTimeMs > 3000
                      ? t.status.error
                      : row.p95ResponseTimeMs > 1000
                        ? t.status.warning
                        : t.text.secondary,
                }}
              >
                {fNumber(row.p95ResponseTimeMs)}
              </Box>

              <Box
                sx={{
                  width: 55,
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: isHighError ? 600 : 400,
                  color: isHighError ? t.status.error : t.text.disabled,
                }}
              >
                {`${errorRate.toFixed(1)}%`}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
