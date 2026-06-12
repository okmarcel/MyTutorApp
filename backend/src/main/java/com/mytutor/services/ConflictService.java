package com.mytutor.services;

import com.mytutor.model.Lesson;
import com.mytutor.repositories.LessonRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.stereotype.Service;

@Service
public class ConflictService {
  private final LessonRepository lessons;
  public ConflictService(LessonRepository lessons) { this.lessons = lessons; }
  public boolean checkTutorConflict(Long tutorId, LocalDate date, LocalTime start, LocalTime end, Long ignoredLessonId) {
    return lessons.findByGroupTutorId(tutorId).stream().anyMatch(l -> conflicts(l, date, start, end, ignoredLessonId));
  }
  public boolean checkGroupConflict(Long groupId, LocalDate date, LocalTime start, LocalTime end, Long ignoredLessonId) {
    return lessons.findByGroupId(groupId).stream().anyMatch(l -> conflicts(l, date, start, end, ignoredLessonId));
  }
  public boolean checkStudentConflict(Long studentId, LocalDate date, LocalTime start, LocalTime end) {
    return lessons.findActiveByStudentId(studentId).stream().anyMatch(l -> conflicts(l, date, start, end, null));
  }
  private boolean conflicts(Lesson existing, LocalDate date, LocalTime start, LocalTime end, Long ignoredId) {
    return (ignoredId == null || !existing.getId().equals(ignoredId))
        && existing.conflictsWith(new Lesson(existing.getGroup(), date, start, end));
  }
}
