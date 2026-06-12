package com.mytutor.controllers;

import com.mytutor.dto.GroupRequest;
import com.mytutor.model.Enrollment;
import com.mytutor.model.TutoringGroup;
import com.mytutor.services.GroupService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
  private final GroupService groups;
  public GroupController(GroupService groups) { this.groups = groups; }
  @GetMapping public List<TutoringGroup> findAll() { return groups.findAll(); }
  @GetMapping("/{id}") public TutoringGroup findById(@PathVariable Long id) { return groups.findById(id); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public TutoringGroup create(@Valid @RequestBody GroupRequest request) { return groups.createGroup(request); }
  @PutMapping("/{id}") public TutoringGroup edit(@PathVariable Long id, @Valid @RequestBody GroupRequest request) { return groups.editGroup(id, request); }
  @PostMapping("/{groupId}/students/{studentId}") public Enrollment assignStudent(@PathVariable Long groupId, @PathVariable Long studentId) { return groups.assignStudent(groupId, studentId); }
  @DeleteMapping("/{groupId}/students/{studentId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void removeStudent(@PathVariable Long groupId, @PathVariable Long studentId) { groups.removeStudent(groupId, studentId); }
  @PutMapping("/{groupId}/tutor/{tutorId}") public TutoringGroup assignTutor(@PathVariable Long groupId, @PathVariable Long tutorId) { return groups.assignTutor(groupId, tutorId); }
  @DeleteMapping("/{groupId}/tutor") public TutoringGroup removeTutor(@PathVariable Long groupId) { return groups.removeTutor(groupId); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { groups.deleteGroup(id); }
}
