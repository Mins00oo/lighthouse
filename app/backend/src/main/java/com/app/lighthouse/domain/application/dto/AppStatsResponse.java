package com.app.lighthouse.domain.application.dto;

import com.app.lighthouse.domain.log.repository.row.AppStatsRow;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AppStatsResponse {

    private final long totalCount;
    private final long errorCount;
    private final long warnCount;
    private final long requestCount;
    private final double avgResponseMs;
    private final double p95ResponseMs;

    public static AppStatsResponse from(AppStatsRow row) {
        return AppStatsResponse.builder()
                .totalCount(row.totalCount())
                .errorCount(row.errorCount())
                .warnCount(row.warnCount())
                .requestCount(row.requestCount())
                .avgResponseMs(row.avgResponseMs())
                .p95ResponseMs(row.p95ResponseMs())
                .build();
    }
}
