# Raport końcowy projektu MyTutor

| Pole | Wartość |
| --- | --- |
| Nazwa projektu | MyTutor - Szkoła Korepetycji |
| Temat projektu | Projekt i implementacja aplikacji webowej wspierającej zarządzanie szkołą korepetycji |
| Zespół projektowy | Marcel Gładysz, Adam Nowak, Krzysztof Wiewióra |
| Stos technologiczny | Java, Spring Boot (backend) / React, Vite, TypeScript (frontend) |
| Cel projektu | Stworzenie scentralizowanego, wydajnego i bezpiecznego systemu ułatwiającego administrację szkołą korepetycji, obsługę harmonogramów oraz komunikację między administratorami, korepetytorami a kursantami |

## 1. Wprowadzenie

Aplikacja MyTutor stanowi odpowiedź na problem rosnącego chaosu organizacyjnego, z którym borykają się rozrastające się placówki edukacyjne oraz prywatne szkoły korepetycji. Tradycyjne metody zarządzania harmonogramem, takie jak arkusze kalkulacyjne, generują ryzyko błędów ludzkich, między innymi nakładania się zajęć czy problemów z komunikacją o odwołanych lekcjach.

Grupa docelowa systemu to przede wszystkim:

- właściciele i administratorzy szkół korepetycji,
- nauczyciele i korepetytorzy prowadzący zajęcia,
- kursanci korzystający z usług placówki.

Główną motywacją stworzenia aplikacji była chęć cyfryzacji i automatyzacji procesów administracyjnych, co pozwoli zaoszczędzić czas kadry zarządzającej oraz poprawić jakość i przejrzystość usług dla klientów.

## 2. Zakres projektu

Funkcje zrealizowane w ramach projektu:

- autoryzacja i zarządzanie profilami użytkowników: Admin, Korepetytor, Kursant,
- zarządzanie grupami szkoleniowymi i przypisywanie do nich kursantów,
- tworzenie oraz modyfikacja harmonogramu zajęć,
- algorytm wykrywania konfliktów terminów, zapobiegający podwójnemu przypisaniu nauczyciela lub nakładaniu się lekcji kursanta,
- system powiadomień wewnętrznych in-app,
- kontrola dostępu do zasobów według ról, czyli Role-Based Access Control.

Funkcje świadomie wyłączone z zakresu projektu:

- integracja z zewnętrznymi bramkami płatności,
- moduł do prowadzenia zajęć online, na przykład wideokonferencje,
- zewnętrzne systemy powiadomień, takie jak e-mail, SMS i push. Zaimplementowano wyłącznie system wewnętrzny.

## 3. Przebieg prac projektowych

Proces wytwórczy aplikacji MyTutor oparty był o metodykę zwinną, co pozwoliło na iteracyjne dostarczanie wartości i systematyczną weryfikację założeń z użytkownikami.

### Wczesne fazy i projektowanie

W ramach początkowych sprintów opracowano szczegółowe wymagania funkcjonalne i niefunkcjonalne systemu w postaci kompletnych kryteriów akceptacji oraz scenariuszy testowych, które zostały zapisane w formacie GWT.

Dodatkowo przygotowano flow użytkownika w postaci diagramów aktywności. Przedstawiały one przebieg najważniejszych procesów realizowanych w systemie przez administratorów, korepetytorów oraz kursantów. Na podstawie tych diagramów wykonano interaktywny prototyp interfejsu użytkownika w wersji low-fidelity, co umożliwiło wizualizację struktury aplikacji, nawigacji oraz podstawowych funkcjonalności bez szczegółowej warstwy graficznej.

### Sprint 3 - Weryfikacja UI i dokumentacja techniczna

Celem trzeciego sprintu było zweryfikowanie poprawności zaprojektowanego interfejsu użytkownika oraz przygotowanie kompletnej dokumentacji technicznej stanowiącej podstawę implementacji systemu MyTutor. Zrealizowane prace podzielono pomiędzy członków zespołu:

- **Badanie interfejsu użytkownika - Marcel Gładysz**  
  Przeprowadzono badanie użyteczności prototypu z udziałem kursantów, korepetytorów oraz administratorów. Badanie wykazało, że podstawowe zadania mogą być realizowane w sposób intuicyjny, a nawigacja jest czytelna i spójna. Jednocześnie zidentyfikowano potrzebę rozbudowy formularzy oraz dodania bardziej widocznych komunikatów potwierdzających wykonanie operacji.

