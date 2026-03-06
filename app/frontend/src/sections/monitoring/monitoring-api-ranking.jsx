import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const HEAD_CELLS = [
  { id: 'method', label: 'Method', width: 80 },
  { id: 'path', label: 'Path' },
  { id: 'requestCount', label: 'Requests', align: 'right' },
  { id: 'avgResponseTimeMs', label: 'Avg (ms)', align: 'right' },
  { id: 'p95ResponseTimeMs', label: 'P95 (ms)', align: 'right' },
  { id: 'errorCount', label: 'Errors', align: 'right' },
  { id: 'errorRate', label: 'Error %', align: 'right' },
];

const METHOD_COLORS = {
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'error',
};

// ----------------------------------------------------------------------

export function MonitoringApiRanking({ title, subheader, data, sx, ...other }) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom headCells={HEAD_CELLS} />

          <TableBody>
            {(data ?? []).map((row, index) => (
              <ApiRow key={`${row.httpMethod}-${row.httpPath}-${index}`} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ApiRow({ row }) {
  const errorRate = row.errorRate ?? 0;
  const isHighError = errorRate > 5;

  return (
    <TableRow sx={isHighError ? { bgcolor: 'error.lighter' } : undefined}>
      <TableCell>
        <Label variant="soft" color={METHOD_COLORS[row.httpMethod] || 'default'}>
          {row.httpMethod}
        </Label>
      </TableCell>

      <TableCell sx={{ typography: 'body2', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {row.httpPath}
      </TableCell>

      <TableCell align="right">{fNumber(row.requestCount)}</TableCell>

      <TableCell align="right">{fNumber(row.avgResponseTimeMs)}</TableCell>

      <TableCell align="right">{fNumber(row.p95ResponseTimeMs)}</TableCell>

      <TableCell align="right">
        <Label variant="soft" color={row.errorCount > 0 ? 'error' : 'default'}>
          {fNumber(row.errorCount)}
        </Label>
      </TableCell>

      <TableCell align="right">
        <Label variant="soft" color={isHighError ? 'error' : 'default'}>
          {`${errorRate.toFixed(1)}%`}
        </Label>
      </TableCell>
    </TableRow>
  );
}
