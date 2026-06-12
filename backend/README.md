# MyTutor Backend

Backend Spring Boot zbudowany według diagramów w `specyfikacja/`.

## Uruchomienie

```bash
./gradlew bootRun
```

Domyślnie aplikacja używa bazy H2 w pamięci. Konfigurację można nadpisać standardowymi
zmiennymi Spring Boot.

## Główne zasoby REST

- `/api/users`
- `/api/groups`
- `/api/lessons`
- `/api/enrollments`
- `/api/notifications`
- `/api/health`
