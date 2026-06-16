package com.mytutor.controllers;

import com.mytutor.dto.LessonRequest;
import com.mytutor.model.Lesson;
import com.mytutor.model.UserRole;
import com.mytutor.security.CurrentUser;
import com.mytutor.services.AccessService;
import com.mytutor.services.ScheduleService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
public class ScheduleController {
  private final ScheduleService schedule;
  private final AccessService access;
  public ScheduleController(ScheduleService schedule, AccessService access) { this.schedule = schedule; this.access = access; }
  @GetMapping public List<Lesson> findAll(CurrentUser currentUser) { access.requireAdmin(currentUser); return schedule.findAll(); }
  @GetMapping("/{id}") public Lesson findById(@PathVariable Long id, CurrentUser currentUser) {
    if (currentUser.role() == UserRole.TUTOR) access.requireAdminOrLessonTutor(currentUser, id);
    return schedule.findById(id);
  }
  @GetMapping("/user/{userId}") public List<Lesson> findForUser(@PathVariable Long userId, CurrentUser currentUser) { access.requireAdminOrSelf(currentUser, userId); return schedule.findLessonsForUser(userId); }
  @GetMapping("/group/{groupId}") public List<Lesson> findForGroup(@PathVariable Long groupId, CurrentUser currentUser) {
    if (currentUser.role() == UserRole.TUTOR) access.requireAdminOrGroupTutor(currentUser, groupId);
    return schedule.findLessonsForGroup(groupId);
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Lesson create(@Valid @RequestBody LessonRequest request, CurrentUser currentUser) { access.requireAdminOrGroupTutor(currentUser, request.groupId()); return schedule.createLesson(request); }
  @PutMapping("/{id}") public Lesson edit(@PathVariable Long id, @Valid @RequestBody LessonRequest request, CurrentUser currentUser) { access.requireAdminOrLessonTutor(currentUser, id); access.requireAdminOrGroupTutor(currentUser, request.groupId()); return schedule.editLesson(id, request); }
  @PutMapping("/{id}/note") public Lesson updateNote(@PathVariable Long id, @RequestBody Map<String, String> body, CurrentUser currentUser) { access.requireAdminOrLessonTutor(currentUser, id); return schedule.updateNote(id, body.get("note")); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancel(@PathVariable Long id, CurrentUser currentUser) { access.requireAdminOrLessonTutor(currentUser, id); schedule.removeLesson(id); }
}
