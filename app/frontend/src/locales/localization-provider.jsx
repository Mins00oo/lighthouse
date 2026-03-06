import 'dayjs/locale/ko';

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

// ----------------------------------------------------------------------

dayjs.locale('ko');

export function LocalizationProvider({ children }) {
  return (
    <Provider dateAdapter={AdapterDayjs} adapterLocale="ko">
      {children}
    </Provider>
  );
}
