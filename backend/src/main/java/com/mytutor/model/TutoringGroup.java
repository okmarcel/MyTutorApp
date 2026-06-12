package com.mytutor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tutoring_groups")
public class TutoringGroup {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String name;
  @Column(nullable = false) private String level;
  @Column(nullable = false) private String subject;
  @Column(nullable = false) private int capacity;
  @ManyToOne private User tutor;
  @JsonIgnore @OneToMany(mappedBy = "group", cascade = CascadeType.REMOVE) private List<Enrollment> enrollments = new ArrayList<>();
  @JsonIgnore @OneToMany(mappedBy = "group", cascade = CascadeType.REMOVE) private List<Lesson> lessons = new ArrayList<>();

  protected TutoringGroup() {}
  public TutoringGroup(String name, String level, String subject, int capacity, User tutor) {
    this.name = name; this.level = level; this.subject = subject; this.capacity = capacity; this.tutor = tutor;
  }
  public Long getId() { return id; }
  public String getName() { return name; }
  public String getLevel() { return level; }
  public String getSubject() { return subject; }
  public int getCapacity() { return capacity; }
  public User getTutor() { return tutor; }
  public List<Enrollment> getEnrollments() { return enrollments; }
  public void addEnrollment(Enrollment enrollment) { enrollments.add(enrollment); }
  public boolean hasFreePlaces() {
    return enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE).count() < capacity;
  }
  public void update(String name, String level, String subject, int capacity) {
    this.name = name; this.level = level; this.subject = subject; this.capacity = capacity;
  }
  public void assignTutor(User tutor) { this.tutor = tutor; }
  public void removeTutor() { this.tutor = null; }
}
