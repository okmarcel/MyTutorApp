package com.mytutor.repositories;

import com.mytutor.model.User;
import com.mytutor.model.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmailIgnoreCase(String email);
  List<User> findByRole(UserRole role);
}
