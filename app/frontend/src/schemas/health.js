import { z } from 'zod';

// ----------------------------------------------------------------------
// Health Monitor API 응답 스키마
// ----------------------------------------------------------------------

export const healthStatusSchema = z.object({
  service: z.string(),
  status: z.string(),
  responseTimeMs: z.number().default(0),
  dbStatus: z.string().nullable().default(''),
  dbPoolActive: z.number().default(0),
  dbPoolIdle: z.number().default(0),
  dbPoolTotal: z.number().default(0),
  diskFreeBytes: z.number().default(0),
  diskTotalBytes: z.number().default(0),
  appVersion: z.string().nullable().default(''),
  jvmUptimeSeconds: z.number().default(0),
  checkedAt: z.string().nullable().optional(),
});

export const healthHistorySchema = z.array(healthStatusSchema);

export const uptimeSchema = z.object({
  service: z.string(),
  uptimePercent: z.number(),
  days: z.number(),
});
