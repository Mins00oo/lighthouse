package com.app.lighthouse.global.util;

import java.util.HashMap;
import java.util.Map;

public class PrometheusTextParser {

    /**
     * Prometheus exposition format 텍스트를 파싱하여 메트릭명→값 맵으로 반환.
     * 라벨이 있는 메트릭은 동일 metric_name 기준으로 합산(sum).
     */
    public static Map<String, Double> parse(String text) {
        Map<String, Double> result = new HashMap<>();
        if (text == null || text.isBlank()) return result;

        for (String line : text.split("\n")) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) continue;

            String metricName;
            double value;

            int braceStart = line.indexOf('{');
            if (braceStart >= 0) {
                // 라벨 있는 메트릭: metric_name{labels} value
                metricName = line.substring(0, braceStart);
                int braceEnd = line.indexOf('}');
                if (braceEnd < 0) continue;
                String valueStr = line.substring(braceEnd + 1).trim();
                value = parseValue(valueStr);
            } else {
                // 라벨 없는 메트릭: metric_name value
                String[] parts = line.split("\\s+");
                if (parts.length < 2) continue;
                metricName = parts[0];
                value = parseValue(parts[1]);
            }

            if (Double.isNaN(value) || Double.isInfinite(value)) continue;

            // 동일 metric_name은 합산 (라벨별 값을 sum)
            result.merge(metricName, value, Double::sum);
        }

        return result;
    }

    private static double parseValue(String s) {
        try {
            return Double.parseDouble(s.trim());
        } catch (NumberFormatException e) {
            return Double.NaN;
        }
    }
}
