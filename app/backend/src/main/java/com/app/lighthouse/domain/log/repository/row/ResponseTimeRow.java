package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ResponseTimeRow(
        LocalDateTime time,
        double p95Ms,
        double p99Ms
) {
}
