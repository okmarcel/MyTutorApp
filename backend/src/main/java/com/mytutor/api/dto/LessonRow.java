package com.mytutor.api.dto;

public record LessonRow(
    long id,
    String startAt,
    String endAt,
    String groupName,
    String subject,
    String tutorName,
    String room,
    String status) {}

