package com.mytutor.services;

import com.mytutor.dto.GroupRequest;
import com.mytutor.model.*;
import com.mytutor.repositories.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GroupService {
  private final GroupRepository groups;
  private final UserService users;
  private final EnrollmentRepository enrollments;
  private final LessonRepository lessons;
  private final NotificationService notifications;
  public GroupService(GroupRepository groups, UserService users, EnrollmentRepository enrollments, LessonRepository lessons, NotificationService notifications) {
    this.groups = groups; this.users = users; this.enrollments = enrollments; this.lessons = lessons; this.notifications = notifications;
  }
  public List<TutoringGroup> findAll() { return groups.findAll(); }
  public TutoringGroup findById(Long id) { return groups.findById(id).orElseThrow(() -> DomainException.notFound("Grupa nie istnieje")); }
  public TutoringGroup createGroup(GroupRequest data) {
    User tutor = data.tutorId() == null ? null : requireTutor(data.tutorId());
    return groups.save(new TutoringGroup(data.name(), data.level(), data.subject(), data.capacity(), tutor));
  }
  public TutoringGroup editGroup(Long id, GroupRequest data) {
    TutoringGroup group = findById(id);
    long active = enrollments.findByGroupId(id).stream().filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE).count();
    if (data.capacity() < active) throw DomainException.conflict("Pojemność grupy jest mniejsza od liczby zapisanych kursantów");
    group.update(data.name(), data.level(), data.subject(), data.capacity());
    if (data.tutorId() != null) group.assignTutor(requireTutor(data.tutorId()));
    return groups.save(group);
  }
  public Enrollment assignStudent(Long groupId, Long studentId) {
    TutoringGroup group = findById(groupId);
    User student = users.findById(studentId);
    if (student.getRole() != UserRole.STUDENT) throw DomainException.badRequest("Użytkownik nie jest kursantem");
    Enrollment existing = enrollments.findByStudentId(studentId).stream().filter(e -> e.getGroup().getId().equals(groupId)).findFirst().orElse(null);
    if (existing != null && existing.getStatus() == EnrollmentStatus.ACTIVE) throw DomainException.conflict("Kursant jest już przypisany do grupy");
    if (!group.hasFreePlaces()) throw DomainException.conflict("Brak wolnych miejsc");
    Enrollment enrollment = existing == null ? new Enrollment(student, group) : existing;
    enrollment.activate();
    enrollment = enrollments.save(enrollment);
    notifications.notifyEnrollmentChanged(enrollment);
    return enrollment;
  }
  public void removeStudent(Long groupId, Long studentId) {
    findById(groupId);
    Enrollment enrollment = enrollments.findByStudentId(studentId).stream()
        .filter(e -> e.getGroup().getId().equals(groupId) && e.getStatus() == EnrollmentStatus.ACTIVE).findFirst()
        .orElseThrow(() -> DomainException.notFound("Aktywny zapis nie istnieje"));
    enrollment.cancel();
    enrollments.save(enrollment);
    notifications.notifyEnrollmentChanged(enrollment);
  }
  public TutoringGroup assignTutor(Long groupId, Long tutorId) {
    TutoringGroup group = findById(groupId);
    group.assignTutor(requireTutor(tutorId));
    return groups.save(group);
  }
  public TutoringGroup removeTutor(Long groupId) {
    TutoringGroup group = findById(groupId);
    group.removeTutor();
    return groups.save(group);
  }
  public void deleteGroup(Long groupId) {
    TutoringGroup group = findById(groupId);
    lessons.findByGroupId(groupId).stream().filter(l -> l.getStatus() == LessonStatus.PLANNED).forEach(l -> {
      l.cancel(); lessons.save(l); notifications.notifyLessonCancelled(l);
    });
    groups.delete(group);
  }
  private User requireTutor(Long id) {
    User tutor = users.findById(id);
    if (tutor.getRole() != UserRole.TUTOR) throw DomainException.badRequest("Użytkownik nie jest korepetytorem");
    return tutor;
  }
}
