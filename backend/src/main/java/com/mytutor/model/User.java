package com.mytutor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String firstName;
  @Column(nullable = false) private String lastName;
  @Column(nullable = false, unique = true) private String email;
  private String phoneNumber;
  @JsonIgnore @Column(nullable = false) private String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private UserRole role;
  @JsonIgnore @OneToMany(mappedBy = "student", cascade = CascadeType.REMOVE) private List<Enrollment> enrollments = new ArrayList<>();
  @JsonIgnore @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE) private List<Notification> notifications = new ArrayList<>();

  protected User() {}

  public User(String firstName, String lastName, String email, String phoneNumber, String passwordHash, UserRole role) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  public Long getId() { return id; }
  public String getFirstName() { return firstName; }
  public String getLastName() { return lastName; }
  public String getEmail() { return email; }
  public String getPhoneNumber() { return phoneNumber; }
  public String getPasswordHash() { return passwordHash; }
  public UserRole getRole() { return role; }
  public String getFullName() { return firstName + " " + lastName; }
  public void update(String firstName, String lastName, String email, String phoneNumber, String passwordHash, UserRole role) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    if (passwordHash != null && !passwordHash.isBlank()) this.passwordHash = passwordHash;
    this.role = role;
  }
}
