package tmdb

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"movie-backend/internal/models"
)

type videoResult struct {
	Key  string `json:"key"`
	Site string `json:"site"`
	Type string `json:"type"`
}

type videosResp struct {
	Results []videoResult `json:"results"`
}


type Client struct {
	apiKey string
	http   *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		http:   &http.Client{Timeout: 10 * time.Second},
	}
}

type popularResp struct {
	Results []models.MovieFromTMDB `json:"results"`
}

func (c *Client) GetMovieTrailerKey(id int) (string, error) {
	url := fmt.Sprintf(
		"https://api.themoviedb.org/3/movie/%d/videos?api_key=%s&language=pl-PL",
		id, c.apiKey,
	)

	resp, err := c.http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var data videosResp
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return "", err
	}

	for _, v := range data.Results {
		if v.Site == "YouTube" && v.Type == "Trailer" {
			return v.Key, nil
		}
	}

	// brak trailera – można zwrócić pusty string
	return "", nil
}


func (c *Client) GetPopularMovies(page int) ([]models.MovieFromTMDB, error) {
	url := fmt.Sprintf(
		"https://api.themoviedb.org/3/movie/popular?api_key=%s&language=pl-PL&page=%d",
		c.apiKey, page,
	)

	resp, err := c.http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data popularResp
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return data.Results, nil
}

func (c *Client) GetMovieDetails(id int) (*models.MovieFromTMDB, error) {
	url := fmt.Sprintf(
		"https://api.themoviedb.org/3/movie/%d?api_key=%s&language=pl-PL",
		id, c.apiKey,
	)

	resp, err := c.http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var movie models.MovieFromTMDB
	if err := json.NewDecoder(resp.Body).Decode(&movie); err != nil {
		return nil, err
	}

	return &movie, nil
}

