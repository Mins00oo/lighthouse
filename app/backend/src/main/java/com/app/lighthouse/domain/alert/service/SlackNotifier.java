package com.app.lighthouse.domain.alert.service;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.app.lighthouse.domain.alert.config.AlertProperties;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SlackNotifier {

    private final AlertProperties alertProperties;
    private final RestClient restClient;

    public SlackNotifier(AlertProperties alertProperties) {
        this.alertProperties = alertProperties;
        this.restClient = RestClient.create();
    }

    public void send(String message) {
        String webhookUrl = alertProperties.getSlack().getWebhookUrl();
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.warn("Slack webhook URL is not configured. Skipping alert notification.");
            return;
        }

        try {
            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("text", message))
                    .retrieve()
                    .toBodilessEntity();

            log.info("Slack alert sent successfully");
        } catch (Exception e) {
            log.error("Failed to send Slack alert: {}", e.getMessage());
        }
    }
}
