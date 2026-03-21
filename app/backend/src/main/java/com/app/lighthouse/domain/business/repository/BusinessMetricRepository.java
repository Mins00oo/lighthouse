package com.app.lighthouse.domain.business.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.app.lighthouse.domain.business.repository.row.BusinessMetricRow;

@Repository
public class BusinessMetricRepository {

    private static final String TABLE = "lighthouse.business_metrics";
    private final JdbcTemplate jdbc;

    public BusinessMetricRepository(@Qualifier("clickHouseJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(BusinessMetricRow row) {
        String sql = "INSERT INTO " + TABLE +
                " (timestamp, service, metric_type, metric_data)" +
                " VALUES (?, ?, ?, ?)";
        jdbc.update(sql, row.timestamp(), row.service(), row.metricType(), row.metricData());
    }

    public BusinessMetricRow getLatest(String service, String metricType) {
        String sql = "SELECT * FROM " + TABLE +
                " WHERE service = ? AND metric_type = ?" +
                " ORDER BY timestamp DESC LIMIT 1";
        List<BusinessMetricRow> rows = jdbc.query(sql, (rs, rowNum) -> new BusinessMetricRow(
                rs.getTimestamp("timestamp").toLocalDateTime(),
                rs.getString("service"),
                rs.getString("metric_type"),
                rs.getString("metric_data")
        ), service, metricType);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<BusinessMetricRow> getHistory(String service, String metricType,
                                               LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT * FROM " + TABLE +
                " WHERE service = ? AND metric_type = ?" +
                " AND timestamp >= ? AND timestamp < ?" +
                " ORDER BY timestamp ASC";
        return jdbc.query(sql, (rs, rowNum) -> new BusinessMetricRow(
                rs.getTimestamp("timestamp").toLocalDateTime(),
                rs.getString("service"),
                rs.getString("metric_type"),
                rs.getString("metric_data")
        ), service, metricType, from, to);
    }
}
