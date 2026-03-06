package com.app.lighthouse.domain.alert.repository.row;

public record ErrorRateStats(
        long total,
        long errors,
        double errorRate
) {
}
