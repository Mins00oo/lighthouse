package com.app.lighthouse.domain.business.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ShortsStatsDto {
    private final LocalDateTime collectedAt;
    private final double successRate;
    private final long avgConversionTimeMs;
    private final double cacheHitRate;
    private final long totalCacheEntries;
}
