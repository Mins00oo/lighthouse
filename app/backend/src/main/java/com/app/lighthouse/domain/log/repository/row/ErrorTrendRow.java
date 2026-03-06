package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ErrorTrendRow(
        LocalDateTime time,
        long errorCount,
        long fatalCount
) {
}
