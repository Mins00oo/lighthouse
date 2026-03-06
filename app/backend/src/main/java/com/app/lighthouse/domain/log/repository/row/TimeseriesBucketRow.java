package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record TimeseriesBucketRow(
        LocalDateTime time,
        long requestCount,
        double p95ResponseTime,
        double p99ResponseTime
) {
}
