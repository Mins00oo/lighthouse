package com.app.lighthouse.domain.log.repository.row;

import java.time.LocalDateTime;

public record RequestVolumeRow(
        LocalDateTime time,
        long requestCount
) {
}
