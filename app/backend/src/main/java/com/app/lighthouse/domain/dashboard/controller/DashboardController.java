package com.app.lighthouse.domain.dashboard.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.dashboard.dto.ApiDetailDto;
import com.app.lighthouse.domain.dashboard.dto.ApiRankingDto;
import com.app.lighthouse.domain.dashboard.dto.DashboardSummaryDto;
import com.app.lighthouse.domain.dashboard.dto.ErrorTrendDto;
import com.app.lighthouse.domain.dashboard.dto.LogLevelDistributionDto;
import com.app.lighthouse.domain.dashboard.dto.LogVolumeDto;
import com.app.lighthouse.domain.dashboard.dto.RecentErrorDto;
import com.app.lighthouse.domain.dashboard.dto.ServerStatusDto;
import com.app.lighthouse.domain.dashboard.service.DashboardService;
import com.app.lighthouse.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryDto> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.ok(dashboardService.getSummary(from, to));
    }

    @GetMapping("/log-volume")
    public ApiResponse<LogVolumeDto> getLogVolume(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String interval,
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String env) {
        return ApiResponse.ok(dashboardService.getLogVolume(from, to, interval, service, env));
    }

    @GetMapping("/log-level-distribution")
    public ApiResponse<LogLevelDistributionDto> getLogLevelDistribution(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String env) {
        return ApiResponse.ok(dashboardService.getLogLevelDistribution(from, to, service, env));
    }

    @GetMapping("/server-status")
    public ApiResponse<List<ServerStatusDto>> getServerStatus(
            @RequestParam(defaultValue = "30") int recentMinutes) {
        return ApiResponse.ok(dashboardService.getServerStatuses(recentMinutes));
    }

    @GetMapping("/error-trend")
    public ApiResponse<ErrorTrendDto> getErrorTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String interval,
            @RequestParam(required = false) String service) {
        return ApiResponse.ok(dashboardService.getErrorTrend(from, to, interval, service));
    }

    @GetMapping("/api-ranking")
    public ApiResponse<ApiRankingDto> getApiRanking(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String service,
            @RequestParam(defaultValue = "count") String sortBy,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.ok(dashboardService.getApiRanking(from, to, service, sortBy, limit));
    }

    @GetMapping("/api-detail")
    public ApiResponse<ApiDetailDto> getApiDetail(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam String httpMethod,
            @RequestParam String httpPath,
            @RequestParam(required = false) String interval) {
        return ApiResponse.ok(dashboardService.getApiDetail(from, to, httpMethod, httpPath, interval));
    }

    @GetMapping("/recent-errors")
    public ApiResponse<RecentErrorDto> getRecentErrors(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String service,
            @RequestParam(defaultValue = "50") int limit) {
        return ApiResponse.ok(dashboardService.getRecentErrors(from, to, service, limit));
    }
}
