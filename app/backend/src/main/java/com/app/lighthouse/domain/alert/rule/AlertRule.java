package com.app.lighthouse.domain.alert.rule;

import java.util.List;

import com.app.lighthouse.domain.alert.dto.AlertResult;

public interface AlertRule {

    List<AlertResult> evaluate();

    String ruleType();
}
