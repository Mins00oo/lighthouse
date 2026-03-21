import { z } from 'zod';

// ----------------------------------------------------------------------
// System Metrics API 응답 스키마
// ----------------------------------------------------------------------

export const systemMetricSchema = z.object({
  timestamp: z.string().nullable().optional(),
  service: z.string().nullable().default(''),
  cpuUsagePercent: z.number().default(0),
  memoryUsedBytes: z.number().default(0),
  memoryMaxBytes: z.number().default(0),
  jvmHeapUsed: z.number().default(0),
  jvmHeapMax: z.number().default(0),
  jvmNonheapUsed: z.number().default(0),
  jvmThreadsLive: z.number().default(0),
  jvmGcPauseMs: z.number().default(0),
  hikariActive: z.number().default(0),
  hikariIdle: z.number().default(0),
  hikariPending: z.number().default(0),
  httpServerRequests: z.number().default(0),
});

export const metricTrendSchema = z.array(systemMetricSchema);
