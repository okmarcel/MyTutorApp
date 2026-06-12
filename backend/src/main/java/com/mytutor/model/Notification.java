package com.mytutor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) @JsonIgnore private User user;
  @Column(nullable = false) private String title;
  @Column(nullable = false, length = 2000) private String content;
  @Column(nullable = false) private LocalDateTime createdAt;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private NotificationStatus status;

  protected Notification() {}
  public Notification(User user, String title, String content) {
    this.user = user; this.title = title; this.content = content; this.createdAt = LocalDateTime.now(); this.status = NotificationStatus.UNREAD;
  }
  public Long getId() { return id; }
  public User getUser() { return user; }
  public String getTitle() { return title; }
  public String getContent() { return content; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public NotificationStatus getStatus() { return status; }
  public void markAsRead() { status = NotificationStatus.READ; }
}
