package com.mytutor.controllers;

import com.mytutor.model.Notification;
import com.mytutor.security.CurrentUser;
import com.mytutor.services.AccessService;
import com.mytutor.services.NotificationService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notifications;
  private final AccessService access;
  public NotificationController(NotificationService notifications, AccessService access) { this.notifications = notifications; this.access = access; }
  @GetMapping public List<Notification> findAll(CurrentUser currentUser) { access.requireAdmin(currentUser); return notifications.findAll(); }
  @GetMapping("/user/{userId}") public List<Notification> findForUser(@PathVariable Long userId, CurrentUser currentUser) { access.requireAdminOrSelf(currentUser, userId); return notifications.findByUserId(userId); }
  @PutMapping("/{notificationId}/read")
  public Notification markAsRead(@PathVariable Long notificationId, @RequestParam Long userId, CurrentUser currentUser) { access.requireAdminOrSelf(currentUser, userId); return notifications.markAsRead(notificationId, userId); }
}
