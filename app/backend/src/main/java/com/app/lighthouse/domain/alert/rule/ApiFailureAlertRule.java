package com.app.lighthouse.domain.alert.rule;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.app.lighthouse.domain.alert.config.AlertProperties;
import com.app.lighthouse.domain.alert.dto.AlertLevel;
import com.app.lighthouse.domain.alert.dto.AlertResult;
import com.app.lighthouse.domain.alert.repository.AlertLogRepository;
import com.app.lighthouse.domain.alert.repository.row.FailedEndpointRow;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiFailureAlertRule implements AlertRule {

    private static final String RULE_TYPE = "API_FAILURE";
    private static final DateTimeFormatter KST_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AlertLogRepository alertLogRepository;
    private final AlertProperties alertProperties;

    @Override
    public String ruleType() {
        return RULE_TYPE;
    }

    @Override
    public List<AlertResult> evaluate() {
        if (!alertProperties.getRules().getApiFailure().isEnabled()) {
            return Collections.emptyList();
        }

        int consecutiveCount = alertProperties.getRules().getApiFailure().getConsecutiveCount();

        List<FailedEndpointRow> endpoints = alertLogRepository.getRecentFailedEndpoints(30);
        if (endpoints.isEmpty()) {
            return Collections.emptyList();
        }

        List<AlertResult> results = new ArrayList<>();

        for (FailedEndpointRow ep : endpoints) {
            List<Integer> statuses = alertLogRepository.getRecentStatusesForEndpoint(
                    ep.httpMethod(), ep.httpPath(), 30, consecutiveCount);

            if (statuses.size() < consecutiveCount) {
                results.add(notTriggered(ep));
                continue;
            }

            boolean allFailed = statuses.stream().allMatch(s -> s >= 500);
            if (!allFailed) {
                results.add(notTriggered(ep));
                continue;
            }

            String now = LocalDateTime.now().format(KST_FORMAT);
            String statusList = statuses.stream()
                    .map(s -> "  - " + s)
                    .reduce((a, b) -> a + "\n" + b)
                    .orElse("");

            String message = String.format(
                    "\uD83D\uDEA8 [CRITICAL] API 연속 실패 감지\n" +
                    "서비스: %s\n" +
                    "엔드포인트: %s %s\n" +
                    "연속 실패: %d건 (전부 5xx)\n" +
                    "최근 상태 코드:\n%s\n" +
                    "감지 시각: %s KST",
                    ep.service(),
                    ep.httpMethod(), ep.httpPath(),
                    consecutiveCount,
                    statusList,
                    now
            );

            results.add(AlertResult.builder()
                    .triggered(true)
                    .level(AlertLevel.CRITICAL)
                    .ruleType(RULE_TYPE)
                    .cooldownKey(RULE_TYPE + ":" + ep.httpMethod() + ":" + ep.httpPath())
                    .slackMessage(message)
                    .details(Map.of(
                            "service", ep.service(),
                            "httpMethod", ep.httpMethod(),
                            "httpPath", ep.httpPath(),
                            "statuses", statuses
                    ))
                    .build());
        }

        return results;
    }

    private AlertResult notTriggered(FailedEndpointRow ep) {
        return AlertResult.builder()
                .triggered(false)
                .ruleType(RULE_TYPE)
                .cooldownKey(RULE_TYPE + ":" + ep.httpMethod() + ":" + ep.httpPath())
                .build();
    }
}
