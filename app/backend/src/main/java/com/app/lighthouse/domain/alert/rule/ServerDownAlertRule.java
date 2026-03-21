package com.app.lighthouse.domain.alert.rule;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.app.lighthouse.domain.alert.config.AlertProperties;
import com.app.lighthouse.domain.alert.dto.AlertLevel;
import com.app.lighthouse.domain.alert.dto.AlertResult;
import com.app.lighthouse.domain.health.repository.HealthCheckRepository;
import com.app.lighthouse.global.config.TargetProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ServerDownAlertRule implements AlertRule {

    private static final String RULE_TYPE = "SERVER_DOWN";
    private static final DateTimeFormatter KST_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final HealthCheckRepository healthCheckRepository;
    private final AlertProperties alertProperties;
    private final TargetProperties targetProperties;

    @Override
    public String ruleType() {
        return RULE_TYPE;
    }

    @Override
    public List<AlertResult> evaluate() {
        if (!alertProperties.getRules().getServerDown().isEnabled()) {
            return Collections.emptyList();
        }
        if (targetProperties.getTargets() == null || targetProperties.getTargets().isEmpty()) {
            return Collections.emptyList();
        }

        var config = alertProperties.getRules().getServerDown();

        for (TargetProperties.Target target : targetProperties.getTargets()) {
            int downCount = healthCheckRepository.countConsecutiveDown(target.getName(), 3);

            if (downCount >= config.getConsecutiveDownCount()) {
                String now = LocalDateTime.now().format(KST_FORMAT);
                String message = String.format(
                        "\uD83D\uDD34 [CRITICAL] 서버 다운 감지\n" +
                        "서비스: %s\n" +
                        "상태: 최근 3분간 연속 %d회 DOWN\n" +
                        "감지 시각: %s KST",
                        target.getName(), downCount, now
                );

                return List.of(AlertResult.builder()
                        .triggered(true)
                        .level(AlertLevel.CRITICAL)
                        .ruleType(RULE_TYPE)
                        .cooldownKey(RULE_TYPE + ":" + target.getName())
                        .slackMessage(message)
                        .details(Map.of(
                                "service", target.getName(),
                                "consecutiveDownCount", downCount
                        ))
                        .build());
            }
        }

        return List.of(notTriggered());
    }

    private AlertResult notTriggered() {
        return AlertResult.builder()
                .triggered(false)
                .ruleType(RULE_TYPE)
                .cooldownKey(RULE_TYPE + ":ALL")
                .build();
    }
}
