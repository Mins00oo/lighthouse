package com.app.lighthouse.domain.log.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LogEntryDto {

    private final LocalDateTime ingestTime;
    private final String host;
    private final String service;
    private final String env;
    private final String level;
    private final String logger;
    private final String thread;
    private final String message;
    private final String httpMethod;
    private final String httpPath;
    private final Integer httpStatus;
    private final Integer responseTimeMs;
    private final String exceptionClass;
    private final String stackTrace;
    private final String rawEvent;
}
