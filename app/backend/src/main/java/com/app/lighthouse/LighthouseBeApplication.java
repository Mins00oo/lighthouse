package com.app.lighthouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LighthouseBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(LighthouseBeApplication.class, args);
    }

}
