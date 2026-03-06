package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorTrendDto {

    private final String interval;
    private final List<ErrorPoint> points;

    @Getter
    @Builder
    public static class ErrorPoint {
        private final LocalDateTime time;
        private final long errorCount;
        private final long fatalCount;
    }
}
