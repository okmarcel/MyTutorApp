package com.mytutor.api.dto;

public record TutorRow(
    long id,
    String name,
    String email,
    String subjects,
    int groupsCount,
    String availability,
    String status) {}

