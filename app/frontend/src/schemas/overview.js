import { z } from 'zod';

// ----------------------------------------------------------------------
// Overview Dashboard API 응답 스키마
// 인터셉터에서 ApiResponse envelope이 벗겨진 후의 data 구조
// ----------------------------------------------------------------------

// --- Summary ---

export const overviewSummarySchema = z.object({
  totalRequests: z.number(),
  errorCount: z.number(),
  avgResponseTimeMs: z.number(),
});

// --- Request Volume ---

export const requestVolumeSchema = z.array(
  z.object({
    time: z.string(),
    requestCount: z.number(),
  })
);

// --- Response Time ---

export const responseTimeSchema = z.array(
  z.object({
    time: z.string(),
    p95Ms: z.number(),
    p99Ms: z.number(),
  })
);

// --- Slow APIs ---

export const slowApisSchema = z.array(
  z.object({
    rank: z.number(),
    httpMethod: z.string(),
    httpPath: z.string(),
    p95Ms: z.number(),
    avgMs: z.number(),
    requestCount: z.number(),
  })
);

// --- Error Logs ---

export const errorLogsSchema = z.array(
  z.object({
    id: z.string(),
    timestamp: z.string(),
    httpMethod: z.string(),
    httpPath: z.string(),
    httpStatus: z.number(),
    serviceName: z.string(),
    message: z.string().nullable().default(''),
    exceptionClass: z.string().nullable().optional(),
    stackTrace: z.string().nullable().optional(),
    traceId: z.string().nullable().optional(),
  })
);
