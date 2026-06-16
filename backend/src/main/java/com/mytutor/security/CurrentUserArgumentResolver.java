package com.mytutor.security;

import com.mytutor.model.User;
import com.mytutor.model.UserRole;
import com.mytutor.repositories.UserRepository;
import com.mytutor.services.DomainException;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {
  private static final String USER_ID_HEADER = "X-User-Id";
  private static final String USER_ROLE_HEADER = "X-User-Role";

  private final UserRepository users;

  public CurrentUserArgumentResolver(UserRepository users) {
    this.users = users;
  }

  @Override
  public boolean supportsParameter(MethodParameter parameter) {
    return parameter.getParameterType().equals(CurrentUser.class);
  }

  @Override
  public Object resolveArgument(
      MethodParameter parameter,
      ModelAndViewContainer mavContainer,
      NativeWebRequest webRequest,
      WebDataBinderFactory binderFactory) {
    String rawUserId = webRequest.getHeader(USER_ID_HEADER);
    if (rawUserId == null || rawUserId.isBlank()) {
      throw DomainException.unauthorized("Brak danych zalogowanego użytkownika");
    }

    Long userId;
    try {
      userId = Long.valueOf(rawUserId);
    } catch (NumberFormatException exception) {
      throw DomainException.unauthorized("Niepoprawne dane zalogowanego użytkownika");
    }

    User user = users.findById(userId)
        .orElseThrow(() -> DomainException.unauthorized("Użytkownik nie jest zalogowany"));

    String rawRole = webRequest.getHeader(USER_ROLE_HEADER);
    if (rawRole != null && !rawRole.isBlank()) {
      try {
        UserRole requestedRole = UserRole.valueOf(rawRole);
        if (requestedRole != user.getRole()) {
          throw DomainException.forbidden("Rola użytkownika nie zgadza się z kontem");
        }
      } catch (IllegalArgumentException exception) {
        throw DomainException.unauthorized("Niepoprawna rola zalogowanego użytkownika");
      }
    }

    return new CurrentUser(user.getId(), user.getRole());
  }
}
