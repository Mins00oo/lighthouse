package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ServerStatusRow(
        String host,
        String service,
        String env,
        LocalDateTime lastLogTime,
        long logCount,
        long errorCount
) {
}