- **Finalizacja prototypu UI - Krzysztof Wiewióra**  
  Na podstawie wyników badań dopracowano interaktywny prototyp aplikacji. Ujednolicono sposób nawigacji pomiędzy ekranami, uporządkowano układ widoków oraz zweryfikowano kompletność funkcjonalności dostępnych dla ról w systemie.

- **Architektura i diagramy - Adam Nowak**  
  Przygotowano architekturę logiczną aplikacji z podziałem na frontend, backend i bazę danych oraz opracowano diagram pakietów. Opracowano diagram klas opisujący model domenowy, relacje pomiędzy obiektami, logikę biznesową i dostęp do danych. Dodatkowo przygotowano diagramy sekwencji dla najważniejszych procesów: zarządzania użytkownikami, grupami, harmonogramem zajęć, zapisami na zajęcia oraz powiadomieniami. Diagramy przedstawiały sposób przetwarzania żądań pomiędzy interfejsem, warstwą usług, repozytoriami i bazą danych.

## 4. Architektura systemu

System MyTutor oparty jest na klasycznej architekturze trójwarstwowej, rozdzielającej interfejs użytkownika, logikę biznesową i warstwę dostępu do danych.

- **Frontend, czyli warstwa prezentacji**  
  Zbudowany w oparciu o bibliotekę React z wykorzystaniem TypeScript dla silnego typowania i minimalizacji błędów czasu wykonywania. Jako narzędzie budujące wykorzystano Vite, co znacząco przyspieszyło proces developmentu.

- **Backend, czyli warstwa logiki biznesowej**  
  Zaimplementowany w języku Java przy użyciu frameworka Spring Boot. Odpowiada za autoryzację, walidację danych, algorytmy wykrywania konfliktów oraz przetwarzanie zapytań z frontendu.

- **Baza danych, czyli warstwa danych**  
  W systemie zastosowano relacyjną bazę danych do przechowywania powiązań między użytkownikami, grupami a harmonogramem.

- **Komunikacja**  
  Warstwy komunikują się ze sobą poprzez architekturę REST API, wymieniając dane w formacie JSON.

Wybrano technologie o ugruntowanej pozycji rynkowej. Spring Boot gwarantuje stabilność, bezpieczeństwo i łatwiejszą skalowalność backendu, podczas gdy React w połączeniu z TypeScriptem zapewnia dynamiczny i mniej podatny na błędy interfejs użytkownika.

## 5. Model danych

Opierając się na specyfikacji, model danych odzwierciedlony w diagramach klas backendu opiera się na następujących głównych encjach:

- **User, czyli użytkownik** - przechowuje dane logowania, imię, nazwisko oraz rolę: Admin, Tutor lub Student.
- **Group, czyli grupa** - reprezentuje klasę lub grupę przedmiotową. Posiada limit miejsc oraz powiązanego korepetytora.
- **Lesson, czyli lekcja** - konkretne wydarzenie w czasie. Posiada datę rozpoczęcia, czas trwania, status i przypisaną grupę.
- **Enrollment, czyli zapis** - encja łącząca, będąca tabelą asocjacyjną w relacji many-to-many między użytkownikiem, czyli kursantem, a grupą.
- **Notification, czyli powiadomienie** - zawiera treść komunikatu, datę wygenerowania, nadawcę oraz odbiorcę lub listę odbiorców.

Kluczowe relacje:

- jedna grupa może mieć wiele zaplanowanych lekcji: 1:N,
- jeden korepetytor może uczyć wiele grup: 1:N,
- kursanci przypisani są do grup wielokrotnie: M:N.

## 6. Logika biznesowa

System przetwarza kluczowe zasady działania szkoły na kod:

- **Zarządzanie grupami i przypisywanie korepetytorów**  
  Tylko administrator może tworzyć nowe grupy i delegować do nich odpowiednich nauczycieli na podstawie ich specjalizacji.

- **Zapisy i rezygnacje**  
  Kursant może zapisać się do grupy, o ile nie przekroczono w niej maksymalnego limitu miejsc. Rezygnacja jest możliwa do określonego czasu przed startem zajęć.

- **Wykrywanie konfliktów terminów**  
  Algorytm na backendzie przed utworzeniem lekcji sprawdza w bazie, czy dany korepetytor lub sala, jeśli jest uwzględniana, nie mają już w tym samym oknie czasowym innych zaplanowanych zajęć. W przypadku kolizji system rzuca błąd, a na frontendzie wyświetlany jest stosowny komunikat.

