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
import com.app.lighthouse.domain.metric.repository.MetricRepository;
import com.app.lighthouse.domain.metric.repository.row.SystemMetricRow;
import com.app.lighthouse.global.config.TargetProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResourceThresholdAlertRule implements AlertRule {

    private static final String RULE_TYPE = "RESOURCE_THRESHOLD";
    private static final DateTimeFormatter KST_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final MetricRepository metricRepository;
    private final AlertProperties alertProperties;
    private final TargetProperties targetProperties;

    @Override
    public String ruleType() {
        return RULE_TYPE;
    }

    @Override
    public List<AlertResult> evaluate() {
        if (!alertProperties.getRules().getResourceThreshold().isEnabled()) {
            return Collections.emptyList();
        }
        if (targetProperties.getTargets() == null || targetProperties.getTargets().isEmpty()) {
            return Collections.emptyList();
        }

        var config = alertProperties.getRules().getResourceThreshold();
        List<AlertResult> results = new ArrayList<>();

        for (TargetProperties.Target target : targetProperties.getTargets()) {
            SystemMetricRow avg = metricRepository.getRecentAvg(target.getName(), 5);
            if (avg == null) continue;

            String now = LocalDateTime.now().format(KST_FORMAT);

            // CPU check
            if (avg.cpuUsagePercent() > config.getCpuCritical()) {
                results.add(buildAlert(target.getName(), "CPU",
                        AlertLevel.CRITICAL,
                        String.format("CPU %.1f%% (임계값 %.0f%%)", avg.cpuUsagePercent(), config.getCpuCritical()),
                        now, Map.of("cpu", avg.cpuUsagePercent())));
            } else if (avg.cpuUsagePercent() > config.getCpuWarning()) {
                results.add(buildAlert(target.getName(), "CPU",
                        AlertLevel.WARNING,
                        String.format("CPU %.1f%% (임계값 %.0f%%)", avg.cpuUsagePercent(), config.getCpuWarning()),
                        now, Map.of("cpu", avg.cpuUsagePercent())));
            }

            // Memory check (JVM heap)
            if (avg.jvmHeapMax() > 0) {
                double memPercent = (double) avg.jvmHeapUsed() / avg.jvmHeapMax() * 100;
                if (memPercent > config.getMemoryCritical()) {
                    results.add(buildAlert(target.getName(), "MEMORY",
                            AlertLevel.CRITICAL,
                            String.format("JVM Heap %.1f%% (%dMB/%dMB)",
                                    memPercent, avg.jvmHeapUsed() / (1024*1024), avg.jvmHeapMax() / (1024*1024)),
                            now, Map.of("memoryPercent", memPercent)));
                } else if (memPercent > config.getMemoryWarning()) {
                    results.add(buildAlert(target.getName(), "MEMORY",
                            AlertLevel.WARNING,
                            String.format("JVM Heap %.1f%% (%dMB/%dMB)",
                                    memPercent, avg.jvmHeapUsed() / (1024*1024), avg.jvmHeapMax() / (1024*1024)),
                            now, Map.of("memoryPercent", memPercent)));
                }
            }

            // HikariCP check
            int totalPool = avg.hikariActive() + avg.hikariIdle();
            if (totalPool > 0) {
                double poolPercent = (double) avg.hikariActive() / totalPool * 100;
                if (poolPercent > config.getHikariWarning()) {
                    results.add(buildAlert(target.getName(), "HIKARI",
                            AlertLevel.WARNING,
                            String.format("HikariCP %.1f%% (active %d / total %d)",
                                    poolPercent, avg.hikariActive(), totalPool),
                            now, Map.of("hikariPercent", poolPercent)));
                }
            }
        }

        if (results.isEmpty()) {
            return List.of(AlertResult.builder()
                    .triggered(false)
                    .ruleType(RULE_TYPE)
                    .cooldownKey(RULE_TYPE + ":ALL")
                    .build());
        }

        return results;
    }

    private AlertResult buildAlert(String service, String metric, AlertLevel level,
                                     String detail, String time, Map<String, Object> details) {
        String emoji = level == AlertLevel.CRITICAL ? "\uD83D\uDD34" : "\u26A0\uFE0F";
        String message = String.format(
                "%s [%s] 리소스 임계치 초과\n서비스: %s\n%s\n감지 시각: %s KST",
                emoji, level.name(), service, detail, time
        );

        return AlertResult.builder()
                .triggered(true)
                .level(level)
                .ruleType(RULE_TYPE)
                .cooldownKey(RULE_TYPE + ":" + metric + ":" + service)
                .slackMessage(message)
                .details(details)
                .build();
    }
}
