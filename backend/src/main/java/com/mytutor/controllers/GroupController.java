package com.mytutor.controllers;

import com.mytutor.dto.GroupRequest;
import com.mytutor.model.Enrollment;
import com.mytutor.model.TutoringGroup;
import com.mytutor.model.UserRole;
import com.mytutor.security.CurrentUser;
import com.mytutor.services.AccessService;
import com.mytutor.services.DomainException;
import com.mytutor.services.GroupService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
  private final GroupService groups;
  private final AccessService access;
  public GroupController(GroupService groups, AccessService access) { this.groups = groups; this.access = access; }
  @GetMapping public List<TutoringGroup> findAll(CurrentUser currentUser) {
    if (currentUser.role() == UserRole.TUTOR) return groups.findByTutorId(currentUser.id());
    return groups.findAll();
  }
  @GetMapping("/tutor/{tutorId}") public List<TutoringGroup> findForTutor(@PathVariable Long tutorId, CurrentUser currentUser) {
    access.requireAdminOrTutorSelf(currentUser, tutorId);
    return groups.findByTutorId(tutorId);
  }
  @GetMapping("/{id}") public TutoringGroup findById(@PathVariable Long id, CurrentUser currentUser) {
    if (currentUser.role() == UserRole.TUTOR) access.requireAdminOrGroupTutor(currentUser, id);
    return groups.findById(id);
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public TutoringGroup create(@Valid @RequestBody GroupRequest request, CurrentUser currentUser) {
    access.requireAdminOrTutor(currentUser);
    if (currentUser.role() == UserRole.TUTOR) {
      if (request.tutorId() != null && !request.tutorId().equals(currentUser.id())) {
        throw DomainException.forbidden("Korepetytor może tworzyć tylko własne grupy");
      }
      return groups.createGroup(new GroupRequest(request.name(), request.level(), request.subject(), request.capacity(), currentUser.id()));
    }
    return groups.createGroup(request);
  }
  @PutMapping("/{id}") public TutoringGroup edit(@PathVariable Long id, @Valid @RequestBody GroupRequest request, CurrentUser currentUser) {
    access.requireAdminOrGroupTutor(currentUser, id);
    if (currentUser.role() == UserRole.TUTOR && request.tutorId() != null && !request.tutorId().equals(currentUser.id())) {
      throw DomainException.forbidden("Korepetytor nie może przepisać grupy do innego korepetytora");
    }
    return groups.editGroup(id, request);
  }
  @PostMapping("/{groupId}/students/{studentId}") public Enrollment assignStudent(@PathVariable Long groupId, @PathVariable Long studentId, CurrentUser currentUser) { access.requireAdminOrGroupTutor(currentUser, groupId); return groups.assignStudent(groupId, studentId); }
  @DeleteMapping("/{groupId}/students/{studentId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void removeStudent(@PathVariable Long groupId, @PathVariable Long studentId, CurrentUser currentUser) { access.requireAdminOrGroupTutor(currentUser, groupId); groups.removeStudent(groupId, studentId); }
  @PutMapping("/{groupId}/tutor/{tutorId}") public TutoringGroup assignTutor(@PathVariable Long groupId, @PathVariable Long tutorId, CurrentUser currentUser) { access.requireAdmin(currentUser); return groups.assignTutor(groupId, tutorId); }
  @DeleteMapping("/{groupId}/tutor") public TutoringGroup removeTutor(@PathVariable Long groupId, CurrentUser currentUser) { access.requireAdmin(currentUser); return groups.removeTutor(groupId); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id, CurrentUser currentUser) { access.requireAdminOrGroupTutor(currentUser, id); groups.deleteGroup(id); }
}
