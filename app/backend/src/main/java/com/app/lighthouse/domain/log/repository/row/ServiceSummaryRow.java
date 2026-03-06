package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ServiceSummaryRow(
        String service,
        long logCount,
        long errorCount,
        LocalDateTime lastLogTime
) {}
