import axios from 'axios';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { SERVER_DOWN_EVENT } from 'src/context/server-health-context';

import {
  JWT_STORAGE_KEY,
  SESSION_EXPIRED_KEY,
  SESSION_EXPIRED_REASONS,
} from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 네트워크 에러(서버 다운) 감지 → 점검 화면 전환
    if (!error.response) {
      window.dispatchEvent(new CustomEvent(SERVER_DOWN_EVENT));
      return Promise.reject(error);
    }

    // 401 Unauthorized → 세션 만료 처리
    if (error.response.status === 401) {
      sessionStorage.setItem(SESSION_EXPIRED_KEY, SESSION_EXPIRED_REASONS.UNAUTHORIZED);
      localStorage.removeItem(JWT_STORAGE_KEY);
      delete axiosInstance.defaults.headers.common.Authorization;
      window.location.href = paths.auth.jwt.signIn;
      return Promise.reject(error);
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong!');
  }
);

// ----------------------------------------------------------------------

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  health: '/api/health',
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    signIn: '/api/auth/login',
    refresh: '/api/auth/refresh',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  dashboard: {
    summary: '/api/dashboard/summary',
    serverStatus: '/api/dashboard/server-status',
    logVolume: '/api/dashboard/log-volume',
    logLevelDist: '/api/dashboard/log-level-distribution',
    errorTrend: '/api/dashboard/error-trend',
    apiRanking: '/api/dashboard/api-ranking',
    recentErrors: '/api/dashboard/recent-errors',
  },
};
