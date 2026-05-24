package com.mytutor.api.dto;

public record StudentRow(
    long id,
    String name,
    String email,
    String grade,
    int activeGroups,
    String guardian,
    String status) {}

