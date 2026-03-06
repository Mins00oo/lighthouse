package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecentErrorDto {

    private final List<ErrorGroup> groups;
    private final List<ErrorEntry> recentErrors;

    @Getter
    @Builder
    public static class ErrorGroup {
        private final String exceptionClass;
        private final String message;
        private final long count;
        private final LocalDateTime lastOccurrence;
    }

    @Getter
    @Builder
    public static class ErrorEntry {
        private final LocalDateTime ingestTime;
        private final String host;
        private final String service;
        private final String level;
        private final String logger;
        private final String message;
        private final String exceptionClass;
        private final String stackTrace;
        private final String httpMethod;
        private final String httpPath;
    }
}
