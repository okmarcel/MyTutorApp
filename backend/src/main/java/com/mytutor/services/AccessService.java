package com.mytutor.services;

import com.mytutor.model.Lesson;
import com.mytutor.model.TutoringGroup;
import com.mytutor.model.UserRole;
import com.mytutor.security.CurrentUser;
import org.springframework.stereotype.Service;

@Service
public class AccessService {
  private final GroupService groups;
  private final ScheduleService schedule;

  public AccessService(GroupService groups, ScheduleService schedule) {
    this.groups = groups;
    this.schedule = schedule;
  }

  public void requireAdmin(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.ADMIN) {
      throw DomainException.forbidden("Brak uprawnień administratora");
    }
  }

  public void requireAdminOrSelf(CurrentUser currentUser, Long userId) {
    if (currentUser.role() != UserRole.ADMIN && !currentUser.id().equals(userId)) {
      throw DomainException.forbidden("Brak dostępu do danych użytkownika");
    }
  }

  public void requireAdminOrTutorSelf(CurrentUser currentUser, Long tutorId) {
    if (currentUser.role() == UserRole.ADMIN) return;
    if (currentUser.role() == UserRole.TUTOR && currentUser.id().equals(tutorId)) return;
    throw DomainException.forbidden("Brak dostępu do danych korepetytora");
  }

  public void requireAdminOrStudentSelf(CurrentUser currentUser, Long studentId) {
    if (currentUser.role() == UserRole.ADMIN) return;
    if (currentUser.role() == UserRole.STUDENT && currentUser.id().equals(studentId)) return;
    throw DomainException.forbidden("Brak dostępu do zapisu kursanta");
  }

  public void requireAdminOrTutor(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.ADMIN && currentUser.role() != UserRole.TUTOR) {
      throw DomainException.forbidden("Brak uprawnień do tej operacji");
    }
  }

  public void requireAdminOrGroupTutor(CurrentUser currentUser, Long groupId) {
    if (currentUser.role() == UserRole.ADMIN) return;
    if (currentUser.role() == UserRole.TUTOR && isGroupTutor(currentUser.id(), groupId)) return;
    throw DomainException.forbidden("Brak dostępu do grupy");
  }

  public void requireAdminOrLessonTutor(CurrentUser currentUser, Long lessonId) {
    if (currentUser.role() == UserRole.ADMIN) return;
    Lesson lesson = schedule.findById(lessonId);
    TutoringGroup group = lesson.getGroup();
    if (currentUser.role() == UserRole.TUTOR && group.getTutor() != null && currentUser.id().equals(group.getTutor().getId())) {
      return;
    }
    throw DomainException.forbidden("Brak dostępu do zajęć");
  }

  public boolean isGroupTutor(Long tutorId, Long groupId) {
    TutoringGroup group = groups.findById(groupId);
    return group.getTutor() != null && tutorId.equals(group.getTutor().getId());
  }
}
