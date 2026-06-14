package com.mytutor.controllers;

import com.mytutor.dto.LoginRequest;
import com.mytutor.model.User;
import com.mytutor.repositories.UserRepository;
import com.mytutor.services.DomainException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  public AuthController(UserRepository users) { this.users = users; }

  @PostMapping("/login")
  public User login(@Valid @RequestBody LoginRequest request) {
    String email = request.email().trim();
    User user = users.findByEmailIgnoreCase(email)
        .orElseThrow(() -> DomainException.badRequest("Nieprawidłowy email lub hasło"));
    if (!user.getPasswordHash().equals(request.password())) {
      throw DomainException.badRequest("Nieprawidłowy email lub hasło");
    }
    return user;
  }
}
