package com.app.lighthouse.global.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(TargetProperties.class)
public class TargetAppClientConfig {

    @Bean
    public RestClient targetRestClient(TargetProperties targetProperties) {
        String baseUrl = targetProperties.getTargets() != null && !targetProperties.getTargets().isEmpty()
                ? targetProperties.getTargets().get(0).getBaseUrl()
                : "http://localhost:8080";

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
