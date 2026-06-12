package com.mytutor.controllers;

import com.mytutor.dto.ApiError;
import com.mytutor.services.DomainException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(DomainException.class)
  public ResponseEntity<ApiError> domain(DomainException exception) {
    return ResponseEntity.status(exception.getStatus())
        .body(new ApiError(Instant.now(), exception.getStatus().value(), exception.getMessage(), Map.of()));
  }
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception) {
    Map<String, String> fields = new LinkedHashMap<>();
    exception.getBindingResult().getFieldErrors().forEach(error -> fields.put(error.getField(), error.getDefaultMessage()));
    return ResponseEntity.badRequest().body(new ApiError(Instant.now(), 400, "Niepoprawne dane", fields));
  }
}
