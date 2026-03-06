package com.app.lighthouse.domain.dashboard.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiRankingDto {

    private final List<ApiEntry> rankings;
    private final String periodDescription;

    @Getter
    @Builder
    public static class ApiEntry {
        private final String httpMethod;
        private final String httpPath;
        private final long requestCount;
        private final double avgResponseTimeMs;
        private final double p95ResponseTimeMs;
        private final long errorCount;
        private final double errorRate;
    }
}
