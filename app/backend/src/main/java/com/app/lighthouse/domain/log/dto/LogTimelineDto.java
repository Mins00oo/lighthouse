package com.app.lighthouse.domain.log.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogTimelineDto {

    private final String interval;
    private final List<TimePoint> points;

    @Getter
    @Builder
    public static class TimePoint {
        private final LocalDateTime time;
        private final long totalCount;
        private final long errorCount;
        private final long warnCount;
        private final long infoCount;
    }
}
