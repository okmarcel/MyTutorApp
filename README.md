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
- Korepetytorzy: dostęp do harmonogramu, list uczestników oraz zarządzanie własnymi grupami i zajęciami.
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
- Tworzenie, modyfikacja i odwoływanie zajęć w harmonogramie z wykrywaniem konfliktów
- Samodzielne zapisy i rezygnacje kursantów
- Podgląd harmonogramu dla korepetytora i kursanta
- Wewnętrzne powiadomienia w aplikacji o zapisach i zmianach w harmonogramie
- Kontrola dostępu do operacji według ról użytkowników

### Czego nie realizujemy:
- Integracji z zewnętrznymi systemami płatności
- Zaawansowanej analityki ani raportów biznesowych
- Modułu czatu / komunikatora między użytkownikami
- Aplikacji mobilnej natywnej
- Zewnętrznych powiadomień e-mail / SMS / push o zmianach

---

## Role i uprawnienia

- **Administrator** zarządza użytkownikami, grupami, przypisaniem korepetytorów, zapisami oraz pełnym harmonogramem.
- **Korepetytor** widzi własny harmonogram, własne grupy i uczestników. Może tworzyć oraz edytować własne grupy i zajęcia, ale nie zarządza kontami użytkowników ani cudzymi grupami.
- **Kursant** widzi swój harmonogram, zapisuje się do dostępnych grup, rezygnuje z własnych zapisów, przegląda historię i odczytuje swoje powiadomienia.

Model uprawnień w aplikacji jest egzekwowany po stronie backendu na podstawie bieżącego użytkownika przekazywanego przez frontend. W ramach projektu nie wdrażamy pełnego systemu tokenów JWT ani integracji z zewnętrznym dostawcą tożsamości.

---

## Architektura logiczna systemu
System zbudowany jest w architekturze **trójwarstwowej** (prezentacja - logika - dane), działającej w środowisku webowym.

### Główne elementy składowe:
- **Frontend:** Interfejs użytkownika (logowanie, dashboard, harmonogram, formularze)
- **Backend:** Logika biznesowa (zarządzanie użytkownikami, grupami, harmonogramem, konfliktami, powiadomieniami i uprawnieniami)
- **Baza danych (H2):** Przechowywanie danych (użytkownicy, grupy, zajęcia, zapisy, powiadomienia)
