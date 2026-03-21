package com.app.lighthouse.domain.business.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.lighthouse.domain.business.dto.BusinessSummaryDto;
import com.app.lighthouse.domain.business.dto.UserActivityDto;
import com.app.lighthouse.domain.business.dto.ShortsStatsDto;
import com.app.lighthouse.domain.business.repository.BusinessMetricRepository;
import com.app.lighthouse.domain.business.repository.row.BusinessMetricRow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessMetricService {

    private final BusinessMetricRepository businessMetricRepository;
    private final ObjectMapper objectMapper;

    public BusinessSummaryDto getSummary(String service) {
        BusinessMetricRow userRow = businessMetricRepository.getLatest(service, "USER_STATS");
        BusinessMetricRow dashRow = businessMetricRepository.getLatest(service, "DASHBOARD");
        BusinessMetricRow shortsRow = businessMetricRepository.getLatest(service, "SHORTS");

        var builder = BusinessSummaryDto.builder().service(service);

        if (userRow != null) {
            JsonNode node = parseJson(userRow.metricData());
            if (node != null) {
                builder.collectedAt(userRow.timestamp())
                        .dau(node.path("dau").asLong(0))
                        .wau(node.path("wau").asLong(0))
                        .mau(node.path("mau").asLong(0))
                        .totalUsers(node.path("totalUsers").asLong(0))
                        .newUsersToday(node.path("newUsersToday").asLong(0));
            }
        }

        if (dashRow != null) {
            JsonNode node = parseJson(dashRow.metricData());
            if (node != null) {
                builder.totalRecipes(node.path("totalRecipes").asLong(0))
                        .totalIngredients(node.path("totalIngredients").asLong(0))
                        .totalCoachingToday(node.path("totalCoachingToday").asLong(0))
                        .totalCoachingCompleted(node.path("totalCoachingCompleted").asLong(0))
                        .totalShortsToday(node.path("totalShortsToday").asLong(0));
            }
        }

        if (shortsRow != null) {
            JsonNode node = parseJson(shortsRow.metricData());
            if (node != null) {
                builder.shortsSuccessRate(node.path("successRate").asDouble(0))
                        .shortsAvgConversionTimeMs(node.path("avgConversionTimeMs").asLong(0))
                        .shortsCacheHitRate(node.path("cacheHitRate").asDouble(0))
                        .shortsTotalCacheEntries(node.path("totalCacheEntries").asLong(0));
            }
        }

        return builder.build();
    }

    public List<UserActivityDto> getUserActivity(String service, LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDateTime.now().minusDays(30);
        if (to == null) to = LocalDateTime.now();

        return businessMetricRepository.getHistory(service, "USER_STATS", from, to).stream()
                .map(row -> {
                    JsonNode node = parseJson(row.metricData());
                    if (node == null) return null;
                    return UserActivityDto.builder()
                            .collectedAt(row.timestamp())
                            .dau(node.path("dau").asLong(0))
                            .wau(node.path("wau").asLong(0))
                            .mau(node.path("mau").asLong(0))
                            .totalUsers(node.path("totalUsers").asLong(0))
                            .newUsersToday(node.path("newUsersToday").asLong(0))
                            .build();
                })
                .filter(dto -> dto != null)
                .toList();
    }

    public List<ShortsStatsDto> getShortsStats(String service, LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDateTime.now().minusDays(7);
        if (to == null) to = LocalDateTime.now();

        return businessMetricRepository.getHistory(service, "SHORTS", from, to).stream()
                .map(row -> {
                    JsonNode node = parseJson(row.metricData());
                    if (node == null) return null;
                    return ShortsStatsDto.builder()
                            .collectedAt(row.timestamp())
                            .successRate(node.path("successRate").asDouble(0))
                            .avgConversionTimeMs(node.path("avgConversionTimeMs").asLong(0))
                            .cacheHitRate(node.path("cacheHitRate").asDouble(0))
                            .totalCacheEntries(node.path("totalCacheEntries").asLong(0))
                            .build();
                })
                .filter(dto -> dto != null)
                .toList();
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.warn("Failed to parse business metric JSON: {}", e.getMessage());
            return null;
        }
    }
}
