import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import { alertHistoryPageSchema } from 'src/schemas/alerts';

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
    console.error('[alerts] schema validation failed:', result.error.issues);
    return fallback;
  }
  return result.data;
}

// ----------------------------------------------------------------------

const emptyPage = { alerts: [], totalCount: 0, page: 0, size: 50, hasNext: false };

export function useGetAlertHistory(from, to, ruleType, level, page = 0, size = 50) {
  const params = { page, size };
  if (from) params.from = from;
  if (to) params.to = to;
  if (ruleType) params.ruleType = ruleType;
  if (level) params.level = level;

  const url = [endpoints.alerts.history, { params }];

  const { data, isLoading, error } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      alertHistory: data ? parse(alertHistoryPageSchema, data, emptyPage) : emptyPage,
      alertHistoryLoading: isLoading,
      alertHistoryError: error,
    }),
    [data, error, isLoading]
  );
}
