package com.app.lighthouse.domain.log.repository.row;

public record AppStatsRow(
        long totalCount,
        long errorCount,
        long warnCount,
        long requestCount,
        double avgResponseMs,
        double p95ResponseMs
) {}
