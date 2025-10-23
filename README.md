# Movie-web-service
Movie streaming web application with recommendations, project for Software Development course at PWr.

## Project topic
The application will contain back-end part with a set of movies and
metadata about them, a UI to observe the data and a recommendation 
system, powered with AI.

## Team
- Konstantin Sosnowski 283040  [k0stus](https://github.com/k0stus)
- Krzysztof Kleszcz 279728 [ys0085](https://github.com/ys0085)
- Przemysław Marcinkowski 279761 [Przemek3011](https://github.com/Przemek3011)
- Martyna Ciećkiewicz 279750 [mciec24](https://github.com/mciec24)

## Project scope
- Movie catalogue(IMDB Dataset?)
- User Authentication
- Frontend interface
- Movie rating and commenting
- Recommendation system

    ### Out-of-scope functionality
  - Watch-later list
  - User statistics 
  - Caching layer
  - Containerization
  - Mobile-friendly UI

## Used technologies

### Backend
- **Go** *main backend language*
    - Wysoka wydajność, możliwość użycia współbieżności (goroutines)
- **Gin?** *or another web framework for Go*
    - Bardzo popularny framework dla aplikacji webowych, obszerna dokumentacja, duża społeczność (dużo materiałów referencyjnych)   
- **PostgreSQL / MongoDB** *database*
  - Schemat dokumentowy jest elastyczny dla danych. Atlas upraszcza utrzymanie, backupy i skalowanie

### Frontend 
- **JS** *main frontend language*
- **HTML/CSS** 
- **React** *library for creating UI*
  -Bardzo popularny, dobra współpraca z REST API, możliwość z korzystania z react-player.

### Other technologies
- **OpenAI?** *for recommendations*
- **Docker?** *containerization*
- **Redis?** *caching*
- **JWT**
   - Dobrze się sprawdza z SPA + API, zwiększa bezpieczeństwo sesji

# Work breakdown structure
- **Planowanie i analiza**
  - Zebranie wymagań funkcjonalnych
  - Opracowanie UI/UX
  - Przygotowanie specyfikacji danych i modeli
  - Wybranie technologi
- **Projektowanie aplikacji**
  - Architektura aplikacji (API + SPA)
  - Projekt bazy danych
- **Implementacja backendu**
  - Implementacja modeli danych
  - Implementacja logiki autoryzacji
  - Implementacja CRUD
  - Integracja z systemem przechowywania plików
- **Implementacja frontendu**
  - Implementacja stron
  - Strona szczegółów filmu + odtwarzacz wideo
  - Strona "Moja lista" / "Ostatnie oglądane"
  - Integracja z API
  - Responsywność
- **Testowanie**
  - Testy jednostkowe backendu
  - Testy integracyjne API
  - Testy wydajnościowe
  - Poprawa błędów
- **Usprawnienia**
  - Optymalizacja wydajności
  - Dodanie nowych funkcji (np. komentarze, rekomendacje)
# Harmonogram Pracy
- Praca zostałą podzielona pomiędzy dwa zespoły: backend i frontend
    ## Iteracja 1
    - **backend**
        - Inicjalizacja projeku Go/Gin (moduły, konfiguracja)
        - Zainicjalizowanie bazy danych w MongoDB
    - **frontend**
        - Projekt struktury aplikacji (router, layout)
        - Podstawowe UI (Button, Card, Navbar)
        - Integracja klienta HTTP, obsługa błędów
    ## Iteracja 2
    - **backend**
        - Autentykacja (np. JWT )
        - Endpoints (operacje CRUD, query itd)
        - Serwowanie wideo (filmy z Cloud)
    - **frontend**
        - Ekrany (Login, sign up)
        - wygaszanie sesji
        - katalog (paginacja, sortowanie) 
        - wideo player
    ## Iteracja 3
    -**backend**
        -Watchlist
        -Rating
        -Caching
    -**frontend**
        -Widok playlist
        -Gwiazdkowane oceny
        -Podobne tytuły na głównej stronie

        
