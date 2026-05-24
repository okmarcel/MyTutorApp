package com.mytutor.api.dto;

public record DashboardKpis(
    int activeStudents, int tutors, int groupCount, int classesThisWeek) {}

