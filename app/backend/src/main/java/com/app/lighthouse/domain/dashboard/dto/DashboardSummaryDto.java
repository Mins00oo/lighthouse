package com.app.lighthouse.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardSummaryDto {

    private final long totalLogCount;
    private final long errorCount;
    private final long fatalCount;
    private final long warnCount;
    private final double errorRate;
    private final int activeServerCount;
    private final int totalServiceCount;
    private final long totalRequestCount;
    private final double avgResponseTimeMs;
    private final double p95ResponseTimeMs;
    private final String periodDescription;
}
