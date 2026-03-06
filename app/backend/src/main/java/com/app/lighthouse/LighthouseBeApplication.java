package com.app.lighthouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.app.lighthouse.domain.alert.config.AlertProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(AlertProperties.class)
public class LighthouseBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(LighthouseBeApplication.class, args);
    }

}
