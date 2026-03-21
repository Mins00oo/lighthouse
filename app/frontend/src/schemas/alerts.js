import { z } from 'zod';

// ----------------------------------------------------------------------
// Alerts API 응답 스키마
// ----------------------------------------------------------------------

export const alertHistoryPageSchema = z.object({
  alerts: z.array(
    z.object({
      timestamp: z.string(),
      service: z.string().nullable().default(''),
      ruleType: z.string(),
      level: z.string(),
      triggered: z.boolean(),
      message: z.string().nullable().default(''),
    })
  ),
  totalCount: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean(),
});
