package com.app.lighthouse.domain.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.application.dto.AppStatsResponse;
import com.app.lighthouse.domain.application.dto.ApplicationCreateRequest;
import com.app.lighthouse.domain.application.dto.ApplicationDetailResponse;
import com.app.lighthouse.domain.application.dto.ApplicationListResponse;
import com.app.lighthouse.domain.application.dto.ApplicationResponse;
import com.app.lighthouse.domain.application.dto.ApplicationUpdateRequest;
import com.app.lighthouse.domain.log.repository.LogRepository;
import com.app.lighthouse.domain.log.repository.row.AppStatsRow;
import com.app.lighthouse.domain.log.repository.row.ServerStatusRow;
import com.app.lighthouse.domain.log.repository.row.ServiceSummaryRow;
import com.app.lighthouse.infra.oracle.ApplicationMapper;
import com.app.lighthouse.infra.oracle.ApplicationRecord;

import com.app.lighthouse.global.util.TimeUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationMapper applicationMapper;
    private final LogRepository logRepository;

    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "INACTIVE");

    // ========== 자동 발견 동기화 ==========

    /**
     * ClickHouse 로그 데이터를 기반으로 애플리케이션을 자동 발견/등록한다.
     * 신규 service → lh_application 자동 등록 (display_name = service_name)
     */
    public SyncResult syncAll() {
        LocalDateTime since = TimeUtils.nowUtc().minusHours(24);
        List<String> liveServices = logRepository.getDistinctServices(since);

        int newApps = 0;

        for (String serviceName : liveServices) {
            ApplicationRecord app = applicationMapper.findByServiceName(serviceName);
            if (app == null) {
                applicationMapper.insert(serviceName, serviceName, null);
                newApps++;
                log.info("애플리케이션 자동 발견: {}", serviceName);
            }
        }

        log.info("동기화 완료: 신규 애플리케이션 {}개 (전체 스캔 {}개)", newApps, liveServices.size());
        return new SyncResult(newApps, liveServices.size());
    }

    public record SyncResult(int newApplications, int totalServicesScanned) {}

    // ========== 애플리케이션 CRUD ==========

    public ApplicationResponse createApplication(ApplicationCreateRequest request) {
        ApplicationRecord existing = applicationMapper.findByServiceName(request.getServiceName());
        if (existing != null) {
            throw new IllegalArgumentException("이미 등록된 서비스명입니다: " + request.getServiceName());
        }

        applicationMapper.insert(request.getServiceName(), request.getDisplayName(), request.getDescription());
        ApplicationRecord created = applicationMapper.findByServiceName(request.getServiceName());
        return ApplicationResponse.from(created);
    }

    public List<ApplicationListResponse> getApplications(String status) {
        List<ApplicationRecord> records = applicationMapper.findAll(status);

        if (records.isEmpty()) {
            return List.of();
        }

        // ClickHouse에서 최근 24시간 요약 통계 배치 조회
        List<String> serviceNames = records.stream()
                .map(ApplicationRecord::serviceName)
                .collect(Collectors.toList());

        LocalDateTime since = TimeUtils.nowUtc().minusHours(24);
        List<ServiceSummaryRow> summaries = logRepository.getServiceSummaries(since, serviceNames);

        Map<String, ServiceSummaryRow> summaryMap = summaries.stream()
                .collect(Collectors.toMap(ServiceSummaryRow::service, s -> s));

        return records.stream()
                .map(record -> {
                    ServiceSummaryRow summary = summaryMap.get(record.serviceName());
                    return ApplicationListResponse.from(
                            record,
                            summary != null ? summary.logCount() : 0L,
                            summary != null ? summary.errorCount() : 0L,
                            summary != null ? summary.lastLogTime() : null
                    );
                })
                .collect(Collectors.toList());
    }

    public ApplicationDetailResponse getApplicationDetail(Long appId) {
        ApplicationRecord record = findApplicationOrThrow(appId);

        // 최근 1시간 통계
        LocalDateTime now = TimeUtils.nowUtc();
        LocalDateTime from = now.minusHours(1);
        AppStatsRow statsRow = logRepository.getAppStats(from, now, record.serviceName());
        AppStatsResponse stats = statsRow != null ? AppStatsResponse.from(statsRow) : null;

        // 서버 현황 (ClickHouse 동적 조회)
        List<ServerStatusRow> liveServers = logRepository.getServerStatusByService(record.serviceName(), from);
        List<ApplicationDetailResponse.ServerInfo> servers = liveServers.stream()
                .map(s -> ApplicationDetailResponse.ServerInfo.builder()
                        .host(s.host())
                        .env(s.env())
                        .lastLogTime(s.lastLogTime())
                        .logCount(s.logCount())
                        .errorCount(s.errorCount())
                        .build())
                .collect(Collectors.toList());

        return ApplicationDetailResponse.from(record, stats, servers);
    }

    public ApplicationResponse updateApplication(Long appId, ApplicationUpdateRequest request) {
        ApplicationRecord existing = findApplicationOrThrow(appId);

        String displayName = request.getDisplayName() != null ? request.getDisplayName() : existing.displayName();
        String description = request.getDescription() != null ? request.getDescription() : existing.description();
        String status = request.getStatus() != null ? request.getStatus() : existing.status();

        validateStatus(status);

        applicationMapper.update(appId, displayName, description, status);
        return ApplicationResponse.from(applicationMapper.findById(appId));
    }

    public void deleteApplication(Long appId) {
        findApplicationOrThrow(appId);
        applicationMapper.delete(appId);
    }

    // ========== 통계 ==========

    public AppStatsResponse getAppStats(Long appId, LocalDateTime from, LocalDateTime to) {
        ApplicationRecord record = findApplicationOrThrow(appId);

        if (from == null && to == null) {
            to = TimeUtils.nowUtc();
            from = to.minusHours(1);
        } else if (from != null && to == null) {
            from = TimeUtils.toUtc(from);
            to = TimeUtils.nowUtc();
        } else if (from == null) {
            to = TimeUtils.toUtc(to);
            from = to.minusHours(1);
        } else {
            from = TimeUtils.toUtc(from);
            to = TimeUtils.toUtc(to);
        }

        AppStatsRow row = logRepository.getAppStats(from, to, record.serviceName());
        return row != null ? AppStatsResponse.from(row) : AppStatsResponse.builder().build();
    }

    // ========== Private Helpers ==========

    private ApplicationRecord findApplicationOrThrow(Long appId) {
        ApplicationRecord record = applicationMapper.findById(appId);
        if (record == null) {
            throw new IllegalArgumentException("애플리케이션을 찾을 수 없습니다: " + appId);
        }
        return record;
    }

    private void validateStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("유효하지 않은 상태값입니다. ACTIVE 또는 INACTIVE만 허용됩니다: " + status);
        }
    }
}
