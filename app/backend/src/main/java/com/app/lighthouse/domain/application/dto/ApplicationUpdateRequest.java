package com.app.lighthouse.domain.application.dto;

import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationUpdateRequest {

    @Size(max = 200)
    private String displayName;

    @Size(max = 1000)
    private String description;

    private String status;
}
