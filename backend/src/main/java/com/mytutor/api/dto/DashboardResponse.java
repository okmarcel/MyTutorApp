package com.mytutor.api.dto;

import java.util.List;

public record DashboardResponse(
    DashboardKpis kpis, List<LessonRow> todaysLessons, List<NotificationRow> notifications) {}

