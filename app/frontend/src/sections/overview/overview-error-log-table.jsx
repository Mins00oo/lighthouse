import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function getColumns(t) {
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

  const methodColors = {
    GET: t.status.info,
    POST: t.status.success,
    PUT: t.status.warning,
    PATCH: t.status.warning,
    DELETE: t.status.error,
  };

  return [
    {
      field: 'httpStatus',
      headerName: 'Status',
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <Box
          component="span"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: statusColor(params.value),
            bgcolor: statusBg(params.value),
            px: 0.75,
            py: 0.25,
            borderRadius: t.radiusSm,
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'httpMethod',
      headerName: 'Method',
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <Box
          component="span"
          sx={{
            fontSize: '0.6rem',
            fontWeight: 700,
            color: methodColors[params.value] || t.text.disabled,
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'httpPath',
      headerName: 'Endpoint',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'message',
      headerName: 'Message',
      flex: 1.5,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Box
          title={params.value || ''}
          sx={{
            fontSize: '0.75rem',
            color: t.text.secondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 90,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      valueFormatter: (value) => (value ? fDateTime(value, 'HH:mm:ss') : '-'),
    },
  ];
}

// ----------------------------------------------------------------------

const GRID_HEIGHT = 480;

export function OverviewErrorLogTable({ data, sx }) {
  const t = useMonitoringTokens();
  const rows = data ?? [];
  const columns = getColumns(t);

  const [selectedLog, setSelectedLog] = useState(null);

  const handleRowClick = useCallback((params) => {
    setSelectedLog(params.row);
  }, []);

  return (
    <>
      <Box
        sx={{
          bgcolor: t.bg.card,
          borderRadius: t.radius,
          border: `1px solid ${t.border.subtle}`,
          display: 'flex',
          flexDirection: 'column',
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

        <Box sx={{ height: GRID_HEIGHT }}>
          <DataGrid
            rows={rows}
            columns={columns}
            columnHeaderHeight={36}
            disableColumnMenu
            disableColumnResize
            disableRowSelectionOnClick
            hideFooter
            getRowHeight={() => 44}
            onRowClick={handleRowClick}
            sx={{
              border: 'none',
              cursor: 'pointer',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: t.bg.surface,
                borderBottom: `1px solid ${t.border.subtle}`,
                fontSize: '0.7rem',
              },
              '& .MuiDataGrid-cell': {
                borderColor: t.border.subtle,
                fontSize: '0.8rem',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: t.bg.cardHover,
              },
              '& .MuiDataGrid-overlay': {
                fontSize: '0.8rem',
                color: t.text.disabled,
              },
            }}
            localeText={{ noRowsLabel: '에러 로그가 없습니다' }}
          />
        </Box>
      </Box>

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
