# Dokumentacja testow

## Zakres implementacji testow

- W projekcie zaimplementowano testy automatyczne dla warstwy serwisow backendu aplikacji MyTutor.
- Testy znajduja sie w pliku `backend/src/test/java/com/mytutor/services/MyTutorServicesTest.java`.
- Testy sa uruchamiane jako testy integracyjne Spring Boot:
  - klasa testowa jest oznaczona adnotacja `@SpringBootTest`, dlatego podczas testow ladowany jest kontekst aplikacji Spring,
  - serwisy sa wstrzykiwane przez `@Autowired`, wiec testowana jest rzeczywista konfiguracja aplikacji, repozytoriow i logiki domenowej,
  - klasa jest oznaczona `@Transactional`, dzieki czemu dane tworzone w pojedynczym tescie nie powinny zanieczyszczac stanu kolejnych testow.
- Do asercji wykorzystano AssertJ, m.in. `assertThat(...)` oraz `assertThatThrownBy(...)`.
- Testy sa uruchamiane przez JUnit 5, co jest skonfigurowane w `backend/build.gradle.kts` przez `useJUnitPlatform()`.
- Zaleznosci testowe zapewnia `spring-boot-starter-test`.

## Uruchamianie testow

- Testy backendu mozna uruchomic z katalogu `backend` poleceniem:

```bash
./gradlew test
```

- Testy korzystaja z konfiguracji Spring Boot i bazy dostepnej dla srodowiska testowego. W projekcie dostepna jest zaleznosc do H2, dlatego testy moga dzialac na bazie w pamieci zgodnie z konfiguracja aplikacji.

## Co obejmuja testy

### Zapisy studentow do grup

- `createsDomainAndRejectsDuplicateEnrollmentAndFullGroup`
  - tworzy korepetytora, dwoch studentow oraz grupe o pojemnosci 1,
  - zapisuje pierwszego studenta do grupy,
  - sprawdza, czy zapis otrzymuje status `ACTIVE`,
  - sprawdza, czy ponowny zapis tego samego studenta do tej samej grupy konczy sie wyjatkiem domenowym,
  - sprawdza, czy zapis drugiego studenta do pelnej grupy jest blokowany komunikatem `Brak wolnych miejsc`.

- `cancelsEnrollmentAndMarksNotificationAsReadOnlyOnce`
  - tworzy studenta oraz grupe,
  - zapisuje studenta do grupy, a nastepnie wykonuje rezygnacje z grupy,
  - sprawdza, czy zapis studenta ma status `CANCELLED`,
  - pobiera powiadomienie uzytkownika,
  - oznacza powiadomienie jako przeczytane i sprawdza status `READ`,
  - sprawdza, czy ponowne oznaczenie tego samego powiadomienia jako przeczytane jest blokowane wyjatkiem domenowym.

### Harmonogram zajec i konflikty terminow

- `rejectsTutorAndGroupScheduleConflictsAndCreatesNotifications`
  - tworzy korepetytora, studenta oraz dwie grupy prowadzone przez tego samego korepetytora,
  - zapisuje studenta do pierwszej grupy,
  - tworzy lekcje dla pierwszej grupy,
  - sprawdza, czy lekcja otrzymuje status `PLANNED`,
  - sprawdza, czy student dostaje powiadomienie o tytule `Nowe zajecia`,
  - probuje utworzyc druga lekcje dla tego samego korepetytora w nachodzacym terminie,
  - sprawdza, czy system blokuje konflikt komunikatem `Termin koliduje z zajeciami korepetytora`.

- `findExistingAndNonExistingLesson`
  - tworzy korepetytora, grupe oraz lekcje,
  - sprawdza, czy istniejaca lekcja moze zostac wyszukana po identyfikatorze,
  - sprawdza, czy wyszukanie nieistniejacej lekcji konczy sie wyjatkiem `Lekcja nie istnieje`.

- `editingLessonData`
  - tworzy korepetytora, dwie grupy oraz lekcje przypisana do pierwszej grupy,
  - edytuje lekcje, przenoszac ja do drugiej grupy oraz zmieniajac godziny,
  - sprawdza, czy obiekt lekcji ma zaktualizowana grupe, godzine rozpoczecia oraz godzine zakonczenia.

- `removeCompletedAndPlaneddLesson`
  - tworzy korepetytora, grupe oraz zaplanowana lekcje,
  - odwoluje lekcje,
  - sprawdza, czy korepetytor dostaje powiadomienie `Zajecia odwolane`,
  - sprawdza, czy status lekcji zmienil sie na `CANCELLED`,
  - oznacza lekcje jako zakonczona,
  - sprawdza, czy proba odwolania zakonczonej lekcji konczy sie komunikatem `Nie mozna odwolac zakonczonej lekcji`.

- `createLessonWithStartTimeAfterEndTime`
  - tworzy korepetytora i grupe,
  - probuje utworzyc lekcje, w ktorej godzina rozpoczecia jest pozniejsza niz godzina zakonczenia,
  - sprawdza, czy system blokuje taki przypadek komunikatem `Godzina rozpoczecia musi byc wczesniejsza niz zakonczenia`.

