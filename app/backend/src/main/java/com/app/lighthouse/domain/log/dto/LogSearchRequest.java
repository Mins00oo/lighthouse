package com.app.lighthouse.domain.log.dto;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogSearchRequest {

    private String service;
    private String host;
    private String env;
    private String level;
    private String keyword;
    private String status;
    private String method;
    private String path;
    private Integer minResponseTime;
    private Integer maxResponseTime;
    private String sort = "timestamp";
    private String order = "desc";

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime to;

    @Min(0)
    private int page = 0;

    @Min(1)
    @Max(500)
    private int size = 50;
}
