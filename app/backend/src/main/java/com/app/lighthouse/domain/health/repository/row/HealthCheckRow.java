package com.app.lighthouse.domain.health.repository.row;

import java.time.LocalDateTime;

public record HealthCheckRow(
        LocalDateTime timestamp,
        String service,
        String status,
        long responseTimeMs,
        String dbStatus,
        int dbPoolActive,
        int dbPoolIdle,
        int dbPoolTotal,
        long diskFreeBytes,
        long diskTotalBytes,
        String appVersion,
        long jvmUptimeSeconds
) {}
