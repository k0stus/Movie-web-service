package tmdb

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const baseURL = "https://api.themoviedb.org/3"

// Client – prosty klient TMDB
type Client struct {
	apiKey string
	http   *http.Client
}

// NewClient – tworzysz go w main.go: tmdb.NewClient(cfg.TMDBApiKey)
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		http: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// MovieFromTMDB – minimalne dane filmu, które wykorzystujesz
type MovieFromTMDB struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Overview    string  `json:"overview"`
	PosterPath  string  `json:"poster_path"`
	VoteAvg     float64 `json:"vote_average"`
	GenreIDs    []int   `json:"genre_ids"`
}

// --- Popular movies ---

type popularResponse struct {
	Results []MovieFromTMDB `json:"results"`
}

// GetPopularMovies pobiera listę popularnych filmów (TMDB /movie/popular)
func (c *Client) GetPopularMovies(page int) ([]MovieFromTMDB, error) {
	if page < 1 {
		page = 1
	}

	url := fmt.Sprintf(
		"%s/movie/popular?api_key=%s&language=pl-PL&page=%d",
		baseURL,
		c.apiKey,
		page,
	)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tmdb popular error: %s", resp.Status)
	}

	var pr popularResponse
	if err := json.NewDecoder(resp.Body).Decode(&pr); err != nil {
		return nil, err
	}

	return pr.Results, nil
}

// --- Movie details ---

// GetMovieDetails pobiera szczegóły filmu po ID
func (c *Client) GetMovieDetails(id int) (*MovieFromTMDB, error) {
	url := fmt.Sprintf(
		"%s/movie/%d?api_key=%s&language=pl-PL",
		baseURL,
		id,
		c.apiKey,
	)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tmdb details error: %s", resp.Status)
	}

	var m MovieFromTMDB
	if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
		return nil, err
	}

	return &m, nil
}

// --- Trailer (YouTube) ---

type videosResponse struct {
	Results []struct {
		Key  string `json:"key"`
		Site string `json:"site"`
		Type string `json:"type"`
	} `json:"results"`
}

// GetMovieTrailerKey zwraca klucz do trailera na YouTube (lub pusty string)
func (c *Client) GetMovieTrailerKey(id int) (string, error) {
	url := fmt.Sprintf(
		"%s/movie/%d/videos?api_key=%s&language=pl-PL",
		baseURL,
		id,
		c.apiKey,
	)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("tmdb videos error: %s", resp.Status)
	}

	var vr videosResponse
	if err := json.NewDecoder(resp.Body).Decode(&vr); err != nil {
		return "", err
	}

	for _, v := range vr.Results {
		if v.Site == "YouTube" && v.Type == "Trailer" {
			return v.Key, nil
		}
	}

	return "", nil
}

// --- Discover by genre (watchlisty) ---

type discoverResponse struct {
	Results []MovieFromTMDB `json:"results"`
}

// GetMoviesByGenre zwraca filmy dla danego genreID (np. 28 = akcja)
func (c *Client) GetMoviesByGenre(genreID int, page int) ([]MovieFromTMDB, error) {
	if page < 1 {
		page = 1
	}

	url := fmt.Sprintf(
		"%s/discover/movie?api_key=%s&language=pl-PL&with_genres=%d&page=%d",
		baseURL,
		c.apiKey,
		genreID,
		page,
	)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tmdb discover error: %s", resp.Status)
	}

	var dr discoverResponse
	if err := json.NewDecoder(resp.Body).Decode(&dr); err != nil {
		return nil, err
	}

	return dr.Results, nil
}
