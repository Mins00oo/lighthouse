package com.app.lighthouse.domain.alert.service;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class CooldownManager {

    private final ConcurrentHashMap<String, Instant> lastSentMap = new ConcurrentHashMap<>();
    private final Set<String> activeAlerts = ConcurrentHashMap.newKeySet();

    public boolean canSend(String key, long cooldownMs) {
        Instant lastSent = lastSentMap.get(key);
        if (lastSent == null) {
            return true;
        }
        return Instant.now().toEpochMilli() - lastSent.toEpochMilli() >= cooldownMs;
    }

    public void record(String key) {
        lastSentMap.put(key, Instant.now());
        activeAlerts.add(key);
    }

    public boolean wasTriggered(String key) {
        return activeAlerts.contains(key);
    }

    public void clearTrigger(String key) {
        activeAlerts.remove(key);
    }
}
