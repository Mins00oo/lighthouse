package com.app.lighthouse.domain.application.dto;

import java.time.LocalDateTime;

import com.app.lighthouse.infra.oracle.ApplicationRecord;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationResponse {

    private final Long appId;
    private final String serviceName;
    private final String displayName;
    private final String description;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static ApplicationResponse from(ApplicationRecord record) {
        return ApplicationResponse.builder()
                .appId(record.appId())
                .serviceName(record.serviceName())
                .displayName(record.displayName())
                .description(record.description())
                .status(record.status())
                .createdAt(record.createdAt())
                .updatedAt(record.updatedAt())
                .build();
    }
}
