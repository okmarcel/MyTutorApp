package com.mytutor.db;

import com.mytutor.api.dto.DashboardKpis;
import com.mytutor.api.dto.DashboardResponse;
import com.mytutor.api.dto.GroupRow;
import com.mytutor.api.dto.LessonRow;
import com.mytutor.api.dto.NotificationRow;
import com.mytutor.api.dto.StudentRow;
import com.mytutor.api.dto.TutorRow;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SchoolQueryService {
  private final JdbcTemplate jdbc;

  public SchoolQueryService(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public DashboardResponse dashboard(Instant now) {
    DashboardKpis kpis =
        new DashboardKpis(
            count("students"),
            count("tutors"),
            count("groups"),
            classesThisWeek(now));

    Instant start = now.truncatedTo(ChronoUnit.DAYS);
    Instant end = start.plus(1, ChronoUnit.DAYS);
    List<LessonRow> lessons = lessonsBetween(start, end);

    List<NotificationRow> notifications =
        jdbc.query(
            """
            select id, title, body, severity, created_at
            from notifications
            order by created_at desc
            limit 3
            """,
            (_rs, _row) -> mapNotification(_rs));

    return new DashboardResponse(kpis, lessons, notifications);
  }

  public List<LessonRow> scheduleWeek(Instant now) {
    Instant start = now.truncatedTo(ChronoUnit.DAYS);
    Instant end = start.plus(7, ChronoUnit.DAYS);
    return lessonsBetween(start, end);
  }

  public List<GroupRow> groups() {
    return jdbc.query(
        """
        select
          g.id,
          g.name,
          g.subject,
          g.level,
          g.schedule_hint,
          t.name as primary_tutor,
          (select count(*) from group_students gs where gs.group_id = g.id) as students_count
        from groups g
        join tutors t on t.id = g.primary_tutor_id
        order by g.name asc
        """,
        (rs, _row) ->
            new GroupRow(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("subject"),
                rs.getString("level"),
                rs.getInt("students_count"),
                rs.getString("primary_tutor"),
                rs.getString("schedule_hint")));
  }

  public List<StudentRow> students() {
    return jdbc.query(
        """
        select
          s.id,
          s.name,
          s.email,
          s.grade,
          s.guardian,
          s.status,
          (select count(*) from group_students gs where gs.student_id = s.id) as active_groups
        from students s
        order by s.name asc
        """,
        (rs, _row) ->
            new StudentRow(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("grade"),
                rs.getInt("active_groups"),
                rs.getString("guardian"),
                rs.getString("status")));
  }

  public List<TutorRow> tutors() {
    return jdbc.query(
        """
        select
          t.id,
          t.name,
          t.email,
          t.subjects,
          t.availability,
          t.status,
          (select count(*) from groups g where g.primary_tutor_id = t.id) as groups_count
        from tutors t
        order by t.name asc
        """,
        (rs, _row) ->
            new TutorRow(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("subjects"),
                rs.getInt("groups_count"),
                rs.getString("availability"),
                rs.getString("status")));
  }

  public List<NotificationRow> notifications() {
    return jdbc.query(
        """
        select id, title, body, severity, created_at
        from notifications
        order by created_at desc
        """,
        (rs, _row) -> mapNotification(rs));
  }

  private List<LessonRow> lessonsBetween(Instant start, Instant end) {
    return jdbc.query(
        """
        select
          l.id,
          l.start_at,
          l.end_at,
          g.name as group_name,
          l.subject,
          t.name as tutor_name,
          l.room,
          l.status
        from lessons l
        join groups g on g.id = l.group_id
        join tutors t on t.id = l.tutor_id
        where l.start_at >= ? and l.start_at < ?
        order by l.start_at asc
        """,
        (rs, _row) -> mapLesson(rs),
        Timestamp.from(start),
        Timestamp.from(end));
  }

  private int count(String table) {
    Integer v = jdbc.queryForObject("select count(*) from " + table, Integer.class);
    return v == null ? 0 : v;
  }

  private int classesThisWeek(Instant now) {
    Instant start = now.truncatedTo(ChronoUnit.DAYS);
    Instant end = start.plus(7, ChronoUnit.DAYS);
    Integer v =
        jdbc.queryForObject(
            "select count(*) from lessons where start_at >= ? and start_at < ?",
            Integer.class,
            Timestamp.from(start),
            Timestamp.from(end));
    return v == null ? 0 : v;
  }

  private static LessonRow mapLesson(ResultSet rs) throws java.sql.SQLException {
    return new LessonRow(
        rs.getLong("id"),
        rs.getTimestamp("start_at").toInstant().toString(),
        rs.getTimestamp("end_at").toInstant().toString(),
        rs.getString("group_name"),
        rs.getString("subject"),
        rs.getString("tutor_name"),
        rs.getString("room"),
        rs.getString("status"));
  }

  private static NotificationRow mapNotification(ResultSet rs) throws java.sql.SQLException {
    return new NotificationRow(
        rs.getLong("id"),
        rs.getString("title"),
        rs.getString("body"),
        rs.getString("severity"),
        rs.getTimestamp("created_at").toInstant().toString());
  }
}

