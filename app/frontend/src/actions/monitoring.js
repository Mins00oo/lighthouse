import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 60000,
};

// ----------------------------------------------------------------------

export function useGetDashboardSummary(from, to) {
  const url = from && to
    ? [endpoints.dashboard.summary, { params: { from, to } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      summary: data?.data ?? null,
      summaryLoading: isLoading,
      summaryError: error,
      summaryValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetServerStatus(recentMinutes = 30) {
  const url = [endpoints.dashboard.serverStatus, { params: { recentMinutes } }];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      servers: data?.data ?? [],
      serversLoading: isLoading,
      serversError: error,
      serversValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLogVolume(from, to) {
  const url = from && to
    ? [endpoints.dashboard.logVolume, { params: { from, to } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      logVolume: data?.data?.points ?? [],
      logVolumeLoading: isLoading,
      logVolumeError: error,
      logVolumeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLogLevelDist(from, to) {
  const url = from && to
    ? [endpoints.dashboard.logLevelDist, { params: { from, to } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      logLevelDist: data?.data?.distribution ?? [],
      logLevelDistLoading: isLoading,
      logLevelDistError: error,
      logLevelDistValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetErrorTrend(from, to) {
  const url = from && to
    ? [endpoints.dashboard.errorTrend, { params: { from, to } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      errorTrend: data?.data?.points ?? [],
      errorTrendLoading: isLoading,
      errorTrendError: error,
      errorTrendValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetApiRanking(from, to) {
  const url = from && to
    ? [endpoints.dashboard.apiRanking, { params: { from, to, limit: 10 } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      apiRanking: data?.data?.rankings ?? [],
      apiRankingLoading: isLoading,
      apiRankingError: error,
      apiRankingValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetRecentErrors(from, to) {
  const url = from && to
    ? [endpoints.dashboard.recentErrors, { params: { from, to, limit: 50 } }]
    : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      recentErrors: data?.data?.groups ?? [],
      recentErrorsLoading: isLoading,
      recentErrorsError: error,
      recentErrorsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
