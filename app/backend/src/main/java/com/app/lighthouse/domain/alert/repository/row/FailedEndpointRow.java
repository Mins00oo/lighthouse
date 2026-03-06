package com.app.lighthouse.domain.alert.repository.row;

public record FailedEndpointRow(
        String httpMethod,
        String httpPath,
        String service
) {
}
