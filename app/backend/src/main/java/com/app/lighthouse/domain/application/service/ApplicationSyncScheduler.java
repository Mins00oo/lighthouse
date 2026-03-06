package com.app.lighthouse.domain.application.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationSyncScheduler {

    private final ApplicationService applicationService;

    /**
     * 5분마다 ClickHouse 로그 데이터를 스캔하여
     * 신규 애플리케이션을 자동 발견 및 등록한다.
     */
    @Scheduled(fixedDelayString = "${app.sync.interval-ms:300000}", initialDelay = 10000)
    public void scheduledSync() {
        try {
            ApplicationService.SyncResult result = applicationService.syncAll();
            if (result.newApplications() > 0) {
                log.info("스케줄 동기화: 신규 앱 {}개 발견", result.newApplications());
            }
        } catch (Exception e) {
            log.error("애플리케이션 동기화 중 오류 발생", e);
        }
    }
}
