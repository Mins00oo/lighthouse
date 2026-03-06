package com.app.lighthouse.domain.alert.repository.row;

public record ResponseTimeStats(
        long total,
        double p95,
        double p99,
        double avg
) {
}
