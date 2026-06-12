# Frontend

Typescript + React frontend codebase for MyTutor.

## Running

```
npm install
npm run dev
```

Then open the URL shown in your terminal (default: `http://localhost:5173`).

## Backend API (dev)

The frontend expects the Spring Boot backend on `http://localhost:8080` and uses a Vite dev proxy for `/api/*`.
Start the backend first with `cd ../backend && ./gradlew bootRun`.
