package com.mytutor.controllers;

import com.mytutor.model.Enrollment;
import com.mytutor.security.CurrentUser;
import com.mytutor.services.AccessService;
import com.mytutor.services.EnrollmentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
  private final EnrollmentService enrollments;
  private final AccessService access;
  public EnrollmentController(EnrollmentService enrollments, AccessService access) { this.enrollments = enrollments; this.access = access; }
  @GetMapping public List<Enrollment> findAll(CurrentUser currentUser) { access.requireAdmin(currentUser); return enrollments.findAll(); }
  @GetMapping("/student/{studentId}") public List<Enrollment> findForStudent(@PathVariable Long studentId, CurrentUser currentUser) { access.requireAdminOrStudentSelf(currentUser, studentId); return enrollments.findByStudentId(studentId); }
  @GetMapping("/group/{groupId}") public List<Enrollment> findForGroup(@PathVariable Long groupId, CurrentUser currentUser) { access.requireAdminOrGroupTutor(currentUser, groupId); return enrollments.findByGroupId(groupId); }
  @PostMapping("/student/{studentId}/group/{groupId}") @ResponseStatus(HttpStatus.CREATED)
  public Enrollment enroll(@PathVariable Long studentId, @PathVariable Long groupId, CurrentUser currentUser) { access.requireAdminOrStudentSelf(currentUser, studentId); return enrollments.enrollStudent(studentId, groupId); }
  @DeleteMapping("/student/{studentId}/group/{groupId}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resign(@PathVariable Long studentId, @PathVariable Long groupId, CurrentUser currentUser) { access.requireAdminOrStudentSelf(currentUser, studentId); enrollments.resignStudent(studentId, groupId); }
}
