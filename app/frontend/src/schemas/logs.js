import { z } from 'zod';

// ----------------------------------------------------------------------
// Log Search API 응답 스키마
// 인터셉터에서 ApiResponse envelope이 벗겨진 후의 data 구조
// ----------------------------------------------------------------------

export const logEntrySchema = z.object({
  timestamp: z.string(),
  host: z.string().nullable().default(''),
  service: z.string().nullable().default(''),
  env: z.string().nullable().default(''),
  level: z.string().nullable().default(''),
  logger: z.string().nullable().default(''),
  thread: z.string().nullable().default(''),
  message: z.string().nullable().default(''),
  httpMethod: z.string().nullable().optional(),
  httpPath: z.string().nullable().optional(),
  httpStatus: z.number().nullable().optional(),
  responseTimeMs: z.number().nullable().optional(),
  clientIp: z.string().nullable().optional(),
  exceptionClass: z.string().nullable().optional(),
  stackTrace: z.string().nullable().optional(),
  rawEvent: z.string().nullable().optional(),
});

export const logSearchResponseSchema = z.object({
  content: z.array(logEntrySchema),
  totalElements: z.number(),
  page: z.number(),
  size: z.number(),
  totalPages: z.number(),
});
