package com.mytutor.repositories;

import com.mytutor.model.Lesson;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
  List<Lesson> findByGroupId(Long groupId);
  List<Lesson> findByGroupTutorId(Long tutorId);
  @Query("select distinct l from Lesson l join l.group.enrollments e where e.student.id = :studentId and e.status = com.mytutor.model.EnrollmentStatus.ACTIVE")
  List<Lesson> findActiveByStudentId(Long studentId);
  List<Lesson> findByDateBetweenOrderByDateAscStartTimeAsc(LocalDate from, LocalDate to);
}
