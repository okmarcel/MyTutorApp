package com.mytutor.services;

import static org.assertj.core.api.Assertions.*;

import com.mytutor.dto.*;
import com.mytutor.model.*;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class MyTutorServicesTest {
  @Autowired UserService users;
  @Autowired GroupService groups;
  @Autowired ScheduleService schedule;
  @Autowired EnrollmentService enrollments;
  @Autowired NotificationService notifications;

  @Test
  void createsDomainAndRejectsDuplicateEnrollmentAndFullGroup() {
    User tutor = user("Jan", "Tutor", "tutor@example.com", UserRole.TUTOR);
    User first = user("Anna", "Student", "anna@example.com", UserRole.STUDENT);
    User second = user("Ola", "Student", "ola@example.com", UserRole.STUDENT);
    TutoringGroup group = groups.createGroup(new GroupRequest("Matematyka A", "liceum", "matematyka", 1, tutor.getId()));

    Enrollment enrollment = enrollments.enrollStudent(first.getId(), group.getId());

    assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
    assertThatThrownBy(() -> enrollments.enrollStudent(first.getId(), group.getId())).isInstanceOf(DomainException.class);
    assertThatThrownBy(() -> enrollments.enrollStudent(second.getId(), group.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Brak wolnych miejsc");
  }

  @Test
  void rejectsTutorAndGroupScheduleConflictsAndCreatesNotifications() {
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    User student = user("Anna", "Student", "student2@example.com", UserRole.STUDENT);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));
    TutoringGroup second = groups.createGroup(new GroupRequest("Grupa 2", "A2", "angielski", 5, tutor.getId()));
    enrollments.enrollStudent(student.getId(), first.getId());
    LocalDate date = LocalDate.now().plusDays(1);

    Lesson lesson = schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));

    assertThat(lesson.getStatus()).isEqualTo(LessonStatus.PLANNED);
    assertThat(notifications.findByUserId(student.getId())).anyMatch(n -> n.getTitle().equals("Nowe zajęcia"));
    assertThatThrownBy(() -> schedule.createLesson(new LessonRequest(second.getId(), date, LocalTime.of(10, 30), LocalTime.of(11, 30))))
        .isInstanceOf(DomainException.class).hasMessage("Termin koliduje z zajęciami korepetytora");
  }

  @Test
  void cancelsEnrollmentAndMarksNotificationAsReadOnlyOnce() {
    User student = user("Anna", "Student", "student3@example.com", UserRole.STUDENT);
    TutoringGroup group = groups.createGroup(new GroupRequest("Grupa", "podstawowy", "fizyka", 2, null));
    enrollments.enrollStudent(student.getId(), group.getId());
    enrollments.resignStudent(student.getId(), group.getId());
    Notification notification = notifications.findByUserId(student.getId()).getFirst();

    assertThat(enrollments.findByStudentId(student.getId()).getFirst().getStatus()).isEqualTo(EnrollmentStatus.CANCELLED);
    assertThat(notifications.markAsRead(notification.getId(), student.getId()).getStatus()).isEqualTo(NotificationStatus.READ);
    assertThatThrownBy(() -> notifications.markAsRead(notification.getId(), student.getId())).isInstanceOf(DomainException.class);
  }

  private User user(String firstName, String lastName, String email, UserRole role) {
    return users.addUser(new UserRequest(firstName, lastName, email, null, "secret", role));
  }
}
