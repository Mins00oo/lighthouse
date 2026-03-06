package com.app.lighthouse.domain.dashboard.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogLevelDistributionDto {

    private final String timeRange;
    private final List<LevelCount> distribution;

    @Getter
    @Builder
    public static class LevelCount {
        private final String level;
        private final long count;
        private final double percentage;
    }
}
