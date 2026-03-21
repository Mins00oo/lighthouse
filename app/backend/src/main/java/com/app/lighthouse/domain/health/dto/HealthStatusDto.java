package com.app.lighthouse.domain.health.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HealthStatusDto {
    private final String service;
    private final String status;
    private final long responseTimeMs;
    private final String dbStatus;
    private final int dbPoolActive;
    private final int dbPoolIdle;
    private final int dbPoolTotal;
    private final long diskFreeBytes;
    private final long diskTotalBytes;
    private final String appVersion;
    private final long jvmUptimeSeconds;
    private final LocalDateTime checkedAt;
}
