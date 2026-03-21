package com.app.lighthouse.domain.business.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.app.lighthouse.domain.business.repository.BusinessMetricRepository;
import com.app.lighthouse.domain.business.repository.row.BusinessMetricRow;
import com.app.lighthouse.global.config.TargetProperties;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusinessCollectorScheduler {

    private final RestClient targetRestClient;
    private final TargetProperties targetProperties;
    private final BusinessMetricRepository businessMetricRepository;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${lighthouse.business.collect-interval-ms:300000}", initialDelay = 20000)
    public void collectBusinessMetrics() {
        if (targetProperties.getTargets() == null || targetProperties.getTargets().isEmpty()) {
            return;
        }

        for (TargetProperties.Target target : targetProperties.getTargets()) {
            collectForTarget(target);
        }
    }

    private void collectForTarget(TargetProperties.Target target) {
        if (target.getBusinessPaths() == null || target.getBusinessPaths().isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // 각 API를 개별 try-catch로 감싸서 하나 실패해도 나머지는 수집
        for (String path : target.getBusinessPaths()) {
            try {
                String metricType = resolveMetricType(path);
                Map<String, Object> response = targetRestClient.get()
                        .uri(path)
                        .retrieve()
                        .body(Map.class);

                // Picook ApiResponse envelope에서 data 추출
                Object data = response;
                if (response != null && response.containsKey("data")) {
                    data = response.get("data");
                }

                String jsonData = objectMapper.writeValueAsString(data);
                businessMetricRepository.insert(new BusinessMetricRow(
                        now, target.getName(), metricType, jsonData
                ));

                log.debug("Business metric collected: {} / {}", target.getName(), metricType);
            } catch (Exception e) {
                log.debug("Business metric collection skipped for {} path {} (target unreachable): {}",
                        target.getName(), path, e.getMessage());
            }
        }
    }

    private String resolveMetricType(String path) {
        if (path.contains("/users")) return "USER_STATS";
        if (path.contains("/dashboard")) return "DASHBOARD";
        if (path.contains("/shorts")) return "SHORTS";
        return "UNKNOWN";
    }
}
