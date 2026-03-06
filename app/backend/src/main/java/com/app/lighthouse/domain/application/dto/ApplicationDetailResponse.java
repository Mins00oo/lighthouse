package com.app.lighthouse.domain.application.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.app.lighthouse.infra.oracle.ApplicationRecord;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationDetailResponse {

    // 메타데이터
    private final Long appId;
    private final String serviceName;
    private final String displayName;
    private final String description;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    // 실시간 통계
    private final AppStatsResponse stats;

    // 서버 현황 (ClickHouse 동적 조회)
    private final List<ServerInfo> servers;

    @Getter
    @Builder
    public static class ServerInfo {
        private final String host;
        private final String env;
        private final LocalDateTime lastLogTime;
        private final long logCount;
        private final long errorCount;
    }

    public static ApplicationDetailResponse from(ApplicationRecord record,
                                                   AppStatsResponse stats,
                                                   List<ServerInfo> servers) {
        return ApplicationDetailResponse.builder()
                .appId(record.appId())
                .serviceName(record.serviceName())
                .displayName(record.displayName())
                .description(record.description())
                .status(record.status())
                .createdAt(record.createdAt())
                .updatedAt(record.updatedAt())
                .stats(stats)
                .servers(servers)
                .build();
    }
}
