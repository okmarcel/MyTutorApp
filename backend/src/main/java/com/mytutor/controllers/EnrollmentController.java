package com.mytutor.controllers;

import com.mytutor.model.Enrollment;
import com.mytutor.services.EnrollmentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
  private final EnrollmentService enrollments;
  public EnrollmentController(EnrollmentService enrollments) { this.enrollments = enrollments; }
  @GetMapping("/student/{studentId}") public List<Enrollment> findForStudent(@PathVariable Long studentId) { return enrollments.findByStudentId(studentId); }
  @PostMapping("/student/{studentId}/group/{groupId}") @ResponseStatus(HttpStatus.CREATED)
  public Enrollment enroll(@PathVariable Long studentId, @PathVariable Long groupId) { return enrollments.enrollStudent(studentId, groupId); }
  @DeleteMapping("/student/{studentId}/group/{groupId}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resign(@PathVariable Long studentId, @PathVariable Long groupId) { enrollments.resignStudent(studentId, groupId); }
}