- `createLessonWithConflictsInGroup`
  - tworzy korepetytora, grupe i pierwsza lekcje,
  - probuje utworzyc druga lekcje dla tej samej grupy w tym samym terminie,
  - sprawdza, czy system wykrywa konflikt grupy i zwraca komunikat `Termin koliduje z zajeciami grupy`.

- `savesAndRetrievesLessonNote`
  - tworzy korepetytora, grupe oraz lekcje,
  - zapisuje notatke do lekcji,
  - sprawdza, czy po ponownym pobraniu lekcji notatka ma oczekiwana tresc `Przyniesc zeszyt`.

### Zarzadzanie uzytkownikami

- `editingUserData`
  - tworzy studenta,
  - aktualizuje jego imie, nazwisko oraz adres e-mail,
  - sprawdza, czy dane obiektu uzytkownika zostaly zmienione zgodnie z przekazanym `UserRequest`.

- `findExistingAndNonExistingUser`
  - tworzy studenta,
  - sprawdza, czy mozna wyszukac istniejacego uzytkownika po identyfikatorze,
  - sprawdza, czy proba wyszukania nieistniejacego uzytkownika konczy sie komunikatem `Uzytkownik nie istnieje`.

- `deleteUserAndTutorWithActiveGroups`
  - tworzy korepetytora, studenta oraz grupe prowadzona przez korepetytora,
  - sprawdza, czy student istnieje,
  - usuwa studenta,
  - sprawdza, czy po usunieciu student nie moze juz zostac znaleziony,
  - sprawdza, czy proba usuniecia korepetytora prowadzacego aktywna grupe jest blokowana komunikatem `Korepetytor prowadzi aktywne grupy`.

- `addUsersWithTheSameEmails`
  - tworzy uzytkownika z okreslonym adresem e-mail,
  - probuje utworzyc kolejnego uzytkownika z tym samym adresem e-mail,
  - sprawdza, czy system blokuje duplikat komunikatem `Email jest juz zajety`.

### Zarzadzanie grupami

- `findExistingAndNonExistingGroup`
  - tworzy korepetytora oraz grupe,
  - sprawdza, czy mozna wyszukac istniejaca grupe po identyfikatorze,
  - sprawdza, czy wyszukanie nieistniejacej grupy konczy sie komunikatem `Grupa nie istnieje`.

- `editGroupWithLowerCapacityThanStudentsEnrolled`
  - tworzy korepetytora, dwoch studentow oraz grupe o pojemnosci 2,
  - zapisuje obu studentow do grupy,
  - sprawdza, czy zwiekszenie pojemnosci grupy jest dozwolone,
  - sprawdza, czy zmniejszenie pojemnosci ponizej liczby zapisanych studentow jest blokowane komunikatem `Pojemnosc grupy jest mniejsza od liczby zapisanych kursantow`.

- `makeGroupWithStudentAsTutor`
  - tworzy uzytkownika z rola `STUDENT`,
  - probuje utworzyc grupe, przypisujac studenta jako korepetytora,
  - sprawdza, czy system blokuje taka operacje komunikatem `Uzytkownik nie jest korepetytorem`.

- `removeTutorFromGroup`
  - tworzy korepetytora oraz grupe,
  - usuwa przypisanie korepetytora z grupy,
  - sprawdza, czy pole `tutor` w grupie ma wartosc `null`.

### Konflikty przy przypisywaniu studentow i korepetytorow

- `rejectsAssignStudentToGroupWithConflictingLesson`
  - tworzy dwoch korepetytorow, jednego studenta oraz dwie grupy,
  - tworzy lekcje dla obu grup w tym samym terminie,
  - zapisuje studenta do pierwszej grupy,
  - probuje przypisac tego samego studenta do drugiej grupy z kolidujacym terminem,
  - sprawdza, czy system blokuje przypisanie komunikatem `Plan zajec kursanta zawiera konflikt`.

- `rejectsAssignTutorWithConflictingSchedule`
  - tworzy dwoch korepetytorow oraz dwie grupy,
  - pierwsza grupa ma przypisanego korepetytora, druga poczatkowo nie ma korepetytora,
  - tworzy lekcje dla obu grup w tym samym terminie,
  - probuje przypisac korepetytora z pierwszej grupy do drugiej grupy,
  - sprawdza, czy system blokuje przypisanie komunikatem `Korepetytor ma zajecia kolidujace z terminami tej grupy`.

## Podsumowanie techniczne

- Testy sprawdzaja glownie logike domenowa w serwisach:
  - tworzenie i edycje uzytkownikow,
  - tworzenie i edycje grup,
  - zapisy i rezygnacje studentow,
  - tworzenie, edycje, odwolanie oraz notatki lekcji,
  - generowanie i obsluge powiadomien,
  - walidacje konfliktow terminow,
  - walidacje pojemnosci grup,
  - walidacje rol uzytkownikow,
  - obsluge nieistniejacych encji.
- Testy weryfikuja zarowno scenariusze pozytywne, jak i negatywne.
- Scenariusze negatywne sprawdzaja nie tylko sam fakt rzucenia `DomainException`, ale w wielu miejscach takze konkretny komunikat bledu, co potwierdza zgodnosc zachowania aplikacji z zalozeniami domenowymi.
