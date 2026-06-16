package com.mytutor.controllers;

import com.mytutor.dto.UserRequest;
import com.mytutor.model.User;
import com.mytutor.model.UserRole;
import com.mytutor.security.CurrentUser;
import com.mytutor.services.AccessService;
import com.mytutor.services.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService users;
  private final AccessService access;
  public UserController(UserService users, AccessService access) { this.users = users; this.access = access; }
  @GetMapping public List<User> findAll(CurrentUser currentUser) { access.requireAdmin(currentUser); return users.findAll(); }
  @GetMapping("/students") public List<User> findStudents(CurrentUser currentUser) { access.requireAdminOrTutor(currentUser); return users.findByRole(UserRole.STUDENT); }
  @GetMapping("/tutors") public List<User> findTutors(CurrentUser currentUser) { access.requireAdmin(currentUser); return users.findByRole(UserRole.TUTOR); }
  @GetMapping("/{id}") public User findById(@PathVariable Long id, CurrentUser currentUser) { access.requireAdminOrSelf(currentUser, id); return users.findById(id); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public User create(@Valid @RequestBody UserRequest request, CurrentUser currentUser) { access.requireAdmin(currentUser); return users.addUser(request); }
  @PutMapping("/{id}") public User edit(@PathVariable Long id, @Valid @RequestBody UserRequest request, CurrentUser currentUser) { access.requireAdmin(currentUser); return users.editUser(id, request); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id, CurrentUser currentUser) { access.requireAdmin(currentUser); users.deleteUser(id); }
}
