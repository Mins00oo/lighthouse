import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import { DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TablePagination from '@mui/material/TablePagination';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { useGetAlertHistory } from 'src/actions/alerts';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

const LEVEL_CHIP_COLOR = {
  CRITICAL: 'error',
  WARNING: 'warning',
  RESOLVED: 'success',
};

const RULE_TYPES = [
  { value: '', label: '전체' },
  { value: 'ERROR_RATE', label: 'Error Rate' },
  { value: 'RESPONSE_TIME', label: 'Response Time' },
  { value: 'API_FAILURE', label: 'API Failure' },
];

const LEVELS = [
  { value: '', label: '전체' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'RESOLVED', label: 'Resolved' },
];

// ----------------------------------------------------------------------

export function AlertListView() {
  const t = useMonitoringTokens();

  const [ruleType, setRuleType] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { alertHistory, alertHistoryLoading } = useGetAlertHistory(
    undefined,
    undefined,
    ruleType || undefined,
    level || undefined,
    page,
    pageSize
  );

  const handleRuleTypeChange = useCallback((e) => {
    setRuleType(e.target.value);
    setPage(0);
  }, []);

  const handleLevelChange = useCallback((e) => {
    setLevel(e.target.value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((_event, newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const columns = [
    {
      field: 'timestamp',
      headerName: '시간',
      minWidth: 180,
      flex: 1,
      valueFormatter: (value) => {
        if (!value) return '-';
        return value.replace('T', ' ').substring(0, 19);
      },
    },
    {
      field: 'service',
      headerName: '서비스',
      minWidth: 140,
      flex: 0.8,
    },
    {
      field: 'ruleType',
      headerName: '규칙',
      minWidth: 130,
      flex: 0.7,
    },
    {
      field: 'level',
      headerName: '레벨',
      minWidth: 110,
      flex: 0.5,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={LEVEL_CHIP_COLOR[params.value] || 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'triggered',
      headerName: '트리거',
      minWidth: 90,
      flex: 0.4,
      valueFormatter: (value) => (value ? 'Y' : 'N'),
    },
    {
      field: 'message',
      headerName: '메시지',
      minWidth: 250,
      flex: 2,
    },
  ];

  const rows = (alertHistory?.alerts ?? []).map((row, idx) => ({
    id: `${row.timestamp}-${idx}`,
    ...row,
  }));

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        bgcolor: t.bg.body,
        minHeight: '100vh',
        '--layout-dashboard-content-pt': '16px',
        '--layout-dashboard-content-pb': '32px',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ fontSize: '1.25rem', fontWeight: 700, color: t.text.heading, lineHeight: 1.3 }}>
          Alerts
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          알림 이력 조회
        </Box>
      </Box>

      {/* Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>규칙 유형</InputLabel>
          <Select
            value={ruleType}
            label="규칙 유형"
            onChange={handleRuleTypeChange}
            sx={{
              bgcolor: t.bg.card,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border.default },
            }}
          >
            {RULE_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>레벨</InputLabel>
          <Select
            value={level}
            label="레벨"
            onChange={handleLevelChange}
            sx={{
              bgcolor: t.bg.card,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border.default },
            }}
          >
            {LEVELS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box
        sx={{
          bgcolor: t.bg.card,
          borderRadius: t.radius,
          border: `1px solid ${t.border.subtle}`,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={alertHistoryLoading}
          autoHeight
          hideFooter
          disableRowSelectionOnClick
          disableColumnMenu
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: t.bg.cardHover,
              borderBottom: `1px solid ${t.border.subtle}`,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${t.border.subtle}`,
              color: t.text.primary,
              fontSize: '0.8rem',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.75rem',
              color: t.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
          }}
        />

        <TablePagination
          component="div"
          count={alertHistory?.totalCount ?? 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="페이지당 행 수"
          sx={{
            borderTop: `1px solid ${t.border.subtle}`,
            color: t.text.secondary,
          }}
        />
      </Box>
    </DashboardContent>
  );
}
