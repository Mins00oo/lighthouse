import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fDateTime } from 'src/utils/format-time';
import { fDuration } from 'src/utils/format-duration';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const LABEL_SX = {
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  mb: 0.5,
};

const MONO_SX = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '0.75rem',
};

// ----------------------------------------------------------------------

export function LogDetailDrawer({ log, onClose }) {
  const t = useMonitoringTokens();
  const [stackOpen, setStackOpen] = useState(true);
  const [rawOpen, setRawOpen] = useState(false);

  const handleToggleStack = useCallback(() => setStackOpen((v) => !v), []);
  const handleToggleRaw = useCallback(() => setRawOpen((v) => !v), []);

  if (!log) return null;

  const levelColor = {
    ERROR: t.status.error,
    FATAL: t.status.error,
    WARN: t.status.warning,
    INFO: t.status.info,
  };

  const levelBg = {
    ERROR: t.status.errorMuted,
    FATAL: t.status.errorMuted,
    WARN: t.status.warningMuted,
    INFO: t.status.infoMuted,
  };

  const fields = [
    { label: 'Timestamp', value: log.timestamp ? fDateTime(log.timestamp, 'YYYY-MM-DD HH:mm:ss.SSS') : '-' },
    { label: 'Service', value: log.service },
    { label: 'Host', value: log.host },
    { label: 'Level', value: log.level },
    { label: 'HTTP Method', value: log.httpMethod },
    { label: 'Endpoint', value: log.httpPath, mono: true },
    { label: 'HTTP Status', value: log.httpStatus },
    { label: '응답 시간', value: log.responseTimeMs != null ? fDuration(log.responseTimeMs) : null },
    ...(log.clientIp ? [{ label: 'Client IP', value: log.clientIp, mono: true }] : []),
    { label: 'Thread', value: log.thread, mono: true },
    ...(log.exceptionClass
      ? [{ label: 'Exception Class', value: log.exceptionClass, mono: true }]
      : []),
    { label: 'Message', value: log.message, mono: true, full: true },
  ];

  return (
    <Drawer
      anchor="right"
      open={!!log}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          bgcolor: t.bg.card,
          borderLeft: `1px solid ${t.border.default}`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: t.text.heading }}>
            로그 상세 정보
          </Box>
          <Chip
            label={log.level}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              color: levelColor[log.level] || t.text.secondary,
              bgcolor: levelBg[log.level] || t.bg.surface,
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="solar:close-circle-linear" width={20} />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: t.border.subtle }} />

      {/* Body */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
        {/* Status chip */}
        {log.httpStatus && (
          <Chip
            label={`${log.httpStatus} ${log.httpStatus >= 500 ? 'Server Error' : log.httpStatus >= 400 ? 'Client Error' : 'OK'}`}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              fontWeight: 700,
              color:
                log.httpStatus >= 500
                  ? t.status.error
                  : log.httpStatus >= 400
                    ? t.status.warning
                    : t.status.success,
              bgcolor:
                log.httpStatus >= 500
                  ? t.status.errorMuted
                  : log.httpStatus >= 400
                    ? t.status.warningMuted
                    : t.status.successMuted,
            }}
          />
        )}

        {/* Fields */}
        {fields.map((field) => (
          <Box key={field.label}>
            <Box sx={{ ...LABEL_SX, color: t.text.disabled }}>{field.label}</Box>
            <Box
              sx={{
                fontSize: '0.8rem',
                color: t.text.primary,
                wordBreak: 'break-all',
                ...(field.mono && MONO_SX),
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

        {/* Stack Trace (collapsible) */}
        {log.stackTrace && (
          <Box>
            <Button
              onClick={handleToggleStack}
              size="small"
              endIcon={
                <Iconify
                  icon={stackOpen ? 'eva:collapse-fill' : 'eva:expand-fill'}
                  width={14}
                />
              }
              sx={{
                ...LABEL_SX,
                color: t.status.error,
                mb: 0.5,
                p: 0,
                minWidth: 0,
                '&:hover': { bgcolor: 'transparent', opacity: 0.8 },
              }}
            >
              Stack Trace
            </Button>
            <Collapse in={stackOpen}>
              <Box
                sx={{
                  ...MONO_SX,
                  lineHeight: 1.6,
                  color: t.status.error,
                  bgcolor: t.bg.input,
                  p: 1.5,
                  borderRadius: t.radiusSm,
                  border: `1px solid ${t.border.subtle}`,
                  maxHeight: 400,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {log.stackTrace}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Raw JSON (collapsible) */}
        {log.rawEvent && (
          <Box>
            <Button
              onClick={handleToggleRaw}
              size="small"
              endIcon={
                <Iconify
                  icon={rawOpen ? 'eva:collapse-fill' : 'eva:expand-fill'}
                  width={14}
                />
              }
              sx={{
                ...LABEL_SX,
                color: t.text.disabled,
                mb: 0.5,
                p: 0,
                minWidth: 0,
                '&:hover': { bgcolor: 'transparent', opacity: 0.8 },
              }}
            >
              JSON 원본
            </Button>
            <Collapse in={rawOpen}>
              <Box
                sx={{
                  ...MONO_SX,
                  lineHeight: 1.5,
                  color: t.text.secondary,
                  bgcolor: t.bg.input,
                  p: 1.5,
                  borderRadius: t.radiusSm,
                  border: `1px solid ${t.border.subtle}`,
                  maxHeight: 300,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(log.rawEvent), null, 2);
                  } catch {
                    return log.rawEvent;
                  }
                })()}
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
