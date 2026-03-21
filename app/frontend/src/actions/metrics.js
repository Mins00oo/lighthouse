import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import { metricTrendSchema, systemMetricSchema } from 'src/schemas/metrics';

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
    console.error('[metrics] schema validation failed:', result.error.issues);
    return fallback;
  }
  return result.data;
}

// ----------------------------------------------------------------------

export function useGetSystemMetrics(service = 'picook-backend') {
  const url = [endpoints.metrics.system, { params: { service } }];

  const { data, isLoading, error } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      systemMetrics: data ? parse(systemMetricSchema, data, null) : null,
      systemMetricsLoading: isLoading,
      systemMetricsError: error,
    }),
    [data, error, isLoading]
  );
}

// ----------------------------------------------------------------------

export function useGetMetricTrend(service = 'picook-backend', from, to, intervalMin = 5) {
  const url =
    from && to
      ? [endpoints.metrics.trend, { params: { service, from, to, intervalMin } }]
      : '';

  const { data, isLoading, error } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      metricTrend: data ? parse(metricTrendSchema, data, []) : [],
      metricTrendLoading: isLoading,
      metricTrendError: error,
    }),
    [data, error, isLoading]
  );
}
