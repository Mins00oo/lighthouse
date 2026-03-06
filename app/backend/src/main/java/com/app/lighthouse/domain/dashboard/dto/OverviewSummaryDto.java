package com.app.lighthouse.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OverviewSummaryDto {

    private final long totalRequests;
    private final long errorCount;
    private final double avgResponseTimeMs;
}
