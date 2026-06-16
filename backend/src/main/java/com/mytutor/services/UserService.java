package com.mytutor.services;

import com.mytutor.dto.UserRequest;
import com.mytutor.model.User;
import com.mytutor.model.UserRole;
import com.mytutor.repositories.GroupRepository;
import com.mytutor.repositories.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {
  private final UserRepository users;
  private final GroupRepository groups;
  public UserService(UserRepository users, GroupRepository groups) { this.users = users; this.groups = groups; }

  public List<User> findAll() { return users.findAll(); }
  public List<User> findByRole(UserRole role) { return users.findByRole(role); }
  public User findById(Long id) { return users.findById(id).orElseThrow(() -> DomainException.notFound("Użytkownik nie istnieje")); }
  public User addUser(UserRequest data) {
    validateUniqueEmail(data.email(), null);
    if (data.password() == null || data.password().isBlank()) throw DomainException.badRequest("Hasło jest wymagane");
    return users.save(new User(data.firstName(), data.lastName(), data.email(), data.phoneNumber(), data.password(), data.role()));
  }
  public User editUser(Long id, UserRequest data) {
    User user = findById(id);
    validateUniqueEmail(data.email(), id);
    user.update(data.firstName(), data.lastName(), data.email(), data.phoneNumber(), data.password(), data.role());
    return users.save(user);
  }
  public void deleteUser(Long id) {
    User user = findById(id);
    if (!groups.findByTutorId(id).isEmpty()) throw DomainException.conflict("Korepetytor prowadzi aktywne grupy");
    users.delete(user);
  }
  private void validateUniqueEmail(String email, Long editedId) {
    users.findByEmailIgnoreCase(email).filter(found -> !found.getId().equals(editedId))
        .ifPresent(found -> { throw DomainException.conflict("Email jest już zajęty"); });
  }
}
