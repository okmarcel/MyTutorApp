package com.mytutor.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record LessonRequest(
    @NotNull Long groupId,
    @NotNull LocalDate date,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime) {}
