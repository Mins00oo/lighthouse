package com.app.lighthouse.domain.business.repository.row;

import java.time.LocalDateTime;

public record BusinessMetricRow(
        LocalDateTime timestamp,
        String service,
        String metricType,
        String metricData
) {}
