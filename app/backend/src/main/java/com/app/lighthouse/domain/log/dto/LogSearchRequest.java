package com.app.lighthouse.domain.log.dto;

import java.time.LocalDateTime;

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
    private LocalDateTime from;
    private LocalDateTime to;

    @Min(0)
    private int page = 0;

    @Min(1)
    @Max(500)
    private int size = 50;
}
