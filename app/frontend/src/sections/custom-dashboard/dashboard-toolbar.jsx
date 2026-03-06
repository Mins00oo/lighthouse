import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { useMonitoringTokens } from 'src/hooks/use-monitoring-tokens';

import { useDashboardStore } from 'src/store/use-dashboard-store';

import { Iconify } from 'src/components/iconify';

import { V2TimeRangePicker } from 'src/sections/overview-v2/v2-time-range-picker';

// ----------------------------------------------------------------------

export function DashboardToolbar({ timeRange, onTimeRangeChange }) {
  const t = useMonitoringTokens();
  const editMode = useDashboardStore((s) => s.editMode);
  const toggleEditMode = useDashboardStore((s) => s.toggleEditMode);
  const setDrawerOpen = useDashboardStore((s) => s.setDrawerOpen);
  const resetToDefault = useDashboardStore((s) => s.resetToDefault);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleReset = useCallback(() => {
    resetToDefault();
    setResetDialogOpen(false);
  }, [resetToDefault]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* 좌측: 제목 */}
        <Box>
          <Box
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: t.text.heading,
              lineHeight: 1.3,
            }}
          >
            Lighthouse 대시보드
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: t.text.disabled, mt: 0.25 }}>
            Real-time system overview
          </Box>
        </Box>

        {/* 우측: 컨트롤 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <V2TimeRangePicker value={timeRange} onChange={onTimeRangeChange} />

          {editMode && (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
                onClick={() => setDrawerOpen(true)}
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: t.accent.blue,
                  borderColor: t.border.default,
                  '&:hover': { borderColor: t.accent.blue, bgcolor: t.accent.blueMuted },
                }}
              >
                위젯 추가
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:restart-bold" width={18} />}
                onClick={() => setResetDialogOpen(true)}
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: t.text.secondary,
                  borderColor: t.border.default,
                  '&:hover': { borderColor: t.status.warning, color: t.status.warning },
                }}
              >
                초기화
              </Button>
            </>
          )}

          <Button
            size="small"
            variant={editMode ? 'contained' : 'outlined'}
            startIcon={
              <Iconify
                icon={editMode ? 'solar:check-circle-bold' : 'solar:pen-bold'}
                width={18}
              />
            }
            onClick={toggleEditMode}
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              ...(editMode
                ? {
                    bgcolor: t.accent.blue,
                    color: '#fff',
                    '&:hover': { bgcolor: t.accent.blueDark },
                  }
                : {
                    color: t.text.secondary,
                    borderColor: t.border.default,
                    '&:hover': { borderColor: t.accent.blue, color: t.accent.blue },
                  }),
            }}
          >
            {editMode ? '완료' : '편집'}
          </Button>
        </Box>
      </Box>

      {/* 초기화 확인 다이얼로그 */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>레이아웃 초기화</DialogTitle>
        <DialogContent>
          <DialogContentText>
            대시보드 레이아웃을 기본 상태로 초기화합니다. 현재 위젯 배치와 크기 변경사항이 모두
            사라집니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} sx={{ color: t.text.secondary }}>
            취소
          </Button>
          <Button onClick={handleReset} variant="contained" color="warning">
            초기화
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
