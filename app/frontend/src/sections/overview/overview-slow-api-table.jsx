import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'rank', label: '#', width: 36, align: 'center' },
  { id: 'method', label: 'Method', width: 60 },
  { id: 'path', label: 'Endpoint', flex: 1 },
  { id: 'p95', label: 'P95', width: 70, align: 'right' },
  { id: 'avg', label: 'Avg', width: 70, align: 'right' },
  { id: 'requests', label: 'Requests', width: 80, align: 'right' },
];

// ----------------------------------------------------------------------

export function OverviewSlowApiTable({ data, sx }) {
  const t = useMonitoringTokens();
  const rows = data ?? [];

  const methodColors = {
    GET: t.status.info,
    POST: t.status.success,
    PUT: t.status.warning,
    PATCH: t.status.warning,
    DELETE: t.status.error,
  };

  return (
    <Box
      sx={{
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${t.border.subtle}`,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>
          응답 느린 TOP API
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          P95 응답 시간 기준 내림차순
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
      <Box sx={{ maxHeight: 440, overflow: 'auto' }}>
        {rows.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center', fontSize: '0.8rem', color: t.text.disabled }}>
            데이터가 없습니다
          </Box>
        )}

        {rows.map((row, index) => {
          const methodColor = methodColors[row.httpMethod] || t.text.disabled;
          const isSlow = row.p95Ms > 2000;

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
              }}
            >
              <Box
                sx={{
                  width: 36,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: t.text.disabled,
                }}
              >
                {row.rank}
              </Box>

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
                  width: 70,
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: isSlow ? 600 : 400,
                  color: isSlow ? t.status.error : row.p95Ms > 1000 ? t.status.warning : t.text.secondary,
                }}
              >
                {fNumber(row.p95Ms)}
                <Box component="span" sx={{ fontSize: '0.65rem', color: t.text.disabled, ml: 0.25 }}>ms</Box>
              </Box>

              <Box
                sx={{
                  width: 70,
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  color: t.text.secondary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fNumber(row.avgMs)}
                <Box component="span" sx={{ fontSize: '0.65rem', color: t.text.disabled, ml: 0.25 }}>ms</Box>
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
