package com.mytutor.services;

import com.mytutor.model.*;
import com.mytutor.repositories.NotificationRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {
  private final NotificationRepository notifications;
  public NotificationService(NotificationRepository notifications) { this.notifications = notifications; }

  public List<Notification> findAll() { return notifications.findAll(); }
  public List<Notification> findByUserId(Long userId) { return notifications.findByUserIdOrderByCreatedAtDesc(userId); }
  public Notification markAsRead(Long notificationId, Long userId) {
    Notification notification = notifications.findById(notificationId)
        .orElseThrow(() -> DomainException.notFound("Powiadomienie nie istnieje"));
    if (!notification.getUser().getId().equals(userId)) throw DomainException.notFound("Powiadomienie nie istnieje");
    if (notification.getStatus() == NotificationStatus.READ) throw DomainException.conflict("Powiadomienie zostało już odczytane");
    notification.markAsRead();
    return notifications.save(notification);
  }
  public void notifyLessonCreated(Lesson lesson) {
    notifyGroup(lesson.getGroup(), "Nowe zajęcia", describe(lesson, "utworzone"));
  }
  public void notifyLessonCancelled(Lesson lesson) {
    notifyGroup(lesson.getGroup(), "Zajęcia odwołane", describe(lesson, "odwołane"));
  }
  public void notifyLessonUpdated(Lesson lesson, TutoringGroup oldGroup, LocalDate oldDate, LocalTime oldStartTime, LocalTime oldEndTime) {
    String oldTerm = oldGroup.getName() + " " + oldDate + " " + oldStartTime + "-" + oldEndTime;
    String newTerm = lesson.getGroup().getName() + " " + lesson.getDate() + " " + lesson.getStartTime() + "-" + lesson.getEndTime();
    if (oldGroup.getId().equals(lesson.getGroup().getId())) {
      notifyGroup(lesson.getGroup(), "Zmiana terminu zajęć", "Termin zajęć grupy " + oldTerm + " został zmieniony na " + newTerm);
      return;
    }
    notifyGroup(oldGroup, "Zmiana terminu zajęć", "Zajęcia grupy " + oldTerm + " zostały przeniesione do grupy " + newTerm);
    notifyGroup(lesson.getGroup(), "Zmiana terminu zajęć", "Do harmonogramu dodano przeniesione zajęcia: " + newTerm);
  }
  public void notifyEnrollmentChanged(Enrollment enrollment) {
    save(enrollment.getStudent(), "Zmiana zapisu", "Status zapisu do grupy " + enrollment.getGroup().getName() + ": " + enrollment.getStatus());
    if (enrollment.getGroup().getTutor() != null) {
      save(enrollment.getGroup().getTutor(), "Zmiana składu grupy", enrollment.getStudent().getFullName() + ": " + enrollment.getStatus());
    }
  }
  private void notifyGroup(TutoringGroup group, String title, String content) {
    if (group.getTutor() != null) save(group.getTutor(), title, content);
    group.getEnrollments().stream().filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
        .forEach(e -> save(e.getStudent(), title, content));
  }
  private Notification save(User user, String title, String content) {
    return notifications.save(new Notification(user, title, content));
  }
  private String describe(Lesson lesson, String action) {
    return "Zajęcia grupy " + lesson.getGroup().getName() + " " + lesson.getDate() + " " + lesson.getStartTime() + " zostały " + action;
  }
}
