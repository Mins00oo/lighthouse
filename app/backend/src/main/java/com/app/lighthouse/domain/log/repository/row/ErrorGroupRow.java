package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ErrorGroupRow(
        String exceptionClass,
        String message,
        long count,
        LocalDateTime lastOccurrence
) {
}
