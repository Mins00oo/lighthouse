package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogVolumeDto {

    private final String interval;
    private final List<TimeSlot> points;

    @Getter
    @Builder
    public static class TimeSlot {
        private final LocalDateTime time;
        private final long totalCount;
        private final long errorCount;
        private final long warnCount;
        private final long infoCount;
    }
}
