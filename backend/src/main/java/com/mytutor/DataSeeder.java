package com.mytutor;

import com.mytutor.model.*;
import com.mytutor.repositories.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

  private final UserRepository users;
  private final GroupRepository groups;
  private final EnrollmentRepository enrollments;
  private final LessonRepository lessons;
  private final NotificationRepository notifications;

  public DataSeeder(UserRepository users, GroupRepository groups,
                    EnrollmentRepository enrollments, LessonRepository lessons,
                    NotificationRepository notifications) {
    this.users = users;
    this.groups = groups;
    this.enrollments = enrollments;
    this.lessons = lessons;
    this.notifications = notifications;
  }

  @Override
  public void run(String... args) {
    if (users.count() > 0) return;

    User admin = users.save(new User("Jan", "Kowalski", "admin@mytutor.pl", "500100200", "admin123", UserRole.ADMIN));
    User tutor1 = users.save(new User("Anna", "Nowak", "anna.nowak@mytutor.pl", "501200300", "tutor123", UserRole.TUTOR));
    User tutor2 = users.save(new User("Piotr", "Wiśniewski", "piotr.w@mytutor.pl", "502300400", "tutor123", UserRole.TUTOR));
    User student1 = users.save(new User("Katarzyna", "Zielińska", "kasia.z@student.pl", "600100200", "student123", UserRole.STUDENT));
    User student2 = users.save(new User("Michał", "Lewandowski", "michal.l@student.pl", "601200300", "student123", UserRole.STUDENT));
    User student3 = users.save(new User("Aleksandra", "Wójcik", "ola.w@student.pl", "602300400", "student123", UserRole.STUDENT));
    User student4 = users.save(new User("Tomasz", "Kamiński", "tomek.k@student.pl", "603400500", "student123", UserRole.STUDENT));
    User student5 = users.save(new User("Magdalena", "Szymańska", "magda.s@student.pl", "604500600", "student123", UserRole.STUDENT));

    TutoringGroup mathBasic = groups.save(new TutoringGroup("Matematyka — Podstawy", "Podstawowy", "Matematyka", 8, tutor1));
    TutoringGroup mathAdv = groups.save(new TutoringGroup("Matematyka — Matura", "Zaawansowany", "Matematyka", 6, tutor1));
    TutoringGroup engB2 = groups.save(new TutoringGroup("Angielski B2", "Średniozaawansowany", "Angielski", 10, tutor2));
    TutoringGroup physics = groups.save(new TutoringGroup("Fizyka — Mechanika", "Podstawowy", "Fizyka", 6, tutor2));
    TutoringGroup chemEmpty = groups.save(new TutoringGroup("Chemia — Organiczna", "Zaawansowany", "Chemia", 5, null));

    enrollments.save(new Enrollment(student1, mathBasic));
    enrollments.save(new Enrollment(student2, mathBasic));
    enrollments.save(new Enrollment(student3, mathBasic));
    enrollments.save(new Enrollment(student4, mathBasic));

    enrollments.save(new Enrollment(student1, mathAdv));
    enrollments.save(new Enrollment(student5, mathAdv));

    enrollments.save(new Enrollment(student2, engB2));
    enrollments.save(new Enrollment(student3, engB2));
    enrollments.save(new Enrollment(student4, engB2));
    enrollments.save(new Enrollment(student5, engB2));

    enrollments.save(new Enrollment(student1, physics));
    enrollments.save(new Enrollment(student3, physics));

    LocalDate today = LocalDate.now();
    LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1L);

    lessons.save(new Lesson(mathBasic, monday, LocalTime.of(9, 0), LocalTime.of(10, 30)));
    lessons.save(new Lesson(mathAdv, monday, LocalTime.of(11, 0), LocalTime.of(12, 30)));
    lessons.save(new Lesson(engB2, monday.plusDays(1), LocalTime.of(14, 0), LocalTime.of(15, 30)));
    lessons.save(new Lesson(physics, monday.plusDays(2), LocalTime.of(10, 0), LocalTime.of(11, 30)));
    lessons.save(new Lesson(mathBasic, monday.plusDays(3), LocalTime.of(9, 0), LocalTime.of(10, 30)));
    lessons.save(new Lesson(engB2, monday.plusDays(3), LocalTime.of(14, 0), LocalTime.of(15, 30)));
    lessons.save(new Lesson(physics, monday.plusDays(4), LocalTime.of(10, 0), LocalTime.of(11, 30)));

    LocalDate nextMonday = monday.plusDays(7);
    lessons.save(new Lesson(mathBasic, nextMonday, LocalTime.of(9, 0), LocalTime.of(10, 30)));
    lessons.save(new Lesson(mathAdv, nextMonday.plusDays(1), LocalTime.of(11, 0), LocalTime.of(12, 30)));
    lessons.save(new Lesson(engB2, nextMonday.plusDays(2), LocalTime.of(14, 0), LocalTime.of(15, 30)));

    notifications.save(new Notification(admin, "Nowy kursant w systemie", "Katarzyna Zielinska zostala dodana do systemu."));
    notifications.save(new Notification(admin, "Grupa zapelniona", "Grupa Matematyka - Podstawy osiagnela 50% zajetosci."));
    notifications.save(new Notification(tutor1, "Nowe zajecia", "Dodano zajecia z Matematyki na poniedzialek."));
    notifications.save(new Notification(tutor1, "Nowy kursant", "Magdalena Szymanska zapisala sie do grupy Matematyka - Matura."));
    notifications.save(new Notification(student1, "Potwierdzenie zapisu", "Zostales zapisana do grupy Matematyka - Podstawy."));
    notifications.save(new Notification(student1, "Przypomnienie", "Jutro o 9:00 masz zajecia z Matematyki."));
    notifications.save(new Notification(student2, "Potwierdzenie zapisu", "Zostales zapisany do grupy Angielski B2."));
  }
}
