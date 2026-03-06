package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ApiDetailRow(
        LocalDateTime time,
        long requestCount,
        double avgResponseTimeMs,
        double p95ResponseTimeMs,
        long errorCount
) {
}
