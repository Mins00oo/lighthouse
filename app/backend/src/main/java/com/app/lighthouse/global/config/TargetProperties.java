package com.app.lighthouse.global.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "lighthouse")
public class TargetProperties {

    private List<Target> targets;
    private Health health = new Health();
    private Metric metric = new Metric();
    private Business business = new Business();

    @Getter
    @Setter
    public static class Target {
        private String name;
        private String baseUrl;
        private String healthPath;
        private String prometheusPath;
        private String infoPath;
        private List<String> businessPaths;
    }

    @Getter
    @Setter
    public static class Health {
        private long checkIntervalMs = 60_000;
    }

    @Getter
    @Setter
    public static class Metric {
        private long collectIntervalMs = 60_000;
    }

    @Getter
    @Setter
    public static class Business {
        private long collectIntervalMs = 300_000;
    }
}
