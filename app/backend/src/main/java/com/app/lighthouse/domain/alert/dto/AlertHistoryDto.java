package com.app.lighthouse.domain.alert.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AlertHistoryDto {
    private final LocalDateTime timestamp;
    private final String service;
    private final String ruleType;
    private final String level;
    private final boolean triggered;
    private final String message;
}
