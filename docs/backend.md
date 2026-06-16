# Dokumentacja implementacji backendu

## Cel backendu

Backend aplikacji MyTutor udostepnia REST API do obslugi platformy korepetycyjnej. Odpowiada za:

- zarzadzanie uzytkownikami,
- logowanie uzytkownikow,
- zarzadzanie grupami korepetycyjnymi,
- przypisywanie korepetytorow i kursantow do grup,
- zapisy i rezygnacje z grup,
- zarzadzanie harmonogramem zajec,
- wykrywanie konfliktow terminow,
- tworzenie i odczytywanie powiadomien,
- obsluge bledow domenowych i walidacyjnych.

Implementacja znajduje sie w katalogu `backend/src/main/java/com/mytutor`.

## Technologie i konfiguracja

- Backend zostal zaimplementowany w Javie z uzyciem Spring Boot.
- Projekt korzysta z Gradle Kotlin DSL, a konfiguracja znajduje sie w `backend/build.gradle.kts`.
- Zastosowane glowne zaleznosci:
  - `spring-boot-starter-web` - obsluga REST API,
  - `spring-boot-starter-validation` - walidacja danych wejsciowych DTO,
  - `spring-boot-starter-actuator` - funkcje techniczne Spring Boot,
  - `spring-boot-starter-data-jpa` - persystencja danych przez JPA,
  - `spring-boot-starter-flyway` - zaleznosc przygotowana pod migracje bazodanowe,
  - `postgresql` - sterownik PostgreSQL,
  - `h2` - baza w pamieci uzywana w domyslnej konfiguracji,
  - `spring-boot-starter-test` - zaleznosci testowe.
- Projekt jest skonfigurowany na Java Toolchain w wersji 25.
- Glowna klasa startowa aplikacji to `MyTutorApplication`.

## Konfiguracja bazy danych

Konfiguracja znajduje sie w `backend/src/main/resources/application.yml`.

- Aplikacja domyslnie uzywa bazy H2 w pamieci:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:mytutor;DB_CLOSE_DELAY=-1
    username: sa
    password:
