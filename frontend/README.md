# MyTutor Frontend

Frontend React + TypeScript zbudowany według prototypu `My_tutor_hi-fi.pdf`.

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`.

## Połączenie z backendem

Frontend korzysta z backendu Spring Boot dostępnego pod adresem `http://localhost:8080`.
Podczas pracy lokalnej żądania `/api/*` są przekazywane do backendu przez proxy Vite.

Przed uruchomieniem frontendu należy uruchomić backend:

```bash
cd ../backend
./gradlew bootRun
```

## Weryfikacja

```bash
npm run typecheck
npm run build
```
