package com.mytutor.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "lessons")
public class Lesson {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private TutoringGroup group;
  @Column(nullable = false) private LocalDate date;
  @Column(nullable = false) private LocalTime startTime;
  @Column(nullable = false) private LocalTime endTime;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private LessonStatus status;
  @Column(columnDefinition = "TEXT") private String note;

  protected Lesson() {}
  public Lesson(TutoringGroup group, LocalDate date, LocalTime startTime, LocalTime endTime) {
    this.group = group; this.date = date; this.startTime = startTime; this.endTime = endTime; this.status = LessonStatus.PLANNED;
  }
  public Long getId() { return id; }
  public TutoringGroup getGroup() { return group; }
  public LocalDate getDate() { return date; }
  public LocalTime getStartTime() { return startTime; }
  public LocalTime getEndTime() { return endTime; }
  public LessonStatus getStatus() { return status; }
  public String getNote() { return note; }
  public void updateNote(String note) { this.note = note; }
  public boolean conflictsWith(Lesson lesson) {
    return status == LessonStatus.PLANNED && lesson.status == LessonStatus.PLANNED && date.equals(lesson.date)
        && startTime.isBefore(lesson.endTime) && lesson.startTime.isBefore(endTime);
  }
  public void update(TutoringGroup group, LocalDate date, LocalTime startTime, LocalTime endTime) {
    this.group = group; this.date = date; this.startTime = startTime; this.endTime = endTime;
  }
  public void cancel() { status = LessonStatus.CANCELLED; }
  public void complete() { status = LessonStatus.COMPLETED; }
}
