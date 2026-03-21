package com.app.lighthouse.domain.business.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.business.dto.BusinessSummaryDto;
import com.app.lighthouse.domain.business.dto.UserActivityDto;
import com.app.lighthouse.domain.business.dto.ShortsStatsDto;
import com.app.lighthouse.domain.business.service.BusinessMetricService;
import com.app.lighthouse.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/business")
@RequiredArgsConstructor
public class BusinessMetricController {

    private final BusinessMetricService businessMetricService;

    @GetMapping("/summary")
    public ApiResponse<BusinessSummaryDto> getSummary(
            @RequestParam(defaultValue = "picook-backend") String service) {
        return ApiResponse.ok(businessMetricService.getSummary(service));
    }

    @GetMapping("/users")
    public ApiResponse<List<UserActivityDto>> getUserActivity(
            @RequestParam(defaultValue = "picook-backend") String service,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.ok(businessMetricService.getUserActivity(service, from, to));
    }

    @GetMapping("/shorts")
    public ApiResponse<List<ShortsStatsDto>> getShortsStats(
            @RequestParam(defaultValue = "picook-backend") String service,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.ok(businessMetricService.getShortsStats(service, from, to));
    }
}
