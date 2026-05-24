package com.mytutor.api;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("db")
public class DbPingController {
  private final JdbcTemplate jdbc;

  public DbPingController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @GetMapping("/api/db/ping")
  public Map<String, Object> ping() {
    String ts =
        jdbc.queryForObject("select now()::text as ts", (rs, _rowNum) -> rs.getString("ts"));
    return Map.of("ok", true, "dbTs", ts);
  }
}
