package com.app.lighthouse.domain.alert.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "lighthouse.alert")
public class AlertProperties {

    private boolean enabled = false;
    private long checkIntervalMs = 600_000;
    private long cooldownMs = 600_000;
    private Slack slack = new Slack();
    private Rules rules = new Rules();

    @Getter
    @Setter
    public static class Slack {
        private String webhookUrl;
        private String channel;
    }

    @Getter
    @Setter
    public static class Rules {
        private ErrorRate errorRate = new ErrorRate();
        private ResponseTime responseTime = new ResponseTime();
        private ApiFailure apiFailure = new ApiFailure();
        private ServerDown serverDown = new ServerDown();
        private ResourceThreshold resourceThreshold = new ResourceThreshold();
    }

    @Getter
    @Setter
    public static class ErrorRate {
        private boolean enabled = true;
        private double thresholdMultiplier = 3.0;
        private int minRequestCount = 50;
        private double fallbackAbsoluteRate = 0.05;
    }

    @Getter
    @Setter
    public static class ResponseTime {
        private boolean enabled = true;
        private int p95ThresholdMs = 3000;
        private int minRequestCount = 50;
    }

    @Getter
    @Setter
    public static class ApiFailure {
        private boolean enabled = true;
        private int consecutiveCount = 5;
    }

    @Getter
    @Setter
    public static class ServerDown {
        private boolean enabled = true;
        private int consecutiveDownCount = 3;
    }

    @Getter
    @Setter
    public static class ResourceThreshold {
        private boolean enabled = true;
        private double cpuWarning = 80.0;
        private double cpuCritical = 95.0;
        private double memoryWarning = 85.0;
        private double memoryCritical = 95.0;
        private double diskCriticalPercent = 10.0;
        private double hikariWarning = 80.0;
    }
}
