import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import { logSearchResponseSchema } from 'src/schemas/logs';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function parse(schema, raw, fallback) {
  const result = schema.safeParse(raw);
  if (!result.success) {
    console.error('[logs] schema validation failed:', result.error.issues);
    return fallback;
  }
  return result.data;
}

const DEFAULT_RESPONSE = {
  content: [],
  totalElements: 0,
  page: 0,
  size: 50,
  totalPages: 0,
};

// ----------------------------------------------------------------------

export function useSearchLogs(params) {
  const { from, to, level, keyword, page = 0, size = 50 } = params || {};

  const queryParams = { from, to, page, size };
  if (level) queryParams.level = level;
  if (keyword) queryParams.keyword = keyword;

  const url = from && to ? [endpoints.logs.search, { params: queryParams }] : '';

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const parsed = data ? parse(logSearchResponseSchema, data, DEFAULT_RESPONSE) : DEFAULT_RESPONSE;
    const content = parsed.content.map((log, i) => ({
      ...log,
      id: `${parsed.page}-${i}`,
    }));

    return {
      logs: content,
      totalElements: parsed.totalElements,
      page: parsed.page,
      pageSize: parsed.size,
      totalPages: parsed.totalPages,
      logsLoading: isLoading,
      logsError: error,
      logsValidating: isValidating,
      logsMutate: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);
}
