package com.app.lighthouse.domain.metric.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.app.lighthouse.domain.metric.repository.row.SystemMetricRow;

@Repository
public class MetricRepository {

    private static final String TABLE = "lighthouse.system_metrics";
    private final JdbcTemplate jdbc;

    public MetricRepository(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(SystemMetricRow row) {
        String sql = "INSERT INTO " + TABLE +
                " (timestamp, service, cpu_usage_percent, memory_used_bytes, memory_max_bytes," +
                " jvm_heap_used, jvm_heap_max, jvm_nonheap_used, jvm_threads_live, jvm_gc_pause_ms," +
                " hikari_active, hikari_idle, hikari_pending, http_server_requests," +
                " tomcat_threads_busy, tomcat_threads_max)" +
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbc.update(sql,
                row.timestamp(), row.service(), row.cpuUsagePercent(),
                row.memoryUsedBytes(), row.memoryMaxBytes(),
                row.jvmHeapUsed(), row.jvmHeapMax(), row.jvmNonheapUsed(),
                row.jvmThreadsLive(), row.jvmGcPauseMs(),
                row.hikariActive(), row.hikariIdle(), row.hikariPending(),
                row.httpServerRequests(), row.tomcatThreadsBusy(), row.tomcatThreadsMax());
    }

    public SystemMetricRow getLatest(String service) {
        String sql = "SELECT * FROM " + TABLE +
                " WHERE service = ? ORDER BY timestamp DESC LIMIT 1";
        List<SystemMetricRow> rows = jdbc.query(sql, this::mapRow, service);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<SystemMetricRow> getTrend(String service, LocalDateTime from, LocalDateTime to, String interval) {
        String sql = "SELECT" +
                " toStartOfInterval(timestamp, INTERVAL " + interval + ") AS time_bucket," +
                " any(service) AS service," +
                " avg(cpu_usage_percent) AS cpu_usage_percent," +
                " avg(memory_used_bytes) AS memory_used_bytes," +
                " avg(memory_max_bytes) AS memory_max_bytes," +
                " avg(jvm_heap_used) AS jvm_heap_used," +
                " avg(jvm_heap_max) AS jvm_heap_max," +
                " avg(jvm_nonheap_used) AS jvm_nonheap_used," +
                " avg(jvm_threads_live) AS jvm_threads_live," +
                " avg(jvm_gc_pause_ms) AS jvm_gc_pause_ms," +
                " avg(hikari_active) AS hikari_active," +
                " avg(hikari_idle) AS hikari_idle," +
                " avg(hikari_pending) AS hikari_pending," +
                " max(http_server_requests) AS http_server_requests," +
                " avg(tomcat_threads_busy) AS tomcat_threads_busy," +
                " avg(tomcat_threads_max) AS tomcat_threads_max" +
                " FROM " + TABLE +
                " WHERE service = ? AND timestamp >= ? AND timestamp < ?" +
                " GROUP BY time_bucket ORDER BY time_bucket ASC";
        return jdbc.query(sql, this::mapRow, service, from, to);
    }

    public SystemMetricRow getRecentAvg(String service, int minutes) {
        String sql = "SELECT" +
                " now() AS timestamp, ? AS service," +
                " avg(cpu_usage_percent) AS cpu_usage_percent," +
                " avg(memory_used_bytes) AS memory_used_bytes," +
                " avg(memory_max_bytes) AS memory_max_bytes," +
                " avg(jvm_heap_used) AS jvm_heap_used," +
                " avg(jvm_heap_max) AS jvm_heap_max," +
                " avg(jvm_nonheap_used) AS jvm_nonheap_used," +
                " avg(jvm_threads_live) AS jvm_threads_live," +
                " avg(jvm_gc_pause_ms) AS jvm_gc_pause_ms," +
                " avg(hikari_active) AS hikari_active," +
                " avg(hikari_idle) AS hikari_idle," +
                " avg(hikari_pending) AS hikari_pending," +
                " max(http_server_requests) AS http_server_requests," +
                " avg(tomcat_threads_busy) AS tomcat_threads_busy," +
                " avg(tomcat_threads_max) AS tomcat_threads_max" +
                " FROM " + TABLE +
                " WHERE service = ? AND timestamp >= now() - INTERVAL " + minutes + " MINUTE";
        List<SystemMetricRow> rows = jdbc.query(sql, this::mapRow, service, service);
        return rows.isEmpty() ? null : rows.get(0);
    }

    private SystemMetricRow mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new SystemMetricRow(
                rs.getTimestamp("timestamp") != null ? rs.getTimestamp("timestamp").toLocalDateTime() : LocalDateTime.now(),
                rs.getString("service"),
                rs.getDouble("cpu_usage_percent"),
                rs.getLong("memory_used_bytes"),
                rs.getLong("memory_max_bytes"),
                rs.getLong("jvm_heap_used"),
                rs.getLong("jvm_heap_max"),
                rs.getLong("jvm_nonheap_used"),
                rs.getInt("jvm_threads_live"),
                rs.getDouble("jvm_gc_pause_ms"),
                rs.getInt("hikari_active"),
                rs.getInt("hikari_idle"),
                rs.getInt("hikari_pending"),
                rs.getLong("http_server_requests"),
                rs.getInt("tomcat_threads_busy"),
                rs.getInt("tomcat_threads_max")
        );
    }
}
