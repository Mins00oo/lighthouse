package com.app.lighthouse.domain.log.repository.row;

public record ApiRankingRow(
        String httpMethod,
        String httpPath,
        long requestCount,
        double avgResponseTimeMs,
        double p95ResponseTimeMs,
        long errorCount
) {
}
