package com.app.lighthouse.domain.metric.repository.row;

import java.time.LocalDateTime;

public record SystemMetricRow(
        LocalDateTime timestamp,
        String service,
        double cpuUsagePercent,
        long memoryUsedBytes,
        long memoryMaxBytes,
        long jvmHeapUsed,
        long jvmHeapMax,
        long jvmNonheapUsed,
        int jvmThreadsLive,
        double jvmGcPauseMs,
        int hikariActive,
        int hikariIdle,
        int hikariPending,
        long httpServerRequests,
        int tomcatThreadsBusy,
        int tomcatThreadsMax
) {}
