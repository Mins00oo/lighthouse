package com.app.lighthouse.domain.alert.dto;

import java.util.Map;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AlertResult {

    private final boolean triggered;
    private final AlertLevel level;
    private final String ruleType;
    private final String cooldownKey;
    private final String slackMessage;
    private final Map<String, Object> details;
}
