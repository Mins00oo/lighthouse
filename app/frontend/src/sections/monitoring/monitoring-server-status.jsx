import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'host', label: 'Host' },
  { id: 'service', label: 'Service' },
  { id: 'env', label: 'Env' },
  { id: 'status', label: 'Status' },
  { id: 'lastLogTime', label: 'Last Log' },
  { id: 'recentLogCount', label: 'Logs', align: 'right' },
  { id: 'recentErrorCount', label: 'Errors', align: 'right' },
];

// ----------------------------------------------------------------------

export function MonitoringServerStatus({ title, subheader, data, sx, ...other }) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHeadCustom headCells={HEAD_CELLS} />

          <TableBody>
            {(data ?? []).map((row, index) => (
              <ServerRow key={`${row.host}-${row.service}-${index}`} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ServerRow({ row }) {
  return (
    <TableRow>
      <TableCell sx={{ typography: 'body2' }}>{row.host}</TableCell>

      <TableCell>{row.service}</TableCell>

      <TableCell>{row.env}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={row.status === 'ACTIVE' ? 'success' : 'error'}
        >
          {row.status}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.lastLogTime ? fDateTime(row.lastLogTime) : '-'}
      </TableCell>

      <TableCell align="right">{fNumber(row.recentLogCount)}</TableCell>

      <TableCell align="right">
        <Label variant="soft" color={row.recentErrorCount > 0 ? 'error' : 'default'}>
          {fNumber(row.recentErrorCount)}
        </Label>
      </TableCell>
    </TableRow>
  );
}
