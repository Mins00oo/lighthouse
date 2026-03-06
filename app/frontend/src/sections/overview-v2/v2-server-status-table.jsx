import Box from '@mui/material/Box';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';

import { V2InfoTip } from './v2-info-tip';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'host', label: 'Host', flex: 1 },
  { id: 'service', label: 'Service', flex: 1 },
  { id: 'status', label: 'Status', width: 80, align: 'center' },
  { id: 'logs', label: 'Logs', width: 70, align: 'right' },
  { id: 'errors', label: 'Errors', width: 70, align: 'right' },
];

// ----------------------------------------------------------------------

function StatusDot({ status, tokens }) {
  const colorMap = {
    ACTIVE: tokens.status.success,
    INACTIVE: tokens.status.error,
    WARNING: tokens.status.warning,
  };
  const color = colorMap[status] || tokens.status.error;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
        }}
      />
      <Box
        sx={{ fontSize: '0.7rem', color: tokens.text.secondary, textTransform: 'lowercase' }}
      >
        {status === 'ACTIVE' ? 'up' : 'down'}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function V2ServerStatusTable({ title, info, data, sx }) {
  const t = useMonitoringTokens();
  const rows = data ?? [];

  return (
    <Box
      sx={{
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${t.border.subtle}`,
        overflow: 'hidden',
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: t.text.primary }}>{title}</Box>
          <V2InfoTip text={info} />
        </Box>
        <Box
          sx={{
            fontSize: '0.7rem',
            color: t.accent.blue,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: t.status.success,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
          Live
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
        {rows.map((row, index) => (
          <Box
            key={`${row.host}-${row.service}-${index}`}
            sx={{
              display: 'flex',
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
                fontSize: '0.8rem',
                color: t.text.primary,
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.host}
            </Box>

            <Box
              sx={{
                flex: 1,
                fontSize: '0.8rem',
                color: t.text.secondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.service}
            </Box>

            <Box sx={{ width: 80, textAlign: 'center' }}>
              <StatusDot status={row.status} tokens={t} />
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
              {fNumber(row.recentLogCount)}
            </Box>

            <Box
              sx={{
                width: 70,
                textAlign: 'right',
                fontSize: '0.8rem',
                fontVariantNumeric: 'tabular-nums',
                color: row.recentErrorCount > 0 ? t.status.error : t.text.disabled,
                fontWeight: row.recentErrorCount > 0 ? 600 : 400,
              }}
            >
              {fNumber(row.recentErrorCount)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
