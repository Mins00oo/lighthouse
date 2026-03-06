package com.app.lighthouse.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SlowApiDto {

    private final int rank;
    private final String httpMethod;
    private final String httpPath;
    private final double p95Ms;
    private final double avgMs;
    private final long requestCount;
}
