package com.mytutor.repositories;

import com.mytutor.model.Enrollment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
  List<Enrollment> findByStudentId(Long studentId);
  List<Enrollment> findByGroupId(Long groupId);
}
