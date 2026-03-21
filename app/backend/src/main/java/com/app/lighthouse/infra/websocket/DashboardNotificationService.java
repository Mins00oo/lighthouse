package com.app.lighthouse.infra.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.dashboard.dto.OverviewSummaryDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String TOPIC_DASHBOARD = "/topic/dashboard";
    private static final String TOPIC_DASHBOARD_ALERTS = "/topic/dashboard/alerts";
    private static final String TOPIC_DASHBOARD_HEALTH = "/topic/dashboard/health";
    private static final String TOPIC_DASHBOARD_METRICS = "/topic/dashboard/metrics";

    public void notifyDashboardUpdate(OverviewSummaryDto summary) {
        log.debug("Broadcasting dashboard update to {}", TOPIC_DASHBOARD);
        messagingTemplate.convertAndSend(TOPIC_DASHBOARD, summary);
    }

    public void notifyAlert(Object alertPayload) {
        log.info("Broadcasting alert to {}", TOPIC_DASHBOARD_ALERTS);
        messagingTemplate.convertAndSend(TOPIC_DASHBOARD_ALERTS, alertPayload);
    }

    public void notifyHealthChange(Object healthPayload) {
        log.info("Broadcasting health change to {}", TOPIC_DASHBOARD_HEALTH);
        messagingTemplate.convertAndSend(TOPIC_DASHBOARD_HEALTH, healthPayload);
    }

    public void notifyMetricThreshold(Object metricPayload) {
        log.info("Broadcasting metric threshold to {}", TOPIC_DASHBOARD_METRICS);
        messagingTemplate.convertAndSend(TOPIC_DASHBOARD_METRICS, metricPayload);
    }
}
