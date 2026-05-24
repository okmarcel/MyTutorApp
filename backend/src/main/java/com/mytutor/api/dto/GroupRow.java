package com.mytutor.api.dto;

public record GroupRow(
    long id,
    String name,
    String subject,
    String level,
    int studentsCount,
    String primaryTutor,
    String scheduleHint) {}

