import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { fNumber } from 'src/utils/format-number';
import { fDuration } from 'src/utils/format-duration';

// ----------------------------------------------------------------------

function MethodBadge({ method, tokens }) {
  const colors = {
    GET: tokens.status.info,
    POST: tokens.status.success,
    PUT: tokens.status.warning,
    PATCH: tokens.status.warning,
    DELETE: tokens.status.error,
  };
  const color = colors[method] || tokens.text.disabled;

  return (
    <Box
      component="span"
      sx={{
        fontSize: '0.65rem',
        fontWeight: 700,
        color,
        px: 0.75,
        py: 0.25,
        borderRadius: tokens.radiusSm,
        border: `1px solid ${color}`,
        opacity: 0.9,
      }}
    >
      {method}
    </Box>
  );
}

// ----------------------------------------------------------------------

function DurationCell({ value, tokens }) {
  const isSlow = value > 2000;

  return (
    <Box
      sx={{
        fontVariantNumeric: 'tabular-nums',
        fontWeight: isSlow ? 600 : 400,
        color: isSlow ? tokens.status.error : value > 1000 ? tokens.status.warning : tokens.text.secondary,
      }}
    >
      {fDuration(value)}
    </Box>
  );
}

// ----------------------------------------------------------------------

function getColumns(t) {
  return [
    {
      field: 'rank',
      headerName: '#',
      width: 50,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
    },
    {
      field: 'httpMethod',
      headerName: 'Method',
      width: 80,
      sortable: false,
      renderCell: (params) => <MethodBadge method={params.value} tokens={t} />,
    },
    {
      field: 'httpPath',
      headerName: 'Endpoint',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '0.775rem',
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
      field: 'p95Ms',
      headerName: 'P95',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => <DurationCell value={params.value} tokens={t} />,
    },
    {
      field: 'avgMs',
      headerName: 'Avg',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => <DurationCell value={params.value} tokens={t} />,
    },
    {
      field: 'requestCount',
      headerName: 'Requests',
      width: 90,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => fNumber(value),
    },
  ];
}

// ----------------------------------------------------------------------

const GRID_HEIGHT = 480;

export function OverviewSlowApiTable({ data, sx }) {
  const t = useMonitoringTokens();
  const rows = (data ?? []).map((row, index) => ({ id: `${row.httpMethod}-${row.httpPath}-${index}`, ...row }));
  const columns = getColumns(t);

  return (
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
          응답 느린 TOP API
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
          P95 응답 시간 기준 내림차순
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
          sx={{
            border: 'none',
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
          localeText={{ noRowsLabel: '데이터가 없습니다' }}
        />
      </Box>
    </Box>
  );
}
