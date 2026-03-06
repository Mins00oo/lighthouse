package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record TimelineRow(
        LocalDateTime time,
        long total,
        long error,
        long warn,
        long info
) {
}
