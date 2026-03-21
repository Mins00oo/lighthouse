package com.app.lighthouse.domain.health.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UptimeDto {
    private final String service;
    private final double uptimePercent;
    private final int days;
    private final long totalChecks;
}
