package com.app.lighthouse.domain.alert.repository.row;

import java.time.LocalDateTime;

public record AlertHistoryRow(
        LocalDateTime timestamp,
        String service,
        String ruleType,
        String level,
        boolean triggered,
        String message,
        String details
) {}
