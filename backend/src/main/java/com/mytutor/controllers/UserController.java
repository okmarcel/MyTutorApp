package com.mytutor.controllers;

import com.mytutor.dto.UserRequest;
import com.mytutor.model.User;
import com.mytutor.services.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService users;
  public UserController(UserService users) { this.users = users; }
  @GetMapping public List<User> findAll() { return users.findAll(); }
  @GetMapping("/{id}") public User findById(@PathVariable Long id) { return users.findById(id); }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public User create(@Valid @RequestBody UserRequest request) { return users.addUser(request); }
  @PutMapping("/{id}") public User edit(@PathVariable Long id, @Valid @RequestBody UserRequest request) { return users.editUser(id, request); }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { users.deleteUser(id); }
}
