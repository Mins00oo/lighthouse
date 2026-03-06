import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { signInWithPassword } from '../../context/jwt';
import { SESSION_EXPIRED_KEY, SESSION_EXPIRED_REASONS } from '../../context/jwt/constant';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  username: zod
    .string()
    .min(1, { message: '아이디를 입력해주세요.' }),
  password: zod
    .string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
    .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' }),
});

// ----------------------------------------------------------------------

function LighthouseIcon({ sx }) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Box
      sx={{
        width: 96,
        height: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="96"
        height="96"
      >
        {/* Glow effect definition */}
        <defs>
          <radialGradient id="lightGlow" cx="50%" cy="30%" r="50%">
            <animate
              attributeName="r"
              values="40%;55%;40%"
              dur="3s"
              repeatCount="indefinite"
            />
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4">
              <animate
                attributeName="stopOpacity"
                values="0.4;0.6;0.4"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Light glow */}
        <circle cx="50" cy="28" r="22" fill="url(#lightGlow)" />

        {/* Light beams */}
        <g opacity="0.5">
          <animate
            attributeName="opacity"
            values="0.5;0.8;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
          <polygon points="50,22 20,8 25,14" fill={primaryColor} opacity="0.3" />
          <polygon points="50,22 80,8 75,14" fill={primaryColor} opacity="0.3" />
          <polygon points="50,22 10,18 18,22" fill={primaryColor} opacity="0.2" />
          <polygon points="50,22 90,18 82,22" fill={primaryColor} opacity="0.2" />
        </g>

        {/* Lighthouse top (lamp room) */}
        <rect x="40" y="20" width="20" height="14" rx="2" fill={primaryColor} />
        {/* Lamp room glass */}
        <rect x="43" y="22" width="14" height="10" rx="1" fill={primaryColor} opacity="0.5" />
        {/* Lamp room cap */}
        <polygon points="38,20 62,20 56,14 44,14" fill={primaryColor} />
        {/* Dome */}
        <ellipse cx="50" cy="14" rx="6" ry="4" fill={primaryColor} />

        {/* Lighthouse body */}
        <polygon points="38,34 62,34 58,82 42,82" fill={primaryColor} />

        {/* Body stripes */}
        <polygon points="38.8,38 61.2,38 60.4,44 39.6,44" fill="white" opacity="0.9" />
        <polygon points="40.4,50 59.6,50 58.8,56 41.2,56" fill="white" opacity="0.9" />
        <polygon points="42,62 58,62 57.2,68 42.8,68" fill="white" opacity="0.9" />

        {/* Door */}
        <rect x="46" y="72" width="8" height="10" rx="4" fill="white" opacity="0.9" />

        {/* Base */}
        <rect x="36" y="82" width="28" height="6" rx="1" fill={primaryColor} />
        {/* Base platform */}
        <rect x="30" y="88" width="40" height="5" rx="2" fill={primaryColor} opacity="0.8" />
      </svg>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');

  useEffect(() => {
    const reason = sessionStorage.getItem(SESSION_EXPIRED_KEY);
    if (reason) {
      sessionStorage.removeItem(SESSION_EXPIRED_KEY);
      if (reason === SESSION_EXPIRED_REASONS.TOKEN_EXPIRED) {
        setSessionMessage('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else if (reason === SESSION_EXPIRED_REASONS.UNAUTHORIZED) {
        setSessionMessage('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
      }
    }
  }, []);

  const defaultValues = {
    username: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ username: data.username, password: data.password });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="username" label="아이디" slotProps={{ inputLabel: { shrink: true } }} />

      <Field.Text
        name="password"
        label="비밀번호"
        placeholder="6자 이상"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify
                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="로그인 중..."
      >
        로그인
      </Button>
    </Box>
  );

  return (
    <>
      <LighthouseIcon sx={{ mb: 3, mx: 'auto' }} />

      <FormHead
        title="로그인"
        description="Lighthouse Monitoring System"
      />

      {!!sessionMessage && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {sessionMessage}
        </Alert>
      )}

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
