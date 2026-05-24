package com.mytutor.api;

import com.mytutor.api.dto.DashboardResponse;
import com.mytutor.api.dto.GroupRow;
import com.mytutor.api.dto.LessonRow;
import com.mytutor.api.dto.NotificationRow;
import com.mytutor.api.dto.StudentRow;
import com.mytutor.api.dto.TutorRow;
import com.mytutor.db.SchoolQueryService;
import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SchoolController {
  private final SchoolQueryService queries;

  public SchoolController(SchoolQueryService queries) {
    this.queries = queries;
  }

  @GetMapping("/dashboard")
  public DashboardResponse dashboard() {
    return queries.dashboard(Instant.now());
  }

  @GetMapping("/schedule/week")
  public List<LessonRow> scheduleWeek() {
    return queries.scheduleWeek(Instant.now());
  }

  @GetMapping("/groups")
  public List<GroupRow> groups() {
    return queries.groups();
  }

  @GetMapping("/students")
  public List<StudentRow> students() {
    return queries.students();
  }

  @GetMapping("/tutors")
  public List<TutorRow> tutors() {
    return queries.tutors();
  }

  @GetMapping("/notifications")
  public List<NotificationRow> notifications() {
    return queries.notifications();
  }
}

