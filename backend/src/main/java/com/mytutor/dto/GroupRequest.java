package com.mytutor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record GroupRequest(
    @NotBlank String name,
    @NotBlank String level,
    @NotBlank String subject,
    @Min(1) int capacity,
    Long tutorId) {}
