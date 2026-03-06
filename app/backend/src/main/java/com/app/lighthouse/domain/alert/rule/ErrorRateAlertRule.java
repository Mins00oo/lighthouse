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
import com.app.lighthouse.domain.alert.repository.row.ErrorRateStats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ErrorRateAlertRule implements AlertRule {

    private static final String RULE_TYPE = "ERROR_RATE";
    private static final DateTimeFormatter KST_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AlertLogRepository alertLogRepository;
    private final AlertProperties alertProperties;

    @Override
    public String ruleType() {
        return RULE_TYPE;
    }

    @Override
    public List<AlertResult> evaluate() {
        if (!alertProperties.getRules().getErrorRate().isEnabled()) {
            return Collections.emptyList();
        }

        var config = alertProperties.getRules().getErrorRate();

        ErrorRateStats recent = alertLogRepository.getRecentErrorRate(10);
        if (recent.total() < config.getMinRequestCount()) {
            log.debug("Error rate check skipped: insufficient requests ({} < {})",
                    recent.total(), config.getMinRequestCount());
            return List.of(notTriggered());
        }

        ErrorRateStats baseline = alertLogRepository.getBaselineErrorRate(10, 70);

        log.info("ErrorRate evaluate - recent: total={}, errors={}, errorRate={} / baseline: total={}, errors={}, errorRate={}",
                recent.total(), recent.errors(), recent.errorRate(),
                baseline.total(), baseline.errors(), baseline.errorRate());

        boolean triggered;
        double multiplier = 0;
        boolean baselineEmpty = baseline.total() == 0 || baseline.errorRate() == 0
                || Double.isNaN(baseline.errorRate()) || Double.isInfinite(baseline.errorRate());

        if (baselineEmpty) {
            // 비교 대상(직전 1시간)이 없거나 에러율 0% → 절대값 폴백
            triggered = recent.errorRate() > config.getFallbackAbsoluteRate();
            multiplier = Double.POSITIVE_INFINITY;
            log.debug("Baseline empty (total={}, errorRate={}), fallback to absolute rate check: recent={}",
                    baseline.total(), baseline.errorRate(), recent.errorRate());
        } else {
            multiplier = recent.errorRate() / baseline.errorRate();
            triggered = multiplier >= config.getThresholdMultiplier();
        }

        if (!triggered) {
            return List.of(notTriggered());
        }

        String now = LocalDateTime.now().format(KST_FORMAT);
        String recentPct = String.format("%.1f%%", recent.errorRate() * 100);
        String baselinePct = baselineEmpty ? "데이터 없음" : String.format("%.1f%%", baseline.errorRate() * 100);
        String multiplierStr = baselineEmpty ? "N/A (절대값 폴백)" : String.format("%.1f배", multiplier);

        String message = String.format(
                "\uD83D\uDEA8 [CRITICAL] 에러율 급증 감지\n" +
                "현재 에러율: %s (최근 10분, 요청 %d건 중 에러 %d건)\n" +
                "평소 에러율: %s (직전 1시간 평균)\n" +
                "배율: %s\n" +
                "감지 시각: %s KST",
                recentPct, recent.total(), recent.errors(),
                baselinePct,
                multiplierStr,
                now
        );

        return List.of(AlertResult.builder()
                .triggered(true)
                .level(AlertLevel.CRITICAL)
                .ruleType(RULE_TYPE)
                .cooldownKey(RULE_TYPE + ":ALL")
                .slackMessage(message)
                .details(Map.of(
                        "recentErrorRate", recent.errorRate(),
                        "baselineErrorRate", baseline.errorRate(),
                        "recentTotal", recent.total(),
                        "recentErrors", recent.errors(),
                        "multiplier", multiplier
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
