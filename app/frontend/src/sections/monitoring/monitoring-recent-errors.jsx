import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { fToNow } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'exceptionClass', label: 'Exception' },
  { id: 'message', label: 'Message' },
  { id: 'count', label: 'Count', align: 'right', width: 80 },
  { id: 'lastOccurrence', label: 'Last Seen', width: 120 },
];

// ----------------------------------------------------------------------

export function MonitoringRecentErrors({ title, subheader, data, sx, ...other }) {
  const sorted = [...(data ?? [])].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 560 }}>
          <TableHeadCustom headCells={HEAD_CELLS} />

          <TableBody>
            {sorted.map((row, index) => (
              <ErrorRow key={`${row.exceptionClass}-${index}`} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ErrorRow({ row }) {
  return (
    <TableRow>
      <TableCell sx={{ typography: 'body2', fontFamily: 'monospace', fontSize: '0.75rem' }}>
        {row.exceptionClass}
      </TableCell>

      <TableCell>
        <Tooltip title={row.message || ''} arrow>
          <span
            style={{
              display: 'block',
              maxWidth: 240,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.message}
          </span>
        </Tooltip>
      </TableCell>

      <TableCell align="right">
        <Label variant="soft" color="error">
          {fNumber(row.count)}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', typography: 'body2' }}>
        {row.lastOccurrence ? fToNow(row.lastOccurrence) : '-'}
      </TableCell>
    </TableRow>
  );
}
