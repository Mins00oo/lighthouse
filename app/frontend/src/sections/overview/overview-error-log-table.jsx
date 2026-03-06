import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const COLUMNS = [
  { id: 'status', label: 'Status', width: 60 },
  { id: 'method', label: 'Method', width: 55 },
  { id: 'path', label: 'Endpoint', flex: 1 },
  { id: 'message', label: 'Message', flex: 1.5 },
  { id: 'time', label: 'Time', width: 90, align: 'right' },
];

// ----------------------------------------------------------------------

export function OverviewErrorLogTable({ data, sx }) {
  const t = useMonitoringTokens();
  const rows = data ?? [];

  const [selectedLog, setSelectedLog] = useState(null);

  const methodColors = {
    GET: t.status.info,
    POST: t.status.success,
    PUT: t.status.warning,
    PATCH: t.status.warning,
    DELETE: t.status.error,
  };

  const statusColor = (status) => {
    if (status >= 500) return t.status.error;
    if (status >= 400) return t.status.warning;
    return t.text.secondary;
  };

  const statusBg = (status) => {
    if (status >= 500) return t.status.errorMuted;
    if (status >= 400) return t.status.warningMuted;
    return t.bg.surface;
  };

  return (
    <>
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
            최근 에러 로그
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            HTTP 4xx/5xx 응답 로그 (최신순)
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
              에러 로그가 없습니다
            </Box>
          )}

          {rows.map((row) => {
            const mc = methodColors[row.httpMethod] || t.text.disabled;

            return (
              <Box
                key={row.id}
                onClick={() => setSelectedLog(row)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.25,
                  borderBottom: `1px solid ${t.border.subtle}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: t.bg.cardHover },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                {/* Status */}
                <Box sx={{ width: 60 }}>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: statusColor(row.httpStatus),
                      bgcolor: statusBg(row.httpStatus),
                      px: 0.75,
                      py: 0.25,
                      borderRadius: t.radiusSm,
                    }}
                  >
                    {row.httpStatus}
                  </Box>
                </Box>

                {/* Method */}
                <Box sx={{ width: 55 }}>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: mc,
                    }}
                  >
                    {row.httpMethod}
                  </Box>
                </Box>

                {/* Path */}
                <Box
                  sx={{
                    flex: 1,
                    fontSize: '0.75rem',
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

                {/* Message */}
                <Tooltip title={row.message || ''} arrow>
                  <Box
                    sx={{
                      flex: 1.5,
                      fontSize: '0.75rem',
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

                {/* Time */}
                <Box
                  sx={{
                    width: 90,
                    textAlign: 'right',
                    fontSize: '0.7rem',
                    color: t.text.disabled,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.timestamp ? fDateTime(row.timestamp, 'HH:mm:ss') : '-'}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Detail Drawer */}
      <ErrorDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}

// ----------------------------------------------------------------------

function ErrorDetailDrawer({ log, onClose }) {
  const t = useMonitoringTokens();

  if (!log) return null;

  const fields = [
    { label: 'Timestamp', value: log.timestamp ? fDateTime(log.timestamp) : '-' },
    { label: 'HTTP Status', value: log.httpStatus },
    { label: 'Method', value: log.httpMethod },
    { label: 'Endpoint', value: log.httpPath, mono: true },
    { label: 'Service', value: log.serviceName },
    // traceId는 백엔드에서 아직 지원하지 않아 null일 수 있음 → null이면 숨김
    ...(log.traceId ? [{ label: 'Trace ID', value: log.traceId, mono: true }] : []),
    { label: 'Message', value: log.message, mono: true, full: true },
  ];

  return (
    <Drawer
      anchor="right"
      open={!!log}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          bgcolor: t.bg.card,
          borderLeft: `1px solid ${t.border.default}`,
        },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: t.text.heading }}>
          에러 상세 정보
        </Box>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="solar:close-circle-linear" width={20} />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: t.border.subtle }} />

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Chip
          label={`${log.httpStatus} ${log.httpStatus >= 500 ? 'Server Error' : 'Client Error'}`}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            fontWeight: 700,
            color: log.httpStatus >= 500 ? t.status.error : t.status.warning,
            bgcolor: log.httpStatus >= 500 ? t.status.errorMuted : t.status.warningMuted,
          }}
        />

        {fields.map((field) => (
          <Box key={field.label}>
            <Box
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: t.text.disabled,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.5,
              }}
            >
              {field.label}
            </Box>
            <Box
              sx={{
                fontSize: '0.8rem',
                color: t.text.primary,
                wordBreak: 'break-all',
                ...(field.mono && {
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: '0.75rem',
                }),
                ...(field.full && {
                  bgcolor: t.bg.input,
                  p: 1.5,
                  borderRadius: t.radiusSm,
                  border: `1px solid ${t.border.subtle}`,
                }),
              }}
            >
              {field.value || '-'}
            </Box>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
