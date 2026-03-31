import dayjs from 'dayjs';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fDuration } from 'src/utils/format-duration';
import { fDateTime, toKSTString } from 'src/utils/format-time';

import { useSearchLogs } from 'src/actions/logs';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { LogFilterBar } from '../log-filter-bar';
import { LogDetailDrawer } from '../log-detail-drawer';

// ----------------------------------------------------------------------

const DEFAULT_SIZE = 50;

function getDefaultFilters() {
  return {
    from: toKSTString(dayjs().subtract(1, 'hour')),
    to: toKSTString(),
    level: [],
    method: [],
    status: [],
    endpoint: '',
    keyword: '',
    minMs: '',
    maxMs: '',
  };
}

function filtersFromSearchParams(sp) {
  const defaults = getDefaultFilters();
  return {
    from: sp.get('from') || defaults.from,
    to: sp.get('to') || defaults.to,
    level: sp.get('level') ? sp.get('level').split(',') : [],
    method: sp.get('method') ? sp.get('method').split(',') : [],
    status: sp.get('status') ? sp.get('status').split(',') : [],
    endpoint: sp.get('endpoint') || '',
    keyword: sp.get('keyword') || '',
    minMs: sp.get('minMs') || '',
    maxMs: sp.get('maxMs') || '',
  };
}

function filtersToSearchParams(filters, page, size) {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.level?.length) params.set('level', filters.level.join(','));
  if (filters.method?.length) params.set('method', filters.method.join(','));
  if (filters.status?.length) params.set('status', filters.status.join(','));
  if (filters.endpoint) params.set('endpoint', filters.endpoint);
  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.minMs) params.set('minMs', filters.minMs);
  if (filters.maxMs) params.set('maxMs', filters.maxMs);
  if (page > 0) params.set('page', String(page));
  if (size !== DEFAULT_SIZE) params.set('size', String(size));
  return params;
}

// ----------------------------------------------------------------------

function getColumns(t) {
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

  const statusColor = (s) => {
    if (s >= 500) return t.status.error;
    if (s >= 400) return t.status.warning;
    return t.status.success;
  };

  const statusBg = (s) => {
    if (s >= 500) return t.status.errorMuted;
    if (s >= 400) return t.status.warningMuted;
    return t.status.successMuted;
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
      field: 'timestamp',
      headerName: '시간',
      width: 180,
      valueFormatter: (value) => (value ? fDateTime(value, 'YYYY-MM-DD HH:mm:ss.SSS') : '-'),
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 80,
      renderCell: ({ value }) => (
        <Box
          component="span"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: levelColor[value] || t.text.secondary,
            bgcolor: levelBg[value] || t.bg.surface,
            px: 0.75,
            py: 0.25,
            borderRadius: t.radiusSm,
          }}
        >
          {value || '-'}
        </Box>
      ),
    },
    {
      field: 'httpMethod',
      headerName: 'Method',
      width: 80,
      renderCell: ({ value }) => (
        <Box
          component="span"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: methodColors[value] || t.text.disabled,
          }}
        >
          {value || '-'}
        </Box>
      ),
    },
    {
      field: 'httpPath',
      headerName: 'Endpoint',
      flex: 1,
      minWidth: 200,
      renderCell: ({ value }) => (
        <Box
          sx={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value || '-'}
        </Box>
      ),
    },
    {
      field: 'httpStatus',
      headerName: 'Status',
      width: 80,
      renderCell: ({ value }) =>
        value ? (
          <Box
            component="span"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: statusColor(value),
              bgcolor: statusBg(value),
              px: 0.75,
              py: 0.25,
              borderRadius: t.radiusSm,
            }}
          >
            {value}
          </Box>
        ) : (
          '-'
        ),
    },
    {
      field: 'responseTimeMs',
      headerName: '응답 시간',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => (value != null ? fDuration(value) : '-'),
    },
    {
      field: 'clientIp',
      headerName: 'Client IP',
      width: 130,
      renderCell: ({ value }) => (
        <Box sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{value || '-'}</Box>
      ),
    },
  ];
}

// ----------------------------------------------------------------------

