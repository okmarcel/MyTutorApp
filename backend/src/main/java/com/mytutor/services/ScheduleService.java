package com.mytutor.services;

import com.mytutor.dto.LessonRequest;
import com.mytutor.model.*;
import com.mytutor.repositories.EnrollmentRepository;
import com.mytutor.repositories.LessonRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ScheduleService {
  private final LessonRepository lessons;
  private final EnrollmentRepository enrollments;
  private final GroupService groups;
  private final UserService users;
  private final ConflictService conflicts;
  private final NotificationService notifications;
  public ScheduleService(LessonRepository lessons, EnrollmentRepository enrollments, GroupService groups, UserService users, ConflictService conflicts, NotificationService notifications) {
    this.lessons = lessons; this.enrollments = enrollments; this.groups = groups; this.users = users; this.conflicts = conflicts; this.notifications = notifications;
  }
  public List<Lesson> findAll() { return lessons.findAll(); }
  public Lesson findById(Long id) { return lessons.findById(id).orElseThrow(() -> DomainException.notFound("Lekcja nie istnieje")); }
  public List<Lesson> findLessonsForGroup(Long groupId) { return lessons.findByGroupId(groupId); }
  public List<Lesson> findLessonsForUser(Long userId) {
    User user = users.findById(userId);
    if (user.getRole() == UserRole.TUTOR || user.getRole() == UserRole.ADMIN) {
      return lessons.findByGroupTutorId(userId);
    }
    return lessons.findActiveByStudentId(userId);
  }
  public Lesson createLesson(LessonRequest data) {
    validateTimes(data);
    TutoringGroup group = groups.findById(data.groupId());
    checkConflicts(group, data, null);
    Lesson lesson = lessons.save(new Lesson(group, data.date(), data.startTime(), data.endTime()));
    notifications.notifyLessonCreated(lesson);
    return lesson;
  }
  public Lesson editLesson(Long id, LessonRequest data) {
    validateTimes(data);
    Lesson lesson = findById(id);
    if (lesson.getStatus() == LessonStatus.COMPLETED) throw DomainException.conflict("Nie można edytować zakończonej lekcji");
    TutoringGroup oldGroup = lesson.getGroup();
    LocalDate oldDate = lesson.getDate();
    LocalTime oldStartTime = lesson.getStartTime();
    LocalTime oldEndTime = lesson.getEndTime();
    TutoringGroup group = groups.findById(data.groupId());
    checkConflicts(group, data, id);
    lesson.update(group, data.date(), data.startTime(), data.endTime());
    lesson = lessons.save(lesson);
    notifications.notifyLessonUpdated(lesson, oldGroup, oldDate, oldStartTime, oldEndTime);
    return lesson;
  }
  public Lesson updateNote(Long id, String note) {
    Lesson lesson = findById(id);
    lesson.updateNote(note);
    return lessons.save(lesson);
  }
  public void removeLesson(Long id) {
    Lesson lesson = findById(id);
    if (lesson.getStatus() == LessonStatus.COMPLETED) throw DomainException.conflict("Nie można odwołać zakończonej lekcji");
    lesson.cancel();
    lessons.save(lesson);
    notifications.notifyLessonCancelled(lesson);
  }
  private void checkConflicts(TutoringGroup group, LessonRequest data, Long ignoredId) {
    if (conflicts.checkGroupConflict(group.getId(), data.date(), data.startTime(), data.endTime(), ignoredId))
      throw DomainException.conflict("Termin koliduje z zajęciami grupy");
    if (group.getTutor() != null && conflicts.checkTutorConflict(group.getTutor().getId(), data.date(), data.startTime(), data.endTime(), ignoredId))
      throw DomainException.conflict("Termin koliduje z zajęciami korepetytora");
    enrollments.findByGroupId(group.getId()).stream()
        .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
        .forEach(e -> {
          if (conflicts.checkStudentConflict(e.getStudent().getId(), data.date(), data.startTime(), data.endTime(), ignoredId))
            throw DomainException.conflict("Termin koliduje z planem zajęć kursanta: " + e.getStudent().getFirstName() + " " + e.getStudent().getLastName());
        });
  }
  private void validateTimes(LessonRequest data) {
    if (!data.startTime().isBefore(data.endTime())) throw DomainException.badRequest("Godzina rozpoczęcia musi być wcześniejsza niż zakończenia");
  }
}
