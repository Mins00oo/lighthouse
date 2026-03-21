import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import {
  shortsStatsSchema,
  userActivitySchema,
  businessSummarySchema,
} from 'src/schemas/business';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 300000,
};

/** safeParse + fallback */
function parse(schema, raw, fallback) {
  const result = schema.safeParse(raw);
  if (!result.success) {
    console.error('[business] schema validation failed:', result.error.issues);
    return fallback;
  }
  return result.data;
}

// ----------------------------------------------------------------------

export function useGetBusinessSummary(service = 'picook-backend') {
  const url = [endpoints.business.summary, { params: { service } }];

  const { data, isLoading, error } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      businessSummary: data ? parse(businessSummarySchema, data, null) : null,
      businessSummaryLoading: isLoading,
      businessSummaryError: error,
    }),
    [data, error, isLoading]
  );
}

// ----------------------------------------------------------------------

export function useGetUserActivity(service = 'picook-backend', from, to) {
  const url =
    from && to
      ? [endpoints.business.users, { params: { service, from, to } }]
      : [endpoints.business.users, { params: { service } }];

  const { data, isLoading, error } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      userActivity: data ? parse(userActivitySchema, data, []) : [],
      userActivityLoading: isLoading,
      userActivityError: error,
    }),
    [data, error, isLoading]
  );
}

// ----------------------------------------------------------------------

export function useGetShortsStats(service = 'picook-backend', from, to) {
  const url =
    from && to
      ? [endpoints.business.shorts, { params: { service, from, to } }]
      : [endpoints.business.shorts, { params: { service } }];

  const { data, isLoading, error } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      shortsStats: data ? parse(shortsStatsSchema, data, []) : [],
      shortsStatsLoading: isLoading,
      shortsStatsError: error,
    }),
    [data, error, isLoading]
  );
}
