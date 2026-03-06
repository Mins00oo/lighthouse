package com.app.lighthouse.infra.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.dashboard.dto.DashboardSummaryDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String TOPIC_DASHBOARD = "/topic/dashboard";
    private static final String TOPIC_DASHBOARD_ALERTS = "/topic/dashboard/alerts";

    public void notifyDashboardUpdate(DashboardSummaryDto summary) {
        log.debug("Broadcasting dashboard update to {}", TOPIC_DASHBOARD);
        messagingTemplate.convertAndSend(TOPIC_DASHBOARD, summary);
    }

    public void notifyAlert(Object alertPayload) {
        log.info("Broadcasting alert to {}", TOPIC_DASHBOARD_ALERTS);
        messagingTemplate.convertAndSend(TOPIC_DASHBOARD_ALERTS, alertPayload);
    }
}
