import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { toKSTString } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PRESETS = [
  { label: 'Last 15 minutes', value: '15m', minutes: 15 },
  { label: 'Last 1 hour', value: '1h', minutes: 60 },
  { label: 'Last 6 hours', value: '6h', minutes: 360 },
  { label: 'Last 24 hours', value: '24h', minutes: 1440 },
  { label: 'Last 7 days', value: '7d', minutes: 10080 },
  { label: 'Last 30 days', value: '30d', minutes: 43200 },
];

// ----------------------------------------------------------------------

export function TimeRangePicker({ value, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [showCustom, setShowCustom] = useState(false);

  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
    setShowCustom(false);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setShowCustom(false);
  }, []);

  const handlePreset = useCallback(
    (preset) => {
      const to = toKSTString();
      const from = toKSTString(dayjs().subtract(preset.minutes, 'minute'));
      onChange({ from, to, label: preset.label });
      handleClose();
    },
    [onChange, handleClose]
  );

  const handleCustomApply = useCallback(() => {
    if (customFrom && customTo) {
      const from = toKSTString(customFrom);
      const to = toKSTString(customTo);
      onChange({ from, to, label: 'Custom' });
      handleClose();
    }
  }, [customFrom, customTo, onChange, handleClose]);

  return (
    <>
      <Button
        color="inherit"
        onClick={handleOpen}
        endIcon={<Iconify icon="eva:chevron-down-fill" />}
        sx={{
          typography: 'body2',
          fontWeight: 'fontWeightSemiBold',
        }}
      >
        {value?.label || 'Last 1 hour'}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: showCustom ? 320 : 220 } } }}
      >
        {!showCustom ? (
          <List disablePadding>
            {PRESETS.map((preset) => (
              <ListItemButton
                key={preset.value}
                selected={value?.label === preset.label}
                onClick={() => handlePreset(preset)}
              >
                <ListItemText primary={preset.label} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItemButton>
            ))}

            <Divider sx={{ borderStyle: 'dashed' }} />

            <ListItemButton onClick={() => setShowCustom(true)}>
              <ListItemText
                primary="Custom range..."
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'fontWeightSemiBold' }}
              />
            </ListItemButton>
          </List>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DateTimePicker
              label="From"
              value={customFrom}
              onChange={setCustomFrom}
              maxDateTime={customTo || dayjs()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />

            <DateTimePicker
              label="To"
              value={customTo}
              onChange={setCustomTo}
              minDateTime={customFrom}
              maxDateTime={dayjs()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" color="inherit" onClick={() => setShowCustom(false)}>
                Back
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!customFrom || !customTo}
                onClick={handleCustomApply}
              >
                Apply
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
}
