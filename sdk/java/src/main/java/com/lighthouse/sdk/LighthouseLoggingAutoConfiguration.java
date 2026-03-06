package com.lighthouse.sdk;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

@AutoConfiguration
@EnableConfigurationProperties(LighthouseLoggingProperties.class)
@ConditionalOnClass(name = "ch.qos.logback.classic.LoggerContext")
@ConditionalOnProperty(prefix = "lighthouse.logging", name = "enabled", havingValue = "true", matchIfMissing = true)
public class LighthouseLoggingAutoConfiguration {

    @Bean
    public LighthouseLogbackAppenderInitializer lighthouseLogbackAppenderInitializer(
            LighthouseLoggingProperties properties,
            Environment environment) {
        return new LighthouseLogbackAppenderInitializer(properties, environment);
    }

    @Bean
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    @ConditionalOnClass(name = "jakarta.servlet.Filter")
    @ConditionalOnProperty(prefix = "lighthouse.logging", name = "http-filter-enabled",
            havingValue = "true", matchIfMissing = true)
    public LighthouseHttpLoggingFilter lighthouseHttpLoggingFilter(
            LighthouseLoggingProperties properties) {
        return new LighthouseHttpLoggingFilter(properties.getExcludePaths());
    }
}
