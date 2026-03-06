import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fToNow } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { V2InfoTip } from './v2-info-tip';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'exception', label: 'Exception', flex: 1 },
  { id: 'message', label: 'Message', flex: 1.5 },
  { id: 'count', label: 'Count', width: 65, align: 'right' },
  { id: 'lastSeen', label: 'Last Seen', width: 100, align: 'right' },
];

// ----------------------------------------------------------------------

export function V2RecentErrorsTable({ title, info, data, sx }) {
  const t = useMonitoringTokens();
  const sorted = [...(data ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>{title}</Box>
          <V2InfoTip text={info} />
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
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {sorted.map((row, index) => (
          <Box
            key={`${row.exceptionClass}-${index}`}
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
                flex: 1,
                fontSize: '0.75rem',
                color: t.status.error,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                pr: 1,
              }}
            >
              {row.exceptionClass}
            </Box>

            <Tooltip title={row.message || ''} arrow>
              <Box
                sx={{
                  flex: 1.5,
                  fontSize: '0.775rem',
                  color: t.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  pr: 1,
                }}
              >
                {row.message}
              </Box>
            </Tooltip>

            <Box
              sx={{
                width: 65,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: t.status.error,
                  bgcolor: t.status.errorMuted,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: t.radiusSm,
                }}
              >
                {fNumber(row.count)}
              </Box>
            </Box>

            <Box
              sx={{
                width: 100,
                textAlign: 'right',
                fontSize: '0.75rem',
                color: t.text.disabled,
                whiteSpace: 'nowrap',
              }}
            >
              {row.lastOccurrence ? fToNow(row.lastOccurrence) : '-'}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
