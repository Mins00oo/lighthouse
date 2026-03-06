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
  { label: '15분', value: '15m', minutes: 15 },
  { label: '1시간', value: '1h', minutes: 60 },
  { label: '6시간', value: '6h', minutes: 360 },
  { label: '24시간', value: '24h', minutes: 1440 },
  { label: '7일', value: '7d', minutes: 10080 },
];

// ----------------------------------------------------------------------

export function OverviewFilterBar({ timeRange, onTimeRangeChange }) {
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
      onTimeRangeChange({ from, to, label: preset.label });
      handleClose();
    },
    [onTimeRangeChange, handleClose]
  );

  const handleCustomApply = useCallback(() => {
    if (customFrom && customTo) {
      const from = toKSTString(customFrom);
      const to = toKSTString(customTo);
      onTimeRangeChange({ from, to, label: '직접 설정' });
      handleClose();
    }
  }, [customFrom, customTo, onTimeRangeChange, handleClose]);

  const itemSx = (isActive) => ({
    px: 2,
    py: 1,
    fontSize: '0.8rem',
    color: isActive ? t.accent.blue : t.text.secondary,
    fontWeight: isActive ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
    '&:hover': { bgcolor: t.bg.cardHover, color: t.text.primary },
  });

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
          '&:hover': { bgcolor: t.bg.cardHover, borderColor: t.accent.blue },
        }}
      >
        <Iconify icon="solar:clock-circle-bold" width={16} sx={{ mr: 0.75 }} />
        {timeRange?.label || '1시간'}
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
              width: showCustom ? 320 : 180,
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
                sx={itemSx(timeRange?.label === preset.label)}
              >
                {preset.label}
              </Box>
            ))}

            <Box sx={{ borderTop: `1px solid ${t.border.subtle}`, my: 0.5 }} />

            <Box
              onClick={() => setShowCustom(true)}
              sx={itemSx(timeRange?.label === '직접 설정')}
            >
              직접 설정...
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DateTimePicker
              label="시작"
              value={customFrom}
              onChange={setCustomFrom}
              maxDateTime={customTo || dayjs()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DateTimePicker
              label="끝"
              value={customTo}
              onChange={setCustomTo}
              minDateTime={customFrom}
              maxDateTime={dayjs()}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => setShowCustom(false)} sx={{ color: t.text.secondary }}>
                뒤로
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!customFrom || !customTo}
                onClick={handleCustomApply}
                sx={{ bgcolor: t.accent.blue, '&:hover': { bgcolor: t.accent.blueDark } }}
              >
                적용
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
}
