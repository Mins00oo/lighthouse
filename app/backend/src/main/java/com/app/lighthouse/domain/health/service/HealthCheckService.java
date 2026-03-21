package com.app.lighthouse.domain.health.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.health.dto.HealthStatusDto;
import com.app.lighthouse.domain.health.dto.UptimeDto;
import com.app.lighthouse.domain.health.repository.HealthCheckRepository;
import com.app.lighthouse.domain.health.repository.row.HealthCheckRow;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HealthCheckService {

    private final HealthCheckRepository healthCheckRepository;

    public HealthStatusDto getStatus(String service) {
        HealthCheckRow row = healthCheckRepository.getLatest(service);
        if (row == null) {
            return HealthStatusDto.builder()
                    .service(service)
                    .status("UNKNOWN")
                    .build();
        }
        return toDto(row);
    }

    public List<HealthStatusDto> getHistory(String service, LocalDateTime from, LocalDateTime to) {
        return healthCheckRepository.getHistory(service, from, to).stream()
                .map(this::toDto)
                .toList();
    }

    public UptimeDto getUptime(String service, int days) {
        double percent = healthCheckRepository.getUptimePercent(service, days);
        return UptimeDto.builder()
                .service(service)
                .uptimePercent(percent)
                .days(days)
                .build();
    }

    private HealthStatusDto toDto(HealthCheckRow row) {
        return HealthStatusDto.builder()
                .service(row.service())
                .status(row.status())
                .responseTimeMs(row.responseTimeMs())
                .dbStatus(row.dbStatus())
                .dbPoolActive(row.dbPoolActive())
                .dbPoolIdle(row.dbPoolIdle())
                .dbPoolTotal(row.dbPoolTotal())
                .diskFreeBytes(row.diskFreeBytes())
                .diskTotalBytes(row.diskTotalBytes())
                .appVersion(row.appVersion())
                .jvmUptimeSeconds(row.jvmUptimeSeconds())
                .checkedAt(row.timestamp())
                .build();
    }
}
