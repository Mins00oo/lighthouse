package com.app.lighthouse.domain.application.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.application.dto.AppStatsResponse;
import com.app.lighthouse.domain.application.dto.ApplicationCreateRequest;
import com.app.lighthouse.domain.application.dto.ApplicationDetailResponse;
import com.app.lighthouse.domain.application.dto.ApplicationListResponse;
import com.app.lighthouse.domain.application.dto.ApplicationResponse;
import com.app.lighthouse.domain.application.dto.ApplicationUpdateRequest;
import com.app.lighthouse.domain.application.service.ApplicationService;
import com.app.lighthouse.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // ========== 동기화 ==========

    @PostMapping("/sync")
    public ApiResponse<ApplicationService.SyncResult> syncApplications() {
        return ApiResponse.ok(applicationService.syncAll());
    }

    // ========== 애플리케이션 CRUD ==========

    @PostMapping
    public ApiResponse<ApplicationResponse> createApplication(
            @Valid @RequestBody ApplicationCreateRequest request) {
        return ApiResponse.ok(applicationService.createApplication(request));
    }

    @GetMapping
    public ApiResponse<List<ApplicationListResponse>> getApplications(
            @RequestParam(required = false) String status) {
        return ApiResponse.ok(applicationService.getApplications(status));
    }

    @GetMapping("/{appId}")
    public ApiResponse<ApplicationDetailResponse> getApplicationDetail(
            @PathVariable Long appId) {
        return ApiResponse.ok(applicationService.getApplicationDetail(appId));
    }

    @PutMapping("/{appId}")
    public ApiResponse<ApplicationResponse> updateApplication(
            @PathVariable Long appId,
            @Valid @RequestBody ApplicationUpdateRequest request) {
        return ApiResponse.ok(applicationService.updateApplication(appId, request));
    }

    @DeleteMapping("/{appId}")
    public ApiResponse<Void> deleteApplication(@PathVariable Long appId) {
        applicationService.deleteApplication(appId);
        return ApiResponse.ok(null, "애플리케이션이 삭제되었습니다.");
    }

    // ========== 통계 ==========

    @GetMapping("/{appId}/stats")
    public ApiResponse<AppStatsResponse> getAppStats(
            @PathVariable Long appId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ApiResponse.ok(applicationService.getAppStats(appId, from, to));
    }
}
