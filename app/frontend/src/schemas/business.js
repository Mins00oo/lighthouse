import { z } from 'zod';

// ----------------------------------------------------------------------
// Business Metrics API 응답 스키마
// ----------------------------------------------------------------------

export const businessSummarySchema = z.object({
  collectedAt: z.string().nullable().optional(),
  service: z.string().nullable().default(''),
  dau: z.number().nullable().default(0),
  wau: z.number().nullable().default(0),
  mau: z.number().nullable().default(0),
  totalUsers: z.number().nullable().default(0),
  newUsersToday: z.number().nullable().default(0),
  totalRecipes: z.number().nullable().default(0),
  totalIngredients: z.number().nullable().default(0),
  totalCoachingToday: z.number().nullable().default(0),
  totalCoachingCompleted: z.number().nullable().default(0),
  totalShortsToday: z.number().nullable().default(0),
  shortsSuccessRate: z.number().nullable().default(0),
  shortsAvgConversionTimeMs: z.number().nullable().default(0),
  shortsCacheHitRate: z.number().nullable().default(0),
  shortsTotalCacheEntries: z.number().nullable().default(0),
});

export const userActivitySchema = z.array(
  z.object({
    collectedAt: z.string().nullable().optional(),
    dau: z.number().default(0),
    wau: z.number().default(0),
    mau: z.number().default(0),
    totalUsers: z.number().default(0),
    newUsersToday: z.number().default(0),
  })
);

export const shortsStatsSchema = z.array(
  z.object({
    collectedAt: z.string().nullable().optional(),
    successRate: z.number().default(0),
    avgConversionTimeMs: z.number().default(0),
    cacheHitRate: z.number().default(0),
    totalCacheEntries: z.number().default(0),
  })
);
