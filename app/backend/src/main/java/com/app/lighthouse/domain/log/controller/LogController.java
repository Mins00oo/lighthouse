package com.app.lighthouse.domain.log.controller;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.lighthouse.domain.log.dto.LogSearchRequest;
import com.app.lighthouse.domain.log.dto.LogSearchResponse;
import com.app.lighthouse.domain.log.dto.LogTimelineDto;
import com.app.lighthouse.domain.log.service.LogService;
import com.app.lighthouse.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping
    public ApiResponse<LogSearchResponse> searchLogs(@Valid @ModelAttribute LogSearchRequest request) {
        return ApiResponse.ok(logService.searchLogs(request));
    }

    @GetMapping("/timeline")
    public ApiResponse<LogTimelineDto> getTimeline(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String interval,
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String env) {
        return ApiResponse.ok(logService.getTimeline(from, to, interval, service, env));
    }
}
