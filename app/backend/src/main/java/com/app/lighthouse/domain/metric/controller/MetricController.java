package com.app.lighthouse.domain.metric.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.metric.dto.SystemMetricDto;
import com.app.lighthouse.domain.metric.service.MetricService;
import com.app.lighthouse.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricController {

    private final MetricService metricService;

    @GetMapping("/system")
    public ApiResponse<SystemMetricDto> getSystem(
            @RequestParam(defaultValue = "picook-backend") String service) {
        return ApiResponse.ok(metricService.getLatest(service));
    }

    @GetMapping("/trend")
    public ApiResponse<List<SystemMetricDto>> getTrend(
            @RequestParam(defaultValue = "picook-backend") String service,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "5") int intervalMin) {
        return ApiResponse.ok(metricService.getTrend(service, from, to, intervalMin));
    }
}
