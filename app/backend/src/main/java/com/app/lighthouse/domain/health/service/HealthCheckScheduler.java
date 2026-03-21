package com.app.lighthouse.domain.health.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.app.lighthouse.domain.health.repository.HealthCheckRepository;
import com.app.lighthouse.domain.health.repository.row.HealthCheckRow;
import com.app.lighthouse.global.config.TargetProperties;
import com.app.lighthouse.infra.websocket.DashboardNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckScheduler {

    private final RestClient targetRestClient;
    private final TargetProperties targetProperties;
    private final HealthCheckRepository healthCheckRepository;
    private final DashboardNotificationService dashboardNotificationService;

    @Scheduled(fixedDelayString = "${lighthouse.health.check-interval-ms:60000}", initialDelay = 10000)
    public void checkHealth() {
        if (targetProperties.getTargets() == null || targetProperties.getTargets().isEmpty()) {
            return;
        }

        for (TargetProperties.Target target : targetProperties.getTargets()) {
            try {
                doCheck(target);
            } catch (Exception e) {
                log.debug("Health check: {} is unreachable ({})", target.getName(), e.getMessage());
                insertDown(target);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void doCheck(TargetProperties.Target target) {
        long start = System.nanoTime();

        Map<String, Object> body = targetRestClient.get()
                .uri(target.getHealthPath())
                .retrieve()
                .body(Map.class);

        long elapsed = (System.nanoTime() - start) / 1_000_000;

        String status = body != null ? String.valueOf(body.getOrDefault("status", "UNKNOWN")) : "UNKNOWN";
        String dbStatus = "";
        int poolActive = 0, poolIdle = 0, poolTotal = 0;
        long diskFree = 0, diskTotal = 0;

        if (body != null && body.get("components") instanceof Map<?,?> components) {
            // DB component
            if (components.get("db") instanceof Map<?,?> db) {
                dbStatus = db.get("status") != null ? String.valueOf(db.get("status")) : "";
                if (db.get("details") instanceof Map<?,?> dbDetails) {
                    if (dbDetails.get("hikariDataSource") instanceof Map<?,?> hikari) {
                        poolActive = toInt(hikari.get("active"));
                        poolIdle = toInt(hikari.get("idle"));
                        poolTotal = poolActive + poolIdle;
                    }
                }
            }
            // Disk component
            if (components.get("diskSpace") instanceof Map<?,?> disk) {
                if (disk.get("details") instanceof Map<?,?> diskDetails) {
                    diskFree = toLong(diskDetails.get("free"));
                    diskTotal = toLong(diskDetails.get("total"));
                }
            }
        }

        // /actuator/info에서 앱 버전 수집 (선택적)
        String appVersion = "";
        long jvmUptime = 0;
        try {
            Map<String, Object> info = targetRestClient.get()
                    .uri(target.getInfoPath())
                    .retrieve()
                    .body(Map.class);
            if (info != null && info.get("build") instanceof Map<?,?> build) {
                appVersion = build.get("version") != null ? String.valueOf(build.get("version")) : "";
            }
        } catch (Exception e) {
            log.debug("Info endpoint fetch failed for {}: {}", target.getName(), e.getMessage());
        }

        HealthCheckRow previous = healthCheckRepository.getLatest(target.getName());

        healthCheckRepository.insert(new HealthCheckRow(
                LocalDateTime.now(), target.getName(), status, elapsed,
                dbStatus, poolActive, poolIdle, poolTotal,
                diskFree, diskTotal, appVersion, jvmUptime
        ));

        if (previous != null && !previous.status().equals(status)) {
            dashboardNotificationService.notifyHealthChange(Map.of(
                    "service", target.getName(),
                    "previousStatus", previous.status(),
                    "currentStatus", status,
                    "responseTimeMs", elapsed
            ));
        }

        log.debug("Health check for {}: {} ({}ms)", target.getName(), status, elapsed);
    }

    private void insertDown(TargetProperties.Target target) {
        HealthCheckRow previous = healthCheckRepository.getLatest(target.getName());

        healthCheckRepository.insert(new HealthCheckRow(
                LocalDateTime.now(), target.getName(), "DOWN", 10000,
                "", 0, 0, 0, 0, 0, "", 0
        ));

        if (previous != null && !"DOWN".equals(previous.status())) {
            dashboardNotificationService.notifyHealthChange(Map.of(
                    "service", target.getName(),
                    "previousStatus", previous.status(),
                    "currentStatus", "DOWN"
            ));
        }
    }

    private int toInt(Object obj) {
        if (obj instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(obj)); } catch (Exception e) { return 0; }
    }

    private long toLong(Object obj) {
        if (obj instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(obj)); } catch (Exception e) { return 0; }
    }
}
