package com.mytutor.services;

import com.mytutor.model.*;
import com.mytutor.repositories.EnrollmentRepository;
import com.mytutor.repositories.LessonRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EnrollmentService {
  private final EnrollmentRepository enrollments;
  private final LessonRepository lessons;
  private final GroupService groups;
  private final UserService users;
  private final ConflictService conflicts;
  private final NotificationService notifications;
  public EnrollmentService(EnrollmentRepository enrollments, LessonRepository lessons, GroupService groups, UserService users, ConflictService conflicts, NotificationService notifications) {
    this.enrollments = enrollments; this.lessons = lessons; this.groups = groups; this.users = users; this.conflicts = conflicts; this.notifications = notifications;
  }
  public List<Enrollment> findByStudentId(Long studentId) { return enrollments.findByStudentId(studentId); }
  public Enrollment enrollStudent(Long studentId, Long groupId) {
    TutoringGroup group = groups.findById(groupId);
    User student = users.findById(studentId);
    if (student.getRole() != UserRole.STUDENT) throw DomainException.badRequest("Użytkownik nie jest kursantem");
    if (!group.hasFreePlaces()) throw DomainException.conflict("Brak wolnych miejsc");
    Enrollment existing = enrollments.findByStudentId(studentId).stream().filter(e -> e.getGroup().getId().equals(groupId)).findFirst().orElse(null);
    if (existing != null && existing.getStatus() == EnrollmentStatus.ACTIVE) throw DomainException.conflict("Kursant jest już zapisany");
    boolean collision = lessons.findByGroupId(groupId).stream().filter(l -> l.getStatus() == LessonStatus.PLANNED)
        .anyMatch(l -> conflicts.checkStudentConflict(studentId, l.getDate(), l.getStartTime(), l.getEndTime()));
    if (collision) throw DomainException.conflict("Plan zajęć kursanta zawiera konflikt");
    Enrollment enrollment = existing == null ? new Enrollment(student, group) : existing;
    enrollment.activate();
    enrollment = enrollments.save(enrollment);
    notifications.notifyEnrollmentChanged(enrollment);
    return enrollment;
  }
  public void resignStudent(Long studentId, Long groupId) {
    Enrollment enrollment = enrollments.findByStudentId(studentId).stream()
        .filter(e -> e.getGroup().getId().equals(groupId) && e.getStatus() == EnrollmentStatus.ACTIVE).findFirst()
        .orElseThrow(() -> DomainException.notFound("Aktywny zapis nie istnieje"));
    enrollment.cancel();
    enrollments.save(enrollment);
    notifications.notifyEnrollmentChanged(enrollment);
  }
}
