package com.app.lighthouse.domain.business.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BusinessSummaryDto {
    private final LocalDateTime collectedAt;
    private final String service;
    // User stats
    private final Long dau;
    private final Long wau;
    private final Long mau;
    private final Long totalUsers;
    private final Long newUsersToday;
    // Dashboard
    private final Long totalRecipes;
    private final Long totalIngredients;
    private final Long totalCoachingToday;
    private final Long totalCoachingCompleted;
    private final Long totalShortsToday;
    // Shorts
    private final Double shortsSuccessRate;
    private final Long shortsAvgConversionTimeMs;
    private final Double shortsCacheHitRate;
    private final Long shortsTotalCacheEntries;
}
