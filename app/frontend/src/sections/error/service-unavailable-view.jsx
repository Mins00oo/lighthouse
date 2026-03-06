import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { MaintenanceIllustration } from 'src/assets/illustrations';

// ----------------------------------------------------------------------

export function ServiceUnavailableView({ onRetry, retryInterval = 15000 }) {
  const [countdown, setCountdown] = useState(Math.floor(retryInterval / 1000));
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    setCountdown(Math.floor(retryInterval / 1000));

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return Math.floor(retryInterval / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryInterval]);

  const handleRetry = () => {
    setRetrying(true);
    onRetry?.();
    setTimeout(() => setRetrying(false), 3000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 3,
      }}
    >
      <Typography variant="h3" sx={{ mb: 2 }}>
        서비스 점검 중
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
        서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        {countdown}초 후 자동 재시도
      </Typography>

      <MaintenanceIllustration sx={{ my: { xs: 5, sm: 8 } }} />

      <Button
        size="large"
        variant="contained"
        onClick={handleRetry}
        disabled={retrying}
        startIcon={retrying ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {retrying ? '연결 확인 중...' : '다시 시도'}
      </Button>
    </Box>
  );
}
