package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiDetailDto {

    private final String httpMethod;
    private final String httpPath;
    private final String interval;
    private final List<TimeSlot> timeline;

    @Getter
    @Builder
    public static class TimeSlot {
        private final LocalDateTime time;
        private final long requestCount;
        private final double avgResponseTimeMs;
        private final double p95ResponseTimeMs;
        private final long errorCount;
    }
}
