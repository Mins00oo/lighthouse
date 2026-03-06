import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

// ----------------------------------------------------------------------

export function SignUpTerms({ sx, ...other }) {
  return (
    <Box
      component="span"
      sx={[
        () => ({
          mt: 3,
          display: 'block',
          textAlign: 'center',
          typography: 'caption',
          color: 'text.secondary',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {'회원가입 시 '}
      <Link underline="always" color="text.primary">
        이용약관
      </Link>
      {' 및 '}
      <Link underline="always" color="text.primary">
        개인정보 처리방침
      </Link>
      에 동의하게 됩니다.
    </Box>
  );
}
