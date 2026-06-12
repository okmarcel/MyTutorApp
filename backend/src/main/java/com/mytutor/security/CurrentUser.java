package com.mytutor.security;

import com.mytutor.model.UserRole;

public record CurrentUser(Long id, UserRole role) {}
