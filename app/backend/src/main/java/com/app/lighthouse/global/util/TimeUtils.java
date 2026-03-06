package com.app.lighthouse.global.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class TimeUtils {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final ZoneId UTC = ZoneId.of("UTC");

    private TimeUtils() {}

    /** KST LocalDateTime → UTC LocalDateTime (쿼리 파라미터용) */
    public static LocalDateTime toUtc(LocalDateTime kst) {
        if (kst == null) return null;
        return kst.atZone(KST).withZoneSameInstant(UTC).toLocalDateTime();
    }

    /** UTC LocalDateTime → KST LocalDateTime (응답 변환용) */
    public static LocalDateTime toKst(LocalDateTime utc) {
        if (utc == null) return null;
        return utc.atZone(UTC).withZoneSameInstant(KST).toLocalDateTime();
    }

    /** 현재 시각을 UTC LocalDateTime으로 반환 */
    public static LocalDateTime nowUtc() {
        return ZonedDateTime.now(UTC).toLocalDateTime();
    }

    /** 현재 시각을 KST LocalDateTime으로 반환 */
    public static LocalDateTime nowKst() {
        return ZonedDateTime.now(KST).toLocalDateTime();
    }
}
