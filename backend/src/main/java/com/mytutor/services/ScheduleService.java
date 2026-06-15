package com.mytutor.services;

import com.mytutor.dto.LessonRequest;
import com.mytutor.model.*;
import com.mytutor.repositories.LessonRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ScheduleService {
  private final LessonRepository lessons;
  private final GroupService groups;
  private final ConflictService conflicts;
  private final NotificationService notifications;
  public ScheduleService(LessonRepository lessons, GroupService groups, ConflictService conflicts, NotificationService notifications) {
    this.lessons = lessons; this.groups = groups; this.conflicts = conflicts; this.notifications = notifications;
  }
  public List<Lesson> findAll() { return lessons.findAll(); }
  public Lesson findById(Long id) { return lessons.findById(id).orElseThrow(() -> DomainException.notFound("Lekcja nie istnieje")); }
  public List<Lesson> findLessonsForGroup(Long groupId) { return lessons.findByGroupId(groupId); }
  public List<Lesson> findLessonsForUser(Long userId) {
    List<Lesson> tutorLessons = lessons.findByGroupTutorId(userId);
    return tutorLessons.isEmpty() ? lessons.findActiveByStudentId(userId) : tutorLessons;
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
    TutoringGroup group = groups.findById(data.groupId());
    checkConflicts(group, data, id);
    lesson.update(group, data.date(), data.startTime(), data.endTime());
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
  }
  private void validateTimes(LessonRequest data) {
    if (!data.startTime().isBefore(data.endTime())) throw DomainException.badRequest("Godzina rozpoczęcia musi być wcześniejsza niż zakończenia");
  }
}
