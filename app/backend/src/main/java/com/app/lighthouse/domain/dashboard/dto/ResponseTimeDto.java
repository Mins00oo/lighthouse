package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResponseTimeDto {

    private final LocalDateTime time;
    private final double p95Ms;
    private final double p99Ms;
}
