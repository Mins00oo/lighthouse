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
import com.app.lighthouse.domain.alert.repository.AlertLogRepository;
import com.app.lighthouse.domain.alert.repository.row.ResponseTimeStats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResponseTimeAlertRule implements AlertRule {

    private static final String RULE_TYPE = "RESPONSE_TIME";
    private static final DateTimeFormatter KST_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AlertLogRepository alertLogRepository;
    private final AlertProperties alertProperties;

    @Override
    public String ruleType() {
        return RULE_TYPE;
    }

    @Override
    public List<AlertResult> evaluate() {
        if (!alertProperties.getRules().getResponseTime().isEnabled()) {
            return Collections.emptyList();
        }

        var config = alertProperties.getRules().getResponseTime();

        ResponseTimeStats stats = alertLogRepository.getRecentResponseTimeStats(10);
        if (stats.total() < config.getMinRequestCount()) {
            log.debug("Response time check skipped: insufficient requests ({} < {})",
                    stats.total(), config.getMinRequestCount());
            return List.of(notTriggered());
        }

        boolean triggered = stats.p95() > config.getP95ThresholdMs();

        if (!triggered) {
            return List.of(notTriggered());
        }

        String now = LocalDateTime.now().format(KST_FORMAT);

        String message = String.format(
                "\u26A0\uFE0F [WARNING] 응답 시간 급증 감지\n" +
                "P95 응답 시간: %,.0fms (임계치: %,dms)\n" +
                "P99 응답 시간: %,.0fms\n" +
                "평균 응답 시간: %,.0fms\n" +
                "요청 수: %,d건 (최근 10분)\n" +
                "감지 시각: %s KST",
                stats.p95(), config.getP95ThresholdMs(),
                stats.p99(),
                stats.avg(),
                stats.total(),
                now
        );

        return List.of(AlertResult.builder()
                .triggered(true)
                .level(AlertLevel.WARNING)
                .ruleType(RULE_TYPE)
                .cooldownKey(RULE_TYPE + ":ALL")
                .slackMessage(message)
                .details(Map.of(
                        "p95", stats.p95(),
                        "p99", stats.p99(),
                        "avg", stats.avg(),
                        "total", stats.total(),
                        "thresholdMs", config.getP95ThresholdMs()
                ))
                .build());
    }

    private AlertResult notTriggered() {
        return AlertResult.builder()
                .triggered(false)
                .ruleType(RULE_TYPE)
                .cooldownKey(RULE_TYPE + ":ALL")
                .build();
    }
}
