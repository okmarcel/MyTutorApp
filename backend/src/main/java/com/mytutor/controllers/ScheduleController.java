package com.mytutor.controllers;

import com.mytutor.dto.LessonRequest;
import com.mytutor.model.Lesson;
import com.mytutor.services.ScheduleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
public class ScheduleController {
  private final ScheduleService schedule;
  public ScheduleController(ScheduleService schedule) { this.schedule = schedule; }
  @GetMapping public List<Lesson> findAll() { return schedule.findAll(); }
  @GetMapping("/{id}") public Lesson findById(@PathVariable Long id) { return schedule.findById(id); }
  @GetMapping("/user/{userId}") public List<Lesson> findForUser(@PathVariable Long userId) { return schedule.findLessonsForUser(userId); }
  @GetMapping("/group/{groupId}") public List<Lesson> findForGroup(@PathVariable Long groupId) { return schedule.findLessonsForGroup(groupId); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public Lesson create(@Valid @RequestBody LessonRequest request) { return schedule.createLesson(request); }
  @PutMapping("/{id}") public Lesson edit(@PathVariable Long id, @Valid @RequestBody LessonRequest request) { return schedule.editLesson(id, request); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancel(@PathVariable Long id) { schedule.removeLesson(id); }
}