export function LogListView() {
  const t = useMonitoringTokens();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL params → active query filters
  const queryFilters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const queryPage = Number(searchParams.get('page') || '0');
  const querySize = Number(searchParams.get('size') || String(DEFAULT_SIZE));

  // Local editing state
  const [editingFilters, setEditingFilters] = useState(queryFilters);

  // Sync editing state when URL changes externally (e.g., from dashboard link)
  useEffect(() => {
    setEditingFilters(queryFilters);
  }, [queryFilters]);

  // Build SWR params from URL (source of truth)
  const swrParams = useMemo(
    () => ({
      from: queryFilters.from,
      to: queryFilters.to,
      level: queryFilters.level?.join(',') || undefined,
      keyword: queryFilters.keyword || undefined,
      page: queryPage,
      size: querySize,
    }),
    [queryFilters, queryPage, querySize]
  );

  const { logs, totalElements, logsLoading, logsError } = useSearchLogs(swrParams);

  const columns = useMemo(() => getColumns(t), [t]);

  // Detail drawer
  const [selectedLog, setSelectedLog] = useState(null);

  const handleRowClick = useCallback((params) => {
    setSelectedLog(params.row);
  }, []);

  // Search: sync editing filters → URL
  const handleSearch = useCallback(() => {
    setSearchParams(filtersToSearchParams(editingFilters, 0, querySize), { replace: true });
  }, [editingFilters, querySize, setSearchParams]);

  // Reset
  const handleReset = useCallback(() => {
    const defaults = getDefaultFilters();
    setEditingFilters(defaults);
    setSearchParams(filtersToSearchParams(defaults, 0, DEFAULT_SIZE), { replace: true });
  }, [setSearchParams]);

  // Pagination
  const handlePaginationChange = useCallback(
    (model) => {
      setSearchParams(filtersToSearchParams(queryFilters, model.page, model.pageSize), {
        replace: true,
      });
    },
    [queryFilters, setSearchParams]
  );

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        bgcolor: t.bg.body,
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        '--layout-dashboard-content-pt': '16px',
        '--layout-dashboard-content-pb': '16px',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Box
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: t.text.heading,
              lineHeight: 1.3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Iconify icon="solar:document-bold" width={22} sx={{ color: t.accent.blue }} />
            로그 조회
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            애플리케이션 로그 검색 및 상세 조회
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2 }}>
        <LogFilterBar
          filters={editingFilters}
          onFiltersChange={setEditingFilters}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </Box>

      {/* Error banner */}
      {logsError && (
        <Box
          sx={{
            p: 1.5,
            mb: 2,
            fontSize: '0.8rem',
            color: t.status.error,
            bgcolor: t.status.errorMuted,
            borderRadius: t.radiusSm,
            border: `1px solid ${t.status.error}`,
          }}
        >
          로그를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </Box>
      )}

      {/* DataGrid — fills remaining space */}
      <Box
        sx={{
          bgcolor: t.bg.card,
          borderRadius: t.radius,
          border: `1px solid ${t.border.subtle}`,
          flex: '1 1 0',
          minHeight: 400,
        }}
      >
        <DataGrid
          rows={logs}
          columns={columns}
          loading={logsLoading}
          rowCount={totalElements}
          paginationMode="server"
          paginationModel={{ page: queryPage, pageSize: querySize }}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[25, 50, 100]}
          columnHeaderHeight={40}
          disableColumnMenu
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          getRowHeight={() => 44}
          getRowClassName={(params) => {
            if (params.row.level === 'ERROR' || params.row.level === 'FATAL') return 'row-error';
            if (params.row.level === 'WARN') return 'row-warn';
            return '';
          }}
          sx={{
            border: 'none',
            height: '100%',
            cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: t.bg.surface,
              borderBottom: `1px solid ${t.border.subtle}`,
              fontSize: '0.75rem',
            },
            '& .MuiDataGrid-cell': {
              borderColor: t.border.subtle,
              fontSize: '0.8rem',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: t.bg.cardHover,
            },
            '& .row-error': {
              bgcolor: t.status.errorMuted,
              '&:hover': { bgcolor: t.status.errorMuted, filter: 'brightness(1.1)' },
            },
            '& .row-warn': {
              bgcolor: t.status.warningMuted,
              '&:hover': { bgcolor: t.status.warningMuted, filter: 'brightness(1.1)' },
            },
            '& .MuiDataGrid-overlay': {
              fontSize: '0.8rem',
              color: t.text.disabled,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${t.border.subtle}`,
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: '0.8rem',
            },
            '& .MuiTablePagination-selectLabel': {
              fontSize: '0.8rem',
            },
          }}
          localeText={{
            noRowsLabel: '조건에 맞는 로그가 없습니다',
            MuiTablePagination: {
              labelRowsPerPage: '페이지당 행 수:',
              labelDisplayedRows: ({ from, to, count }) =>
                `${from}-${to} / 총 ${count !== -1 ? count : `${to}+`}건`,
            },
          }}
        />
      </Box>

      {/* Detail Drawer */}
      <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </DashboardContent>
  );
}
