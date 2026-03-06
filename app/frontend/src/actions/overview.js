import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import {
  slowApisSchema,
  errorLogsSchema,
  responseTimeSchema,
  requestVolumeSchema,
  overviewSummarySchema,
} from 'src/schemas/overview';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 60000,
};

/** safeParse + fallback */
function parse(schema, raw, fallback) {
  const result = schema.safeParse(raw);
  if (!result.success) {
    console.error('[overview] schema validation failed:', result.error.issues);
    return fallback;
  }
  return result.data;
}

// ----------------------------------------------------------------------

export function useGetOverviewSummary(from, to) {
  const url = from && to ? [endpoints.dashboard.summary, { params: { from, to } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      summary: data ? parse(overviewSummarySchema, data, null) : null,
      summaryLoading: isLoading,
      summaryError: error,
      summaryValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetRequestVolume(from, to, intervalMin) {
  const url =
    from && to
      ? [endpoints.dashboard.requestVolume, { params: { from, to, intervalMin } }]
      : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      requestVolume: data ? parse(requestVolumeSchema, data, []) : [],
      requestVolumeLoading: isLoading,
      requestVolumeError: error,
      requestVolumeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetResponseTime(from, to, intervalMin) {
  const url =
    from && to
      ? [endpoints.dashboard.responseTime, { params: { from, to, intervalMin } }]
      : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      responseTime: data ? parse(responseTimeSchema, data, []) : [],
      responseTimeLoading: isLoading,
      responseTimeError: error,
      responseTimeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetSlowApis(from, to, limit = 10) {
  const url =
    from && to
      ? [endpoints.dashboard.slowApis, { params: { from, to, limit } }]
      : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      slowApis: data ? parse(slowApisSchema, data, []) : [],
      slowApisLoading: isLoading,
      slowApisError: error,
      slowApisValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetErrorLogs(from, to, limit = 20) {
  const url =
    from && to
      ? [endpoints.dashboard.errorLogs, { params: { from, to, limit } }]
      : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      errorLogs: data ? parse(errorLogsSchema, data, []) : [],
      errorLogsLoading: isLoading,
      errorLogsError: error,
      errorLogsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}
