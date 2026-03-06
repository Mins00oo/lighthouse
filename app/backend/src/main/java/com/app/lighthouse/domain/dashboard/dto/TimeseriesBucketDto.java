package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimeseriesBucketDto {

    private final LocalDateTime time;
    private final long requestCount;
    private final double p95ResponseTime;
    private final double p99ResponseTime;
}
