package com.app.lighthouse.domain.metric.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SystemMetricDto {
    private final LocalDateTime timestamp;
    private final String service;
    private final double cpuUsagePercent;
    private final long memoryUsedBytes;
    private final long memoryMaxBytes;
    private final long jvmHeapUsed;
    private final long jvmHeapMax;
    private final long jvmNonheapUsed;
    private final int jvmThreadsLive;
    private final double jvmGcPauseMs;
    private final int hikariActive;
    private final int hikariIdle;
    private final int hikariPending;
    private final long httpServerRequests;
}
