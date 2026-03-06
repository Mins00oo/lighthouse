import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _serverInstances } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['online', 'warning', 'offline'];

const HIDE_COLUMNS = { os: false, env: false, tags: false };

const HIDE_COLUMNS_TOGGLABLE = ['actions'];

// ----------------------------------------------------------------------

function RenderCellStatus({ params }) {
  const { status } = params.row;
  return (
    <Label
      variant="soft"
      color={
        (status === 'online' && 'success') ||
        (status === 'warning' && 'warning') ||
        (status === 'offline' && 'error') ||
        'default'
      }
    >
      {status}
    </Label>
  );
}

function RenderCellUsage({ params, field }) {
  const value = params.row[field];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 1 }}>
      <Box
        sx={{
          flexGrow: 1,
          height: 6,
          borderRadius: 1,
          bgcolor: 'action.hover',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: 1,
            borderRadius: 1,
            width: `${value}%`,
            bgcolor:
              (value >= 90 && 'error.main') ||
              (value >= 70 && 'warning.main') ||
              'success.main',
          }}
        />
      </Box>
      <Box component="span" sx={{ typography: 'caption', width: 36, textAlign: 'right' }}>
        {value}%
      </Box>
    </Box>
  );
}

function RenderCellUptime({ params }) {
  const hours = params.row.uptimeHours;
  if (hours === 0) return '-';
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${remainingHours}h`;
}

function GridActionsLinkItem({ ref, href, label, icon, sx }) {
  return (
    <MenuItem ref={ref} sx={sx}>
      <Link
        component={RouterLink}
        href={href}
        underline="none"
        color="inherit"
        sx={{ width: 1, display: 'flex', alignItems: 'center' }}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        {label}
      </Link>
    </MenuItem>
  );
}

// ----------------------------------------------------------------------

export function ServerInstanceListView() {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      hideable: false,
    },
    {
      field: 'host',
      headerName: 'Host',
      width: 130,
    },
    {
      field: 'port',
      headerName: 'Port',
      width: 80,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      type: 'singleSelect',
      valueOptions: STATUS_OPTIONS,
      renderCell: (params) => <RenderCellStatus params={params} />,
    },
    {
      field: 'os',
      headerName: 'OS',
      width: 140,
    },
    {
      field: 'cpuUsage',
      headerName: 'CPU',
      width: 140,
      type: 'number',
      renderCell: (params) => <RenderCellUsage params={params} field="cpuUsage" />,
    },
    {
      field: 'memoryUsage',
      headerName: 'Memory',
      width: 140,
      type: 'number',
      renderCell: (params) => <RenderCellUsage params={params} field="memoryUsage" />,
    },
    {
      field: 'diskUsage',
      headerName: 'Disk',
      width: 140,
      type: 'number',
      renderCell: (params) => <RenderCellUsage params={params} field="diskUsage" />,
    },
    {
      field: 'uptimeHours',
      headerName: 'Uptime',
      width: 110,
      type: 'number',
      renderCell: (params) => <RenderCellUptime params={params} />,
    },
    {
      field: 'env',
      headerName: 'Env',
      width: 120,
      type: 'singleSelect',
      valueOptions: ['production', 'staging', 'development'],
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      sortable: false,
      valueGetter: (value) => (value || []).join(', '),
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          href={paths.dashboard.serverInstances.details(params.row.id)}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const CustomToolbarCallback = useCallback(
    () => (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />

        <Box
          sx={{
            gap: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport />
        </Box>
      </GridToolbarContainer>
    ),
    []
  );

  return (
    <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Server Instances"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Server Instances', href: paths.dashboard.serverInstances.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card
        sx={{
          minHeight: 640,
          flexGrow: { md: 1 },
          display: { md: 'flex' },
          height: { xs: 800, md: '1px' },
          flexDirection: { md: 'column' },
        }}
      >
        <DataGrid
          disableRowSelectionOnClick
          rows={_serverInstances}
          columns={columns}
          getRowHeight={() => 'auto'}
          pageSizeOptions={[10, 15, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
          onRowClick={(params) => {
            window.location.href = paths.dashboard.serverInstances.details(params.row.id);
          }}
          slots={{
            toolbar: CustomToolbarCallback,
            noRowsOverlay: () => <EmptyContent title="No server instances found" />,
            noResultsOverlay: () => <EmptyContent title="No results found" />,
          }}
          slotProps={{
            toolbar: { setFilterButtonEl },
            panel: { anchorEl: filterButtonEl },
            columnsManagement: { getTogglableColumns },
          }}
          sx={{
            [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' },
            [`& .${gridClasses.row}`]: { cursor: 'pointer' },
          }}
        />
      </Card>
    </DashboardContent>
  );
}
