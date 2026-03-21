package com.app.lighthouse.domain.health.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.health.dto.HealthStatusDto;
import com.app.lighthouse.domain.health.dto.UptimeDto;
import com.app.lighthouse.domain.health.service.HealthCheckService;
import com.app.lighthouse.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/health-monitor")
@RequiredArgsConstructor
public class HealthCheckController {

    private final HealthCheckService healthCheckService;

    @GetMapping("/status")
    public ApiResponse<HealthStatusDto> getStatus(
            @RequestParam(defaultValue = "picook-backend") String service) {
        return ApiResponse.ok(healthCheckService.getStatus(service));
    }

    @GetMapping("/history")
    public ApiResponse<List<HealthStatusDto>> getHistory(
            @RequestParam(defaultValue = "picook-backend") String service,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        if (from == null) from = LocalDateTime.now().minusHours(24);
        if (to == null) to = LocalDateTime.now();
        return ApiResponse.ok(healthCheckService.getHistory(service, from, to));
    }

    @GetMapping("/uptime")
    public ApiResponse<UptimeDto> getUptime(
            @RequestParam(defaultValue = "picook-backend") String service,
            @RequestParam(defaultValue = "30") int days) {
        return ApiResponse.ok(healthCheckService.getUptime(service, days));
    }
}
