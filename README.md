# MyTutor – Szkoła Korepetycji

## Strona tytułowa

- **Temat projektu**: Szkoła korepetycji  
- **Nazwa kodowa**: `MyTutor`  
- **Skład zespołu**:
    - Marcel Gładysz *(team leader)*
    - Adam Nowak
    - Krzysztof Wiewióra

- [**Repozytorium GitHub**](https://github.com/okmarcel/MyTutorApp)  
- [**Projekt online (GitHub Projects)**](https://github.com/users/okmarcel/projects/2)

---

## Wizja systemu

**MyTutor** to aplikacja webowa dostępna na urządzeniach desktopowych i mobilnych, przeznaczona dla trzech grup użytkowników: administratorów szkoły korepetycji, korepetytorów oraz kursantów.

### Potrzeby:
- Administratorzy: automatyzacja zapisów, tworzenia grup, układania harmonogramów, powiadamiania.
- Korepetytorzy: dostęp do harmonogramu i list uczestników.
- Kursanci: podgląd terminów, historia uczestnictwa, powiadomienia o zmianach.

### Korzyści:
- Oszczędność czasu, redukcja błędów organizacyjnych, profesjonalny wizerunek, łatwe skalowanie.

### Alternatywy:
- Papierowe dzienniki, telefoniczne powiadomienia, arkusze Google - brak dedykowanych funkcji i automatyzacji.

---

## Zakres usług – co realizujemy, a czego nie realizujemy

### Realizujemy (w ramach projektu):
- Zarządzanie kursantami (CRUD)
- Zarządzanie grupami zajęciowymi
- Przypisywanie korepetytorów do grup
- Tworzenie i modyfikacja harmonogramu z wykrywaniem konfliktów
- Powiadomienia (e-mail / SMS / push) o zmianach
- Samodzielne zapisy i rezygnacje kursantów
- Podgląd harmonogramu dla korepetytora i kursanta

### Czego nie realizujemy:
- Integracji z zewnętrznymi systemami płatności
- Zaawansowanej analityki ani raportów biznesowych
- Modułu czatu / komunikatora między użytkownikami
- Aplikacji mobilnej natywnej

---

## Architektura logiczna systemu
System zbudowany jest w architekturze **trójwarstwowej** (prezentacja - logika - dane), działającej w środowisku webowym.

### Główne elementy składowe:
- **Frontend:** Interfejs użytkownika (logowanie, dashboard, harmonogram, formularze)
- **Backend:** Logika biznesowa (zarządzanie użytkownikami, grupami, harmonogramem, konfliktami, powiadomieniami)
- **Baza danych (PostgreSQL):** Przechowywanie danych (użytkownicy, grupy, zajęcia, zapisy, powiadomienia)
- **Serwis powiadomień:** Wysyłka e-mail i/lub SMS (API zewnętrzne)
