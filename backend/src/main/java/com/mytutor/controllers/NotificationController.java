package com.mytutor.controllers;

import com.mytutor.model.Notification;
import com.mytutor.services.NotificationService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notifications;
  public NotificationController(NotificationService notifications) { this.notifications = notifications; }
  @GetMapping public List<Notification> findAll() { return notifications.findAll(); }
  @GetMapping("/user/{userId}") public List<Notification> findForUser(@PathVariable Long userId) { return notifications.findByUserId(userId); }
  @PutMapping("/{notificationId}/read")
  public Notification markAsRead(@PathVariable Long notificationId, @RequestParam Long userId) { return notifications.markAsRead(notificationId, userId); }
}
