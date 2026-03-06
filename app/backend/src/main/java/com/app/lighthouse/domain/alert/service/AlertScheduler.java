package com.app.lighthouse.domain.alert.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.app.lighthouse.domain.alert.config.AlertProperties;
import com.app.lighthouse.domain.alert.dto.AlertLevel;
import com.app.lighthouse.domain.alert.dto.AlertResult;
import com.app.lighthouse.domain.alert.rule.AlertRule;
import com.app.lighthouse.infra.websocket.DashboardNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlertScheduler {

    private static final DateTimeFormatter KST_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final List<AlertRule> alertRules;
    private final AlertProperties alertProperties;
    private final CooldownManager cooldownManager;
    private final SlackNotifier slackNotifier;
    private final DashboardNotificationService dashboardNotificationService;

    @Scheduled(fixedDelayString = "${lighthouse.alert.check-interval-ms:600000}", initialDelay = 0)
    public void checkAlerts() {
        if (!alertProperties.isEnabled()) {
            return;
        }

        log.debug("Alert check started");

        for (AlertRule rule : alertRules) {
            try {
                List<AlertResult> results = rule.evaluate();
                for (AlertResult result : results) {
                    if (result.isTriggered()) {
                        handleTriggered(result);
                    } else {
                        handleResolved(result);
                    }
                }
            } catch (Exception e) {
                log.error("Alert rule '{}' evaluation failed: {}", rule.ruleType(), e.getMessage(), e);
            }
        }

        log.debug("Alert check completed");
    }

    private void handleTriggered(AlertResult result) {
        String key = result.getCooldownKey();

        if (!cooldownManager.canSend(key, alertProperties.getCooldownMs())) {
            log.debug("Alert '{}' suppressed by cooldown", key);
            return;
        }

        cooldownManager.record(key);
        slackNotifier.send(result.getSlackMessage());
        dashboardNotificationService.notifyAlert(Map.of(
                "level", result.getLevel().name(),
                "ruleType", result.getRuleType(),
                "details", result.getDetails() != null ? result.getDetails() : Map.of()
        ));

        log.info("Alert triggered: {} [{}]", key, result.getLevel());
    }

    private void handleResolved(AlertResult result) {
        String key = result.getCooldownKey();
        if (key == null || !cooldownManager.wasTriggered(key)) {
            return;
        }

        cooldownManager.clearTrigger(key);

        String now = LocalDateTime.now().format(KST_FORMAT);
        String resolvedMessage = String.format(
                "\u2705 [RESOLVED] %s 정상 복귀\n복구 시각: %s KST",
                result.getRuleType(), now
        );

        slackNotifier.send(resolvedMessage);
        dashboardNotificationService.notifyAlert(Map.of(
                "level", AlertLevel.RESOLVED.name(),
                "ruleType", result.getRuleType()
        ));

        log.info("Alert resolved: {}", key);
    }
}
