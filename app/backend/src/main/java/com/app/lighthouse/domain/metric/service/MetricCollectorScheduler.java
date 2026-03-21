package com.app.lighthouse.domain.metric.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.app.lighthouse.domain.metric.repository.MetricRepository;
import com.app.lighthouse.domain.metric.repository.row.SystemMetricRow;
import com.app.lighthouse.global.config.TargetProperties;
import com.app.lighthouse.global.util.PrometheusTextParser;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MetricCollectorScheduler {

    private final RestClient targetRestClient;
    private final TargetProperties targetProperties;
    private final MetricRepository metricRepository;

    @Scheduled(fixedDelayString = "${lighthouse.metric.collect-interval-ms:60000}", initialDelay = 15000)
    public void collectMetrics() {
        if (targetProperties.getTargets() == null || targetProperties.getTargets().isEmpty()) {
            return;
        }

        for (TargetProperties.Target target : targetProperties.getTargets()) {
            try {
                doCollect(target);
            } catch (Exception e) {
                log.debug("Metric collection skipped for {} (target unreachable): {}", target.getName(), e.getMessage());
            }
        }
    }

    private void doCollect(TargetProperties.Target target) {
        String text = targetRestClient.get()
                .uri(target.getPrometheusPath())
                .accept(org.springframework.http.MediaType.parseMediaType("text/plain;version=0.0.4"))
                .retrieve()
                .body(String.class);

        Map<String, Double> metrics = PrometheusTextParser.parse(text);

        SystemMetricRow row = new SystemMetricRow(
                LocalDateTime.now(),
                target.getName(),
                getOrDefault(metrics, "process_cpu_usage", 0) * 100,
                toLong(metrics, "process_resident_memory_bytes"),
                toLong(metrics, "jvm_memory_max_bytes"),
                toLong(metrics, "jvm_memory_used_bytes_area_heap"),
                toLong(metrics, "jvm_memory_max_bytes_area_heap"),
                toLong(metrics, "jvm_memory_used_bytes_area_nonheap"),
                toInt(metrics, "jvm_threads_live_threads"),
                getOrDefault(metrics, "jvm_gc_pause_seconds_sum", 0) * 1000,
                toInt(metrics, "hikaricp_connections_active"),
                toInt(metrics, "hikaricp_connections_idle"),
                toInt(metrics, "hikaricp_connections_pending"),
                toLong(metrics, "http_server_requests_seconds_count"),
                toInt(metrics, "tomcat_threads_busy_threads"),
                toInt(metrics, "tomcat_threads_config_max_threads")
        );

        metricRepository.insert(row);
        log.debug("Metrics collected for {}: cpu={}%, heap={}MB",
                target.getName(),
                String.format("%.1f", row.cpuUsagePercent()),
                row.jvmHeapUsed() / (1024 * 1024));
    }

    private double getOrDefault(Map<String, Double> m, String key, double def) {
        return m.getOrDefault(key, def);
    }

    private long toLong(Map<String, Double> m, String key) {
        return m.getOrDefault(key, 0.0).longValue();
    }

    private int toInt(Map<String, Double> m, String key) {
        return m.getOrDefault(key, 0.0).intValue();
    }
}
