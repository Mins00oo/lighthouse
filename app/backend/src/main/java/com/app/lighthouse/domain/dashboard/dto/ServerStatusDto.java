package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ServerStatusDto {

    private final String host;
    private final String service;
    private final String env;
    private final String status;
    private final LocalDateTime lastLogTime;
    private final long recentLogCount;
    private final long recentErrorCount;
}
