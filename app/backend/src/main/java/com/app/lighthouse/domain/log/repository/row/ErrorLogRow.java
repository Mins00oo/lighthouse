package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record ErrorLogRow(
        LocalDateTime timestamp,
        String httpMethod,
        String httpPath,
        int httpStatus,
        String service,
        String message
) {
}
