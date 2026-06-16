package com.mytutor.services;

import static org.assertj.core.api.Assertions.*;

import com.mytutor.dto.*;
import com.mytutor.model.*;
import com.mytutor.security.CurrentUser;
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
  @Autowired AccessService access;

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

  @Test
  void editingUserData() {
    User student = user("Anna", "Student", "student3@example.com", UserRole.STUDENT);
    users.editUser(student.getId(), new UserRequest("Agnieszka", "Studentka", "student300@example.com", null, "secret", UserRole.STUDENT));
    assertThat(student.getFirstName()).isEqualTo("Agnieszka");
    assertThat(student.getLastName()).isEqualTo("Studentka");
    assertThat(student.getEmail()).isEqualTo("student300@example.com");
  }

  @Test
  void findExistingAndNonExistingUser(){
    User student = user("Anna", "Student", "student3@example.com", UserRole.STUDENT);
    assertThat(users.findById(student.getId())).isEqualTo(student);

    assertThatThrownBy(() -> users.findById(student.getId()+1))
        .isInstanceOf(DomainException.class).hasMessage("Użytkownik nie istnieje");

  }

  @Test
  void deleteUserAndTutorWithActiveGroups() {
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    User student = user("Anna", "Student", "student2@example.com", UserRole.STUDENT);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));

    assertThat(users.findById(student.getId())).isEqualTo(student);

    users.deleteUser(student.getId());

    assertThatThrownBy(() -> users.findById(student.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Użytkownik nie istnieje");

      assertThatThrownBy(() -> users.deleteUser(tutor.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Korepetytor prowadzi aktywne grupy");

  }

  @Test
  void addUsersWithTheSameEmails(){
    User student = user("Anna", "Student", "student2@example.com", UserRole.STUDENT);

    assertThatThrownBy(() -> user("Karol", "Student2", "student2@example.com", UserRole.STUDENT))
        .isInstanceOf(DomainException.class).hasMessage("Email jest już zajęty");
  }

  @Test
  void findExistingAndNonExistingLesson(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));
    LocalDate date = LocalDate.now().plusDays(1);

    Lesson lesson = schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));

    assertThat(schedule.findById(lesson.getId())).isEqualTo(lesson);

    assertThatThrownBy(() -> schedule.findById(lesson.getId()+1))
        .isInstanceOf(DomainException.class).hasMessage("Lekcja nie istnieje");

  }

  @Test
  void editingLessonData(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));
    TutoringGroup second = groups.createGroup(new GroupRequest("Grupa 2", "A2", "angielski", 5, tutor.getId()));
    LocalDate date = LocalDate.now().plusDays(1);

    Lesson lesson = schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));

    schedule.editLesson(lesson.getId(), new LessonRequest(second.getId(), date, LocalTime.of(9, 0), LocalTime.of(10, 0)));

    assertThat(lesson.getGroup()).isEqualTo(second);
    assertThat(lesson.getStartTime()).isEqualTo(LocalTime.of(9, 0));
    assertThat(lesson.getEndTime()).isEqualTo(LocalTime.of(10, 0));
    assertThat(notifications.findByUserId(tutor.getId()))
        .anyMatch(n -> n.getTitle().equals("Zmiana terminu zajęć"));
  }

  @Test
  void rejectsEditingLessonIntoStudentConflict() {
    User tutorA = user("Jan", "Tutor", "tutor_edit_a@example.com", UserRole.TUTOR);
    User tutorB = user("Piotr", "Tutor", "tutor_edit_b@example.com", UserRole.TUTOR);
    User student = user("Anna", "Student", "student_edit@example.com", UserRole.STUDENT);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutorA.getId()));
    TutoringGroup second = groups.createGroup(new GroupRequest("Grupa 2", "A2", "matematyka", 5, tutorB.getId()));
    enrollments.enrollStudent(student.getId(), first.getId());
    enrollments.enrollStudent(student.getId(), second.getId());
    LocalDate date = LocalDate.now().plusDays(1);
    schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));
    Lesson lesson = schedule.createLesson(new LessonRequest(second.getId(), date, LocalTime.of(12, 0), LocalTime.of(13, 0)));

    assertThatThrownBy(() -> schedule.editLesson(lesson.getId(), new LessonRequest(second.getId(), date, LocalTime.of(10, 30), LocalTime.of(11, 30))))
        .isInstanceOf(DomainException.class).hasMessageContaining("Termin koliduje z planem zajęć kursanta");
  }

  @Test
  void removeCompletedAndPlaneddLesson(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));
    LocalDate date = LocalDate.now().plusDays(1);

    Lesson lesson = schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));

    schedule.removeLesson(lesson.getId());

    assertThat(notifications.findByUserId(tutor.getId()))
        .anyMatch(n -> n.getTitle().equals("Zajęcia odwołane"));

    assertThat(schedule.findById(lesson.getId()).getStatus()).isEqualTo(LessonStatus.CANCELLED);

    lesson.complete();
    assertThatThrownBy(() -> schedule.removeLesson(lesson.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Nie można odwołać zakończonej lekcji");

  }

  @Test
  void createLessonWithStartTimeAfterEndTime(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));
    LocalDate date = LocalDate.now().plusDays(1);

    assertThatThrownBy(() -> schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(12, 0), LocalTime.of(11, 0))))
        .isInstanceOf(DomainException.class).hasMessage("Godzina rozpoczęcia musi być wcześniejsza niż zakończenia");

  }

  @Test
  void createLessonWithConflictsInGroup(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));
    LocalDate date = LocalDate.now().plusDays(1);

    schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));

    assertThatThrownBy(() -> schedule.createLesson(new LessonRequest(first.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0))))
        .isInstanceOf(DomainException.class).hasMessage("Termin koliduje z zajęciami grupy");

  }

  @Test
  void findExistingAndNonExistingGroup(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));

    assertThat(groups.findById(first.getId())).isEqualTo(first);

    assertThatThrownBy(() -> groups.findById(first.getId()+1))
        .isInstanceOf(DomainException.class).hasMessage("Grupa nie istnieje");
  }

  @Test
  void editGroupWithLowerCapacityThanStudentsEnrolled(){
    User tutor = user("Jan", "Tutor", "tutor@example.com", UserRole.TUTOR);
    User first = user("Anna", "Student", "anna@example.com", UserRole.STUDENT);
    User second = user("Ola", "Student", "ola@example.com", UserRole.STUDENT);
    TutoringGroup group = groups.createGroup(new GroupRequest("Matematyka A", "liceum", "matematyka", 2, tutor.getId()));

    enrollments.enrollStudent(first.getId(), group.getId());
    enrollments.enrollStudent(second.getId(), group.getId());

    assertThat(groups.editGroup(group.getId(), new GroupRequest("Matematyka A", "liceum", "matematyka", 3, tutor.getId())) ).isEqualTo(group);

    assertThatThrownBy(() -> groups.editGroup(group.getId(), new GroupRequest("Matematyka A", "liceum", "matematyka", 1, tutor.getId())) )
        .isInstanceOf(DomainException.class).hasMessage("Pojemność grupy jest mniejsza od liczby zapisanych kursantów");

  }

  @Test
  void makeGroupWithStudentAsTutor(){

    User first = user("Ola", "Student", "ola@example.com", UserRole.STUDENT);

     assertThatThrownBy(() -> groups.createGroup(new GroupRequest("Matematyka A", "liceum", "matematyka", 2, first.getId())) )
        .isInstanceOf(DomainException.class).hasMessage("Użytkownik nie jest korepetytorem");
  }

  @Test
  void removeTutorFromGroup(){
    User tutor = user("Jan", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    TutoringGroup first = groups.createGroup(new GroupRequest("Grupa 1", "A1", "angielski", 5, tutor.getId()));

    groups.removeTutor(first.getId());

    assertThat(first.getTutor() ).isEqualTo(null);

  }

  @Test
  void rejectsAssignStudentToGroupWithConflictingLesson() {
    User tutorA = user("Jan", "Tutor", "tutor1@example.com", UserRole.TUTOR);
    User tutorB = user("Piotr", "Tutor", "tutor2@example.com", UserRole.TUTOR);
    User student = user("Anna", "Student", "student@example.com", UserRole.STUDENT);

    TutoringGroup groupA = groups.createGroup(new GroupRequest("Grupa A", "A1", "chemia", 5, tutorA.getId()));
    TutoringGroup groupB = groups.createGroup(new GroupRequest("Grupa B", "A1", "chemia", 5, tutorB.getId()));

    LocalDate date = LocalDate.now().plusDays(1);
    schedule.createLesson(new LessonRequest(groupA.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));
    schedule.createLesson(new LessonRequest(groupB.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));
    enrollments.enrollStudent(student.getId(), groupA.getId());

    assertThatThrownBy(() -> groups.assignStudent(groupB.getId(), student.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Plan zajęć kursanta zawiera konflikt");
  }

  @Test
  void rejectsAssignTutorWithConflictingSchedule() {
    User tutor = user("Jan", "Tutor", "tutor_sc3@example.com", UserRole.TUTOR);
    User tutor2 = user("Piotr", "Tutor2", "tutor2_sc3@example.com", UserRole.TUTOR);

    TutoringGroup groupA = groups.createGroup(new GroupRequest("Grupa A", "A1", "historia", 5, tutor.getId()));
    TutoringGroup groupB = groups.createGroup(new GroupRequest("Grupa B", "A1", "historia", 5, null));

    LocalDate date = LocalDate.now().plusDays(1);
    schedule.createLesson(new LessonRequest(groupA.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));
    schedule.createLesson(new LessonRequest(groupB.getId(), date, LocalTime.of(10, 0), LocalTime.of(11, 0)));

    assertThatThrownBy(() -> groups.assignTutor(groupB.getId(), tutor.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Korepetytor ma zajęcia kolidujące z terminami tej grupy");
  }

  @Test
  void accessServiceRejectsUnauthorizedRoleOperations() {
    User tutor = user("Jan", "Tutor", "access_service_tutor@example.com", UserRole.TUTOR);
    User otherTutor = user("Piotr", "Tutor", "access_service_other_tutor@example.com", UserRole.TUTOR);
    User student = user("Anna", "Student", "access_service_student@example.com", UserRole.STUDENT);
    TutoringGroup group = groups.createGroup(new GroupRequest("Grupa", "A1", "historia", 5, tutor.getId()));

    assertThatThrownBy(() -> access.requireAdmin(new CurrentUser(student.getId(), student.getRole())))
        .isInstanceOf(DomainException.class).hasMessage("Brak uprawnień administratora");
    assertThatThrownBy(() -> access.requireAdminOrGroupTutor(new CurrentUser(otherTutor.getId(), otherTutor.getRole()), group.getId()))
        .isInstanceOf(DomainException.class).hasMessage("Brak dostępu do grupy");

    access.requireAdminOrGroupTutor(new CurrentUser(tutor.getId(), tutor.getRole()), group.getId());
  }

  @Test
  void savesAndRetrievesLessonNote() {
    User tutor = user("Jan", "Tutor", "tutor_sc4@example.com", UserRole.TUTOR);
    TutoringGroup group = groups.createGroup(new GroupRequest("Grupa", "A1", "biologia", 5, tutor.getId()));
    Lesson lesson = schedule.createLesson(new LessonRequest(group.getId(), LocalDate.now().plusDays(1), LocalTime.of(10, 0), LocalTime.of(11, 0)));

    schedule.updateNote(lesson.getId(), "Przynieść zeszyt");

    assertThat(schedule.findById(lesson.getId()).getNote()).isEqualTo("Przynieść zeszyt");
  }

  
  private User user(String firstName, String lastName, String email, UserRole role) {
    return users.addUser(new UserRequest(firstName, lastName, email, null, "secret", role));
  }
}