```

- Hibernate ma ustawione `ddl-auto: create-drop`, dlatego schemat bazy jest tworzony przy starcie aplikacji i usuwany po jej zatrzymaniu.
- `open-in-view` jest ustawione na `false`, co ogranicza dostep do sesji JPA poza warstwa transakcyjna.
- Flyway jest wylaczony przez `flyway.enabled: false`.

## Struktura pakietow

- `com.mytutor` - klasa startowa aplikacji oraz seeder danych.
- `com.mytutor.controllers` - kontrolery REST, obsluga endpointow i mapowanie zadan HTTP.
- `com.mytutor.dto` - rekordy DTO wykorzystywane jako dane wejsciowe i format bledu API.
- `com.mytutor.model` - encje JPA oraz typy enum opisujace model domenowy.
- `com.mytutor.repositories` - repozytoria Spring Data JPA.
- `com.mytutor.services` - logika biznesowa aplikacji.
- `com.mytutor.security` - prosty rekord `CurrentUser`, przygotowany pod reprezentacje aktualnego uzytkownika.

## Model domenowy

### User

Encja `User` reprezentuje uzytkownika systemu.

- Pola:
  - `id` - identyfikator generowany przez baze,
  - `firstName` - imie,
  - `lastName` - nazwisko,
  - `email` - unikalny adres e-mail,
  - `phoneNumber` - opcjonalny numer telefonu,
  - `passwordHash` - haslo przechowywane w polu ukrytym przed serializacja JSON,
  - `role` - rola uzytkownika.
- Role sa opisane enumem `UserRole`:
  - `ADMIN`,
  - `TUTOR`,
  - `STUDENT`.
- Encja ma relacje:
  - jeden uzytkownik moze miec wiele zapisow jako student,
  - jeden uzytkownik moze miec wiele powiadomien.
- Metoda `getFullName()` zwraca imie i nazwisko w jednym lancuchu.
- Metoda `update(...)` aktualizuje dane uzytkownika; haslo jest zmieniane tylko wtedy, gdy przekazano niepusta wartosc.

### TutoringGroup

Encja `TutoringGroup` reprezentuje grupe korepetycyjna.

- Pola:
  - `id`,
  - `name` - nazwa grupy,
  - `level` - poziom zajec,
  - `subject` - przedmiot,
  - `capacity` - pojemnosc grupy,
  - `tutor` - przypisany korepetytor, opcjonalny.
- Relacje:
  - grupa moze miec jednego korepetytora,
  - grupa ma liste zapisow kursantow,
  - grupa ma liste lekcji.
- Metoda `getActiveEnrollmentCount()` zlicza aktywne zapisy.
- Metoda `hasFreePlaces()` sprawdza, czy liczba aktywnych zapisow jest mniejsza niz pojemnosc.
- Metoda `getFreePlaces()` udostepnia wynik `hasFreePlaces()` dla serializacji JSON.
- Metody `assignTutor(...)` i `removeTutor()` sluza do zarzadzania korepetytorem grupy.

### Enrollment

Encja `Enrollment` reprezentuje zapis kursanta do grupy.

- Pola:
  - `id`,
  - `student`,
  - `group`,
  - `status`,
  - `enrolledAt`.
- Status zapisu opisuje enum `EnrollmentStatus`:
  - `ACTIVE`,
  - `CANCELLED`.
- Nowy zapis jest tworzony ze statusem `ACTIVE`.
- Metoda `cancel()` zmienia status na `CANCELLED`.
- Metoda `activate()` przywraca status `ACTIVE` i aktualizuje date zapisu.

### Lesson

Encja `Lesson` reprezentuje pojedyncze zajecia.

- Pola:
  - `id`,
  - `group`,
  - `date`,
  - `startTime`,
  - `endTime`,
  - `status`,
  - `note`.
- Status lekcji opisuje enum `LessonStatus`:
  - `PLANNED`,
  - `CANCELLED`,
  - `COMPLETED`.
- Nowa lekcja jest tworzona ze statusem `PLANNED`.
- Metoda `conflictsWith(...)` sprawdza konflikt terminow dwoch planowanych lekcji na tej samej dacie. Konflikt wystepuje, gdy przedzialy czasowe nachodza na siebie.
- Metoda `update(...)` zmienia grupe, date i godziny lekcji.
- Metody `cancel()` i `complete()` zmieniaja status lekcji.
- Metoda `updateNote(...)` zapisuje notatke do lekcji.

### Notification

Encja `Notification` reprezentuje powiadomienie uzytkownika.

- Pola:
  - `id`,
  - `user`,
  - `title`,
  - `content`,
  - `createdAt`,
  - `status`.
- Status powiadomienia opisuje enum `NotificationStatus`:
  - `UNREAD`,
  - `READ`.
- Nowe powiadomienie ma status `UNREAD`.
- Metoda `markAsRead()` oznacza powiadomienie jako przeczytane.

## Warstwa DTO i walidacja

DTO sa zaimplementowane jako rekordy Javy w pakiecie `com.mytutor.dto`.

- `UserRequest`
  - przyjmuje dane uzytkownika: imie, nazwisko, e-mail, telefon, haslo i role,
  - wykorzystuje walidacje `@NotBlank`, `@Email` i `@NotNull`.
- `GroupRequest`
  - przyjmuje dane grupy: nazwe, poziom, przedmiot, pojemnosc i opcjonalne `tutorId`,
  - wymaga niepustych pol tekstowych,
  - wymaga pojemnosci co najmniej 1 przez `@Min(1)`.
- `LessonRequest`
  - przyjmuje `groupId`, date, godzine rozpoczecia i godzine zakonczenia,
  - wszystkie pola sa wymagane przez `@NotNull`.
- `LoginRequest`
  - przyjmuje e-mail i haslo,
  - wymaga poprawnego formatu e-maila oraz niepustego hasla.
- `ApiError`
  - opisuje ujednolicony format odpowiedzi bledow,
  - zawiera timestamp, status HTTP, komunikat i mape bledow pol.

## Repozytoria

Repozytoria dziedzicza po `JpaRepository`, dzieki czemu zapewniaja standardowe operacje CRUD.

- `UserRepository`
  - `findByEmailIgnoreCase(String email)` - wyszukiwanie uzytkownika po e-mailu bez rozrozniania wielkosci liter,
  - `findByRole(UserRole role)` - wyszukiwanie po roli.
- `GroupRepository`
  - `findByTutorId(Long tutorId)` - pobieranie grup prowadzonych przez korepetytora.
- `EnrollmentRepository`
  - `findByStudentId(Long studentId)` - zapisy danego kursanta,
  - `findByGroupId(Long groupId)` - zapisy w danej grupie.
- `LessonRepository`
  - `findByGroupId(Long groupId)` - lekcje danej grupy,
  - `findByGroupTutorId(Long tutorId)` - lekcje grup prowadzonych przez danego korepetytora,
  - `findActiveByStudentId(Long studentId)` - lekcje kursanta wynikajace z aktywnych zapisow,
  - `findByDateBetweenOrderByDateAscStartTimeAsc(...)` - lekcje z zakresu dat posortowane po dacie i godzinie.
- `NotificationRepository`
  - `findByUserIdOrderByCreatedAtDesc(Long userId)` - powiadomienia uzytkownika od najnowszych.

## Warstwa serwisow

Serwisy zawieraja glowna logike biznesowa. Wiekszosc serwisow jest oznaczona `@Transactional`, dzieki czemu operacje modyfikujace dane wykonywane sa w transakcjach.

### UserService

`UserService` odpowiada za zarzadzanie uzytkownikami.

- `findAll()` zwraca liste wszystkich uzytkownikow.
- `findById(Long id)` wyszukuje uzytkownika albo rzuca `DomainException.notFound("Użytkownik nie istnieje")`.
- `addUser(UserRequest data)`:
  - sprawdza unikalnosc e-maila,
  - wymaga podania hasla,
  - zapisuje nowego uzytkownika.
- `editUser(Long id, UserRequest data)`:
  - pobiera uzytkownika,
  - sprawdza, czy nowy e-mail nie nalezy do innego uzytkownika,
  - aktualizuje dane.
- `deleteUser(Long id)`:
  - blokuje usuniecie korepetytora, ktory prowadzi aktywne grupy,
  - usuwa uzytkownika, jesli nie narusza to reguly biznesowej.

### GroupService

`GroupService` odpowiada za zarzadzanie grupami, przypisaniami kursantow i korepetytorow.

- `findAll()` zwraca wszystkie grupy.
- `findById(Long id)` pobiera grupe albo rzuca blad `Grupa nie istnieje`.
- `createGroup(GroupRequest data)`:
  - opcjonalnie pobiera korepetytora,
  - weryfikuje, czy wskazany uzytkownik ma role `TUTOR`,
  - tworzy grupe.
- `editGroup(Long id, GroupRequest data)`:
  - blokuje zmniejszenie pojemnosci ponizej liczby aktywnie zapisanych kursantow,
  - aktualizuje podstawowe dane grupy,
  - przy zmianie korepetytora sprawdza konflikty jego grafiku.
- `assignStudent(Long groupId, Long studentId)`:
  - sprawdza, czy uzytkownik jest kursantem,
  - blokuje ponowne aktywne przypisanie do tej samej grupy,
  - sprawdza wolne miejsca,
  - sprawdza konflikty planu kursanta z lekcjami grupy,
  - aktywuje istniejacy anulowany zapis albo tworzy nowy,
  - wysyla powiadomienie o zmianie zapisu.
- `removeStudent(Long groupId, Long studentId)`:
  - wyszukuje aktywny zapis,
  - zmienia status na `CANCELLED`,
  - wysyla powiadomienie.
- `assignTutor(Long groupId, Long tutorId)`:
  - sprawdza konflikty korepetytora z lekcjami grupy,
  - weryfikuje role `TUTOR`,
  - przypisuje korepetytora.
- `removeTutor(Long groupId)` usuwa korepetytora z grupy.
- `deleteGroup(Long groupId)`:
  - odwoluje zaplanowane lekcje grupy,
  - wysyla powiadomienia o odwolaniu lekcji,
  - usuwa grupe.

### EnrollmentService

`EnrollmentService` obsluguje zapisy i rezygnacje wykonywane bezposrednio przez endpointy zapisow.

- `findByStudentId(Long studentId)` zwraca zapisy kursanta.
- `enrollStudent(Long studentId, Long groupId)`:
  - pobiera grupe i uzytkownika,
  - wymaga roli `STUDENT`,
  - sprawdza wolne miejsca,
  - blokuje ponowny aktywny zapis,
  - sprawdza konflikty planu kursanta,
  - aktywuje istniejacy zapis lub tworzy nowy,
  - zapisuje dane i wysyla powiadomienie.
- `resignStudent(Long studentId, Long groupId)`:
  - wyszukuje aktywny zapis,
  - anuluje go przez status `CANCELLED`,
  - wysyla powiadomienie.

### ScheduleService

`ScheduleService` odpowiada za lekcje i harmonogram.

- `findAll()` zwraca wszystkie lekcje.
- `findById(Long id)` pobiera lekcje albo rzuca blad `Lekcja nie istnieje`.
- `findLessonsForGroup(Long groupId)` zwraca lekcje danej grupy.
- `findLessonsForUser(Long userId)`:
  - dla `TUTOR` i `ADMIN` zwraca lekcje grup prowadzonych przez uzytkownika,
  - dla `STUDENT` zwraca lekcje wynikajace z aktywnych zapisow.
- `createLesson(LessonRequest data)`:
  - sprawdza, czy godzina rozpoczecia jest wczesniejsza niz godzina zakonczenia,
  - pobiera grupe,
  - sprawdza konflikty grupy, korepetytora i zapisanych kursantow,
  - tworzy lekcje,
  - wysyla powiadomienia o nowych zajeciach.
- `editLesson(Long id, LessonRequest data)`:
  - blokuje edycje lekcji zakonczonej,
  - sprawdza poprawny przedzial czasu,
  - sprawdza konflikty, pomijajac edytowana lekcje,
  - aktualizuje dane lekcji.
- `updateNote(Long id, String note)` zapisuje notatke do lekcji.
- `removeLesson(Long id)`:
  - blokuje odwolanie lekcji zakonczonej,
  - zmienia status lekcji na `CANCELLED`,
  - wysyla powiadomienia o odwolaniu.

### ConflictService

`ConflictService` centralizuje sprawdzanie konfliktow terminow.

- `checkTutorConflict(...)` sprawdza, czy korepetytor ma juz lekcje nachodzaca na podany termin.
- `checkGroupConflict(...)` sprawdza konflikt w ramach jednej grupy.
- `checkStudentConflict(...)` sprawdza konflikt w planie kursanta wynikajacy z jego aktywnych zapisow.
- Parametr `ignoredLessonId` pozwala pominac aktualnie edytowana lekcje.
- Konflikt jest oparty na regule nachodzenia przedzialow:
  - istniejaca lekcja musi byc planowana,
  - daty musza byc takie same,
  - start jednej lekcji musi byc przed koncem drugiej i odwrotnie.

### NotificationService

`NotificationService` odpowiada za powiadomienia.

- `findAll()` zwraca wszystkie powiadomienia.
- `findByUserId(Long userId)` zwraca powiadomienia uzytkownika posortowane od najnowszych.
- `markAsRead(Long notificationId, Long userId)`:
  - pobiera powiadomienie,
  - sprawdza, czy nalezy do podanego uzytkownika,
  - blokuje ponowne oznaczenie jako przeczytane,
  - ustawia status `READ`.
- `notifyLessonCreated(Lesson lesson)` tworzy powiadomienia o nowych zajeciach.
- `notifyLessonCancelled(Lesson lesson)` tworzy powiadomienia o odwolanych zajeciach.
- `notifyEnrollmentChanged(Enrollment enrollment)` informuje kursanta i korepetytora o zmianie zapisu.
- Powiadomienia o lekcjach sa wysylane do korepetytora grupy oraz do aktywnie zapisanych kursantow.

## Obsluga bledow

Backend stosuje wlasny wyjatek `DomainException`, ktory przechowuje status HTTP i komunikat.

- `DomainException.notFound(...)` zwraca blad HTTP 404.
- `DomainException.conflict(...)` zwraca blad HTTP 409.
- `DomainException.badRequest(...)` zwraca blad HTTP 400.

Globalna obsluga bledow znajduje sie w `ApiExceptionHandler`.

- Bledy domenowe sa zwracane jako `ApiError` z komunikatem i statusem.
- Bledy walidacji DTO, czyli `MethodArgumentNotValidException`, zwracaja:
  - status 400,
  - komunikat `Niepoprawne dane`,
  - mape pol i komunikatow walidacyjnych.

Przykladowa struktura bledu:

```json
{
  "timestamp": "2026-06-16T12:00:00Z",
  "status": 400,
  "message": "Niepoprawne dane",
  "fields": {
    "email": "must be a well-formed email address"
  }
}
```

## Endpointy REST

### Autoryzacja

- `POST /api/auth/login`
  - body: `LoginRequest`,
  - sprawdza e-mail i haslo,
  - zwraca obiekt `User`,
  - przy blednych danych zwraca `Nieprawidłowy email lub hasło`.

### Uzytkownicy

- `GET /api/users`
  - zwraca wszystkich uzytkownikow.
- `GET /api/users/{id}`
  - zwraca uzytkownika po identyfikatorze.
- `POST /api/users`
  - tworzy uzytkownika,
  - body: `UserRequest`,
  - zwraca HTTP 201.
- `PUT /api/users/{id}`
  - aktualizuje uzytkownika,
  - body: `UserRequest`.
- `DELETE /api/users/{id}`
  - usuwa uzytkownika,
  - zwraca HTTP 204,
  - blokuje usuniecie korepetytora prowadzacego aktywne grupy.

### Grupy

- `GET /api/groups`
  - zwraca wszystkie grupy.
- `GET /api/groups/{id}`
  - zwraca grupe po identyfikatorze.
- `POST /api/groups`
  - tworzy grupe,
  - body: `GroupRequest`,
  - zwraca HTTP 201.
- `PUT /api/groups/{id}`
  - aktualizuje dane grupy.
- `POST /api/groups/{groupId}/students/{studentId}`
  - przypisuje kursanta do grupy.
- `DELETE /api/groups/{groupId}/students/{studentId}`
  - usuwa kursanta z grupy przez anulowanie aktywnego zapisu,
  - zwraca HTTP 204.
- `PUT /api/groups/{groupId}/tutor/{tutorId}`
  - przypisuje korepetytora do grupy.
- `DELETE /api/groups/{groupId}/tutor`
  - usuwa korepetytora z grupy.
- `DELETE /api/groups/{id}`
  - usuwa grupe,
  - odwoluje jej zaplanowane lekcje,
  - zwraca HTTP 204.

### Zapisy

- `GET /api/enrollments/student/{studentId}`
  - zwraca zapisy kursanta.
- `POST /api/enrollments/student/{studentId}/group/{groupId}`
  - zapisuje kursanta do grupy,
  - zwraca HTTP 201.
- `DELETE /api/enrollments/student/{studentId}/group/{groupId}`
  - rezygnuje kursanta z grupy,
  - zwraca HTTP 204.

### Lekcje

- `GET /api/lessons`
  - zwraca wszystkie lekcje.
- `GET /api/lessons/{id}`
  - zwraca lekcje po identyfikatorze.
- `GET /api/lessons/user/{userId}`
  - zwraca lekcje uzytkownika.
- `GET /api/lessons/group/{groupId}`
  - zwraca lekcje grupy.
- `POST /api/lessons`
  - tworzy lekcje,
  - body: `LessonRequest`,
  - zwraca HTTP 201.
- `PUT /api/lessons/{id}`
  - edytuje lekcje,
  - body: `LessonRequest`.
- `PUT /api/lessons/{id}/note`
  - aktualizuje notatke lekcji,
  - body zawiera pole `note`.
- `DELETE /api/lessons/{id}`
  - odwoluje lekcje przez ustawienie statusu `CANCELLED`,
  - zwraca HTTP 204.

### Powiadomienia

- `GET /api/notifications`
  - zwraca wszystkie powiadomienia.
- `GET /api/notifications/user/{userId}`
  - zwraca powiadomienia konkretnego uzytkownika.
- `PUT /api/notifications/{notificationId}/read?userId={userId}`
  - oznacza powiadomienie jako przeczytane.

### Health check

- `GET /api/health`
  - zwraca prosty status dzialania aplikacji:

```json
{
  "ok": true,
  "timestamp": "2026-06-16T12:00:00Z"
}
```

## Dane startowe

Dane startowe sa tworzone w klasie `DataSeeder`, ktora implementuje `CommandLineRunner`.

- Seeder uruchamia sie przy starcie aplikacji.
- Jesli w bazie istnieja juz uzytkownicy, seeder konczy dzialanie i nie tworzy danych ponownie.
- Tworzone sa przykladowe konta:
  - administrator,
  - korepetytorzy,
  - kursanci.
- Tworzone sa przykladowe grupy z roznych przedmiotow, m.in. matematyka, angielski, fizyka, chemia, historia, biologia i geografia.
- Tworzone sa zapisy kursantow do grup.
- Tworzone sa lekcje:
  - zakonczone z poprzednich tygodni,
  - zaplanowane w aktualnym tygodniu,
  - zaplanowane w kolejnym tygodniu.
- Tworzone sa przykladowe powiadomienia o zajeciach i zmianach zapisow.

## Najwazniejsze reguly biznesowe

- Adres e-mail uzytkownika musi byc unikalny.
- Nowy uzytkownik musi miec haslo.
- Tylko uzytkownik z rola `TUTOR` moze byc korepetytorem grupy.
- Tylko uzytkownik z rola `STUDENT` moze byc zapisany jako kursant do grupy.
- Nie mozna zapisac kursanta drugi raz aktywnie do tej samej grupy.
- Nie mozna zapisac kursanta do grupy bez wolnych miejsc.
- Nie mozna zmniejszyc pojemnosci grupy ponizej liczby aktywnych zapisow.
- Nie mozna usunac korepetytora, jesli prowadzi aktywne grupy.
- Nie mozna utworzyc lekcji, w ktorej godzina rozpoczecia nie jest wczesniejsza niz godzina zakonczenia.
- Nie mozna utworzyc lub edytowac lekcji, jesli powoduje konflikt:
  - w planie grupy,
  - w planie korepetytora,
  - w planie aktywnie zapisanych kursantow.
- Nie mozna edytowac zakonczonej lekcji.
- Nie mozna odwolac zakonczonej lekcji.
- Usuniecie grupy odwoluje jej zaplanowane lekcje i wysyla powiadomienia.
- Powiadomienia moga byc oznaczone jako przeczytane tylko raz.

## Przeplywy biznesowe

### Utworzenie lekcji

1. Kontroler `ScheduleController` odbiera `POST /api/lessons`.
2. `ScheduleService` sprawdza poprawny zakres godzin.
3. Pobierana jest grupa.
4. `ConflictService` sprawdza konflikt grupy.
5. Jesli grupa ma korepetytora, sprawdzany jest konflikt korepetytora.
6. Dla aktywnie zapisanych kursantow sprawdzany jest konflikt planu.
7. Lekcja jest zapisywana ze statusem `PLANNED`.
8. `NotificationService` wysyla powiadomienia o nowych zajeciach do korepetytora i aktywnych kursantow.

### Zapis kursanta do grupy

1. Kontroler zapisow lub kontroler grup przekazuje identyfikatory kursanta i grupy do serwisu.
2. Pobierana jest grupa oraz uzytkownik.
3. Serwis sprawdza, czy uzytkownik ma role `STUDENT`.
4. Sprawdzana jest pojemnosc grupy.
5. Sprawdzane jest, czy kursant nie ma juz aktywnego zapisu do tej samej grupy.
6. Sprawdzane sa konflikty planu kursanta z lekcjami grupy.
7. Tworzony jest nowy zapis lub aktywowany wczesniej anulowany zapis.
8. Wysylane sa powiadomienia o zmianie zapisu.

### Odwolanie lekcji

1. Kontroler `ScheduleController` odbiera `DELETE /api/lessons/{id}`.
2. `ScheduleService` pobiera lekcje.
3. Jesli lekcja jest zakonczona, operacja jest blokowana.
4. Status lekcji zmienia sie na `CANCELLED`.
5. `NotificationService` wysyla powiadomienia o odwolaniu zajec.

## Uruchomienie backendu

Backend mozna uruchomic z katalogu `backend` poleceniem:

```bash
./gradlew bootRun
```

Testy backendu mozna uruchomic poleceniem:

```bash
./gradlew test
```

Po uruchomieniu aplikacji dostepne sa endpointy REST pod sciezka `/api/...`.
