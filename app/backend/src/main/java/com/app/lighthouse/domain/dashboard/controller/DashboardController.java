package com.app.lighthouse.domain.dashboard.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.dashboard.dto.ErrorLogDto;
import com.app.lighthouse.domain.dashboard.dto.OverviewSummaryDto;
import com.app.lighthouse.domain.dashboard.dto.RequestVolumeDto;
import com.app.lighthouse.domain.dashboard.dto.ResponseTimeDto;
import com.app.lighthouse.domain.dashboard.dto.SlowApiDto;
import com.app.lighthouse.domain.dashboard.service.DashboardService;
import com.app.lighthouse.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<OverviewSummaryDto> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.ok(dashboardService.getSummary(from, to));
    }

    @GetMapping("/request-volume")
    public ApiResponse<List<RequestVolumeDto>> getRequestVolume(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam int intervalMin) {
        return ApiResponse.ok(dashboardService.getRequestVolume(from, to, intervalMin));
    }

    @GetMapping("/response-time")
    public ApiResponse<List<ResponseTimeDto>> getResponseTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam int intervalMin) {
        return ApiResponse.ok(dashboardService.getResponseTime(from, to, intervalMin));
    }

    @GetMapping("/slow-apis")
    public ApiResponse<List<SlowApiDto>> getSlowApis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok(dashboardService.getSlowApis(from, to, limit));
    }

    @GetMapping("/error-logs")
    public ApiResponse<List<ErrorLogDto>> getErrorLogs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.ok(dashboardService.getErrorLogs(from, to, limit));
    }
}