- **Powiadomienia**  
  System umożliwia tworzenie i odczytywanie asynchronicznych wiadomości kierowanych wewnątrz systemu do konkretnych ról.

## 7. Interfejs użytkownika

Zgodnie z projektem makiety interfejs kładzie nacisk na ergonomię i nowoczesny design.

Główne widoki:

- **Dashboard główny** - ekran powitalny podsumowujący dzisiejsze zajęcia i nieprzeczytane powiadomienia.
- **Widok kalendarza** - interaktywny plan zajęć, wyświetlający lekcje w podziale na dni i tygodnie. Różne kolory oznaczają status zajęć, na przykład zaplanowane lub odwołane.
- **Panel zarządzania, tylko Admin** - tabelaryczny widok kursantów, korepetytorów i grup, pozwalający na łatwe dodawanie oraz usuwanie rekordów.

Przykładowy przepływ użytkownika:

1. Administrator loguje się do systemu.
2. Przechodzi do zakładki **Grupy**.
3. Klika **Dodaj grupę**.
4. Wypełnia formularz i przypisuje korepetytora.
5. Kursant loguje się do systemu.
6. W zakładce **Zapisy** widzi nową grupę.
7. Kursant potwierdza chęć udziału.

## 8. Testowanie

Logika backendu objęta jest zestawem testów jednostkowych, na przykład za pomocą JUnit i Mockito.

Przykładowe scenariusze testowe:

- **Test konfliktów**  
  Dodanie lekcji X w godzinach 15:00-16:00 dla Korepetytora A. Następnie próba dodania lekcji Y dla tego samego korepetytora w godzinach 15:30-16:30. Oczekiwany rezultat: odrzucenie transakcji i zwrócenie błędu walidacji terminów.

- **Test limitów grup**  
  Próba dodania jedenastego kursanta do grupy o sztywnym limicie 10 osób. Oczekiwany rezultat: wyjątek przekroczenia rozmiaru grupy.

- **Test uprawnień RBAC**  
  Próba wywołania chronionego endpointu z użyciem tokenu logowania kursanta. Oczekiwany rezultat: status HTTP 403 Forbidden.

## 9. Zgodność implementacji ze specyfikacją

Po porównaniu założeń ze specyfikacją techniczną z obecnym stanem implementacji stwierdzono, że pomyślnie zrealizowano:

- architekturę trójwarstwową,
- pełny CRUD operacyjny,
- kalendarz,
- system kontroli dostępu.

W zakresie ograniczeń projekt pozostaje zgodny ze specyfikacją. W specyfikacji wyraźnie wskazano uproszczenia, w szczególności to, że powiadomienia opierają się wyłącznie na systemie wewnątrz aplikacji, czyli in-app notifications. Zewnętrzne powiadomienia e-mail, SMS oraz push nie zostały zaimplementowane, co jest zgodne z przyjętymi na starcie ograniczeniami MVP.

## 10. Problemy napotkane podczas realizacji

- **Model autoryzacji**  
  Z uwagi na ograniczenia czasowe projektu zdecydowano się na uproszczony model autoryzacji, bez integracji z zewnętrznymi dostawcami tożsamości.

- **Złożoność algorytmu konfliktów**  
  Trudnością techniczną okazało się wydajne sprawdzanie nakładających się przedziałów czasowych. Zamiast obciążać logikę w Javie, zdecydowano się zoptymalizować samo zapytanie do bazy danych.

- **Kompromisy architektoniczne**  
  Aby przyspieszyć dostarczenie frontendowej części, zrezygnowano ze skomplikowanego systemu zarządzania stanem na rzecz prostszego Context API wbudowanego w Reacta.

## 11. Podsumowanie

Projekt informatyczny **MyTutor - Szkoła Korepetycji** zakończył się sukcesem technicznym. Osiągnięto wszystkie założone cele podstawowe, dostarczając funkcjonalne środowisko do zarządzania użytkownikami, zajęciami i salami.

Dzięki zastosowaniu nowoczesnego i bezpiecznego stosu technologicznego, czyli Java Spring Boot oraz React TypeScript, system gwarantuje dużą stabilność oraz łatwość obsługi. Zastosowane kompromisy, między innymi uproszczona autoryzacja oraz brak zewnętrznych powiadomień, pozwoliły na terminowe dostarczenie stabilnej wersji MVP.
