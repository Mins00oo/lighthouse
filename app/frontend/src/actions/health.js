import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import { uptimeSchema, healthStatusSchema, healthHistorySchema } from 'src/schemas/health';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

/** safeParse + fallback */
function parse(schema, raw, fallback) {
  const result = schema.safeParse(raw);
  if (!result.success) {
    console.error('[health] schema validation failed:', result.error.issues);
    return fallback;
  }
  return result.data;
}

// ----------------------------------------------------------------------

export function useGetHealthStatus(service = 'picook-backend') {
  const url = [endpoints.healthMonitor.status, { params: { service } }];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    refreshInterval: 30000,
  });

  return useMemo(
    () => ({
      healthStatus: data ? parse(healthStatusSchema, data, null) : null,
      healthStatusLoading: isLoading,
      healthStatusError: error,
      healthStatusValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetHealthHistory(service = 'picook-backend', from, to) {
  const url =
    from && to
      ? [endpoints.healthMonitor.history, { params: { service, from, to } }]
      : '';

  const { data, isLoading, error } = useSWR(url, fetcher, {
    ...swrOptions,
    refreshInterval: 60000,
  });

  return useMemo(
    () => ({
      healthHistory: data ? parse(healthHistorySchema, data, []) : [],
      healthHistoryLoading: isLoading,
      healthHistoryError: error,
    }),
    [data, error, isLoading]
  );
}

// ----------------------------------------------------------------------

export function useGetUptime(service = 'picook-backend', days = 30) {
  const url = [endpoints.healthMonitor.uptime, { params: { service, days } }];

  const { data, isLoading, error } = useSWR(url, fetcher, {
    ...swrOptions,
    refreshInterval: 60000,
  });

  return useMemo(
    () => ({
      uptime: data ? parse(uptimeSchema, data, null) : null,
      uptimeLoading: isLoading,
      uptimeError: error,
    }),
    [data, error, isLoading]
  );
}
