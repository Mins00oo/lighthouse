import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PRESETS = [
  { label: '15분', minutes: 15 },
  { label: '1시간', minutes: 60 },
  { label: '6시간', minutes: 360 },
  { label: '24시간', minutes: 1440 },
  { label: '7일', minutes: 10080 },
];

const LEVEL_OPTIONS = ['INFO', 'WARN', 'ERROR', 'FATAL'];

const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

const STATUS_OPTIONS = [
  { label: '2xx', value: '2xx' },
  { label: '4xx', value: '4xx' },
  { label: '5xx', value: '5xx' },
];

// ----------------------------------------------------------------------

export function LogFilterBar({ filters, onFiltersChange, onSearch, onReset }) {
  const t = useMonitoringTokens();
  const [activePreset, setActivePreset] = useState(null);

  const update = useCallback(
    (key, value) => {
      onFiltersChange((prev) => ({ ...prev, [key]: value }));
    },
    [onFiltersChange]
  );

  const handlePreset = useCallback(
    (preset) => {
      setActivePreset(preset.label);
      const to = toKSTString();
      const from = toKSTString(dayjs().subtract(preset.minutes, 'minute'));
      onFiltersChange((prev) => ({ ...prev, from, to }));
    },
    [onFiltersChange]
  );

  const handleFromChange = useCallback(
    (val) => {
      setActivePreset(null);
      update('from', val ? toKSTString(val) : '');
    },
    [update]
  );

  const handleToChange = useCallback(
    (val) => {
      setActivePreset(null);
      update('to', val ? toKSTString(val) : '');
    },
    [update]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') onSearch();
    },
    [onSearch]
  );

  const chipSx = (active) => ({
    fontSize: '0.75rem',
    fontWeight: active ? 600 : 400,
    color: active ? t.accent.blue : t.text.secondary,
    bgcolor: active ? t.accent.blueMuted : 'transparent',
    border: `1px solid ${active ? t.accent.blue : t.border.default}`,
    cursor: 'pointer',
    '&:hover': { bgcolor: active ? t.accent.blueMuted : t.bg.cardHover },
  });

  const selectSx = {
    fontSize: '0.8rem',
    bgcolor: t.bg.card,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border.default },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.accent.blue },
  };

  return (
    <Box
      sx={{
        bgcolor: t.bg.card,
        borderRadius: t.radius,
        border: `1px solid ${t.border.subtle}`,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* Row 1: Time range */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: t.text.disabled }} />

        {PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            onClick={() => handlePreset(preset)}
            sx={chipSx(activePreset === preset.label)}
          />
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
          <DateTimePicker
            value={filters.from ? dayjs(filters.from) : null}
            onChange={handleFromChange}
            maxDateTime={filters.to ? dayjs(filters.to) : dayjs()}
            slotProps={{
              textField: {
                size: 'small',
                placeholder: '시작',
                sx: { width: 200, '& input': { fontSize: '0.8rem' } },
              },
            }}
          />
          <Box sx={{ fontSize: '0.8rem', color: t.text.disabled }}>~</Box>
          <DateTimePicker
            value={filters.to ? dayjs(filters.to) : null}
            onChange={handleToChange}
            minDateTime={filters.from ? dayjs(filters.from) : undefined}
            maxDateTime={dayjs()}
            slotProps={{
              textField: {
                size: 'small',
                placeholder: '끝',
                sx: { width: 200, '& input': { fontSize: '0.8rem' } },
              },
            }}
          />
        </Box>
      </Box>

      {/* Row 2: Filters + actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {/* Level */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>Level</InputLabel>
          <Select
            multiple
            value={filters.level || []}
            onChange={(e) => update('level', e.target.value)}
            input={<OutlinedInput label="Level" />}
            renderValue={(selected) => selected.join(', ')}
            sx={selectSx}
          >
            {LEVEL_OPTIONS.map((lvl) => (
              <MenuItem key={lvl} value={lvl} dense>
                <Checkbox size="small" checked={(filters.level || []).includes(lvl)} />
                <ListItemText primary={lvl} primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Method */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>Method</InputLabel>
          <Select
            multiple
            value={filters.method || []}
            onChange={(e) => update('method', e.target.value)}
            input={<OutlinedInput label="Method" />}
            renderValue={(selected) => selected.join(', ')}
            sx={selectSx}
          >
            {METHOD_OPTIONS.map((m) => (
              <MenuItem key={m} value={m} dense>
                <Checkbox size="small" checked={(filters.method || []).includes(m)} />
                <ListItemText primary={m} primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>Status</InputLabel>
          <Select
            multiple
            value={filters.status || []}
            onChange={(e) => update('status', e.target.value)}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => selected.join(', ')}
            sx={selectSx}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value} dense>
                <Checkbox size="small" checked={(filters.status || []).includes(s.value)} />
                <ListItemText primary={s.label} primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Endpoint */}
        <TextField
          size="small"
          placeholder="Endpoint (예: /api/orders)"
          value={filters.endpoint || ''}
          onChange={(e) => update('endpoint', e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 200, '& input': { fontSize: '0.8rem' }, ...selectSx }}
        />

        {/* Keyword */}
        <TextField
          size="small"
          placeholder="키워드 검색"
          value={filters.keyword || ''}
          onChange={(e) => update('keyword', e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <Iconify icon="eva:search-fill" width={16} sx={{ mr: 0.5, color: t.text.disabled }} />
            ),
          }}
          sx={{ width: 180, '& input': { fontSize: '0.8rem' }, ...selectSx }}
        />

        {/* Response time range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            size="small"
            type="number"
            placeholder="min"
            value={filters.minMs || ''}
            onChange={(e) => update('minMs', e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ width: 80, '& input': { fontSize: '0.8rem' }, ...selectSx }}
          />
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled }}>~</Box>
          <TextField
            size="small"
            type="number"
            placeholder="max"
            value={filters.maxMs || ''}
            onChange={(e) => update('maxMs', e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ width: 80, '& input': { fontSize: '0.8rem' }, ...selectSx }}
          />
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled }}>ms</Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Button
          variant="contained"
          size="small"
          onClick={onSearch}
          startIcon={<Iconify icon="eva:search-fill" width={16} />}
          sx={{
            fontSize: '0.8rem',
            bgcolor: t.accent.blue,
            '&:hover': { bgcolor: t.accent.blueDark },
          }}
        >
          검색
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onReset}
          startIcon={<Iconify icon="solar:restart-bold" width={16} />}
          sx={{
            fontSize: '0.8rem',
            color: t.text.secondary,
            borderColor: t.border.default,
            '&:hover': { borderColor: t.text.secondary, bgcolor: t.bg.cardHover },
          }}
        >
          초기화
        </Button>
      </Box>
    </Box>
  );
}
