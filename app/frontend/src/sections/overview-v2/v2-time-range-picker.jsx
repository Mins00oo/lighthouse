import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { toKSTString } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PRESETS = [
  { label: 'Last 15 min', value: '15m', minutes: 15 },
  { label: 'Last 1 hour', value: '1h', minutes: 60 },
  { label: 'Last 6 hours', value: '6h', minutes: 360 },
  { label: 'Last 24 hours', value: '24h', minutes: 1440 },
  { label: 'Last 7 days', value: '7d', minutes: 10080 },
  { label: 'Last 30 days', value: '30d', minutes: 43200 },
];

// ----------------------------------------------------------------------

export function V2TimeRangePicker({ value, onChange }) {
  const t = useMonitoringTokens();

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
        onClick={handleOpen}
        endIcon={<Iconify icon="eva:chevron-down-fill" width={16} />}
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: t.text.secondary,
          bgcolor: t.bg.card,
          border: `1px solid ${t.border.default}`,
          borderRadius: t.radiusSm,
          px: 1.5,
          py: 0.75,
          '&:hover': {
            bgcolor: t.bg.cardHover,
            borderColor: t.accent.blue,
          },
        }}
      >
        <Iconify icon="solar:clock-circle-bold" width={16} sx={{ mr: 0.75 }} />
        {value?.label || 'Last 1 hour'}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              bgcolor: t.bg.card,
              border: `1px solid ${t.border.default}`,
              boxShadow: t.shadowLg,
              width: showCustom ? 320 : 200,
            },
          },
        }}
      >
        {!showCustom ? (
          <Box sx={{ py: 0.5 }}>
            {PRESETS.map((preset) => (
              <Box
                key={preset.value}
                onClick={() => handlePreset(preset)}
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '0.8rem',
                  color: value?.label === preset.label ? t.accent.blue : t.text.secondary,
                  fontWeight: value?.label === preset.label ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: t.bg.cardHover,
                    color: t.text.primary,
                  },
                }}
              >
                {preset.label}
              </Box>
            ))}

            <Box sx={{ borderTop: `1px solid ${t.border.subtle}`, my: 0.5 }} />

            <Box
              onClick={() => setShowCustom(true)}
              sx={{
                px: 2,
                py: 1,
                fontSize: '0.8rem',
                color: t.text.secondary,
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: t.bg.cardHover,
                  color: t.text.primary,
                },
              }}
            >
              Custom range...
            </Box>
          </Box>
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
              <Button
                size="small"
                onClick={() => setShowCustom(false)}
                sx={{ color: t.text.secondary }}
              >
                Back
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!customFrom || !customTo}
                onClick={handleCustomApply}
                sx={{ bgcolor: t.accent.blue, '&:hover': { bgcolor: t.accent.blueDark } }}
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
