package com.mytutor.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private User student;
  @ManyToOne(optional = false) private TutoringGroup group;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private EnrollmentStatus status;
  @Column(nullable = false) private LocalDateTime enrolledAt;

  protected Enrollment() {}
  public Enrollment(User student, TutoringGroup group) {
    this.student = student; this.group = group; this.status = EnrollmentStatus.ACTIVE; this.enrolledAt = LocalDateTime.now();
    group.addEnrollment(this);
  }
  public Long getId() { return id; }
  public User getStudent() { return student; }
  public TutoringGroup getGroup() { return group; }
  public EnrollmentStatus getStatus() { return status; }
  public LocalDateTime getEnrolledAt() { return enrolledAt; }
  public void cancel() { status = EnrollmentStatus.CANCELLED; }
  public void activate() { status = EnrollmentStatus.ACTIVE; enrolledAt = LocalDateTime.now(); }
}
