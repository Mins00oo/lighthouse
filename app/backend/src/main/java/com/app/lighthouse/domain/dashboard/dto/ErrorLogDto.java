package com.app.lighthouse.domain.dashboard.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorLogDto {

    private final String id;
    private final LocalDateTime timestamp;
    private final String httpMethod;
    private final String httpPath;
    private final int httpStatus;
    private final String serviceName;
    private final String message;
    private final String stackTrace;
    private final String traceId;
}
