package com.app.lighthouse.domain.application.dto;

import java.time.LocalDateTime;

import com.app.lighthouse.infra.oracle.ApplicationRecord;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationListResponse {

    private final Long appId;
    private final String serviceName;
    private final String displayName;
    private final String description;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    // ClickHouse 실시간 요약 통계
    private final long logCount;
    private final long errorCount;
    private final LocalDateTime lastLogTime;

    public static ApplicationListResponse from(ApplicationRecord record,
                                                long logCount,
                                                long errorCount,
                                                LocalDateTime lastLogTime) {
        return ApplicationListResponse.builder()
                .appId(record.appId())
                .serviceName(record.serviceName())
                .displayName(record.displayName())
                .description(record.description())
                .status(record.status())
                .createdAt(record.createdAt())
                .updatedAt(record.updatedAt())
                .logCount(logCount)
                .errorCount(errorCount)
                .lastLogTime(lastLogTime)
                .build();
    }
}
