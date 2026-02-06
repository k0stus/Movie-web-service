package movie

import (
	"encoding/json"
	"net/http"
	"strconv"

	"movie-backend/internal/cache"
	"movie-backend/internal/models"
	"movie-backend/internal/tmdb"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	tmdb  *tmdb.Client
	cache *cache.RedisCache
}

func NewHandler(tmdbClient *tmdb.Client, cache *cache.RedisCache) *Handler {
	return &Handler{
		tmdb:  tmdbClient,
		cache: cache,
	}
}

type MovieWithTrailer struct {
	Data       models.MovieFromTMDB `json:"data"`
	YoutubeKey string               `json:"youtubeKey"`
}

func (h *Handler) GetPopular(c *gin.Context) {
	limit := 10
	if lStr := c.Query("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	cacheKey := "movies:popular:" + strconv.Itoa(limit)

	// --- TRY CACHE ---
	if h.cache.Exists(cacheKey) {
		cached, err := h.cache.Get(cacheKey)
		if err == nil {
			var cachedResult []gin.H
			if json.Unmarshal([]byte(cached), &cachedResult) == nil {
				c.JSON(http.StatusOK, cachedResult)
				return
			}
		}
	}

	pagesToFetch := 2

	var result []gin.H

	for page := 1; page <= pagesToFetch && len(result) < limit; page++ {
		movies, err := h.tmdb.GetPopularMovies(page)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "TMDB error"})
			return
		}

		for _, m := range movies {
			if len(result) >= limit {
				break
			}

			trailerKey, _ := h.tmdb.GetMovieTrailerKey(m.ID)
			if trailerKey == "" {
				continue // pomijamy filmy bez trailera
			}

			result = append(result, gin.H{
				"id":         m.ID,
				"title":      m.Title,
				"posterPath": m.PosterPath,
				"voteAvg":    m.VoteAvg,
				"youtubeKey": trailerKey,
			})
		}
	}

	// --- SAVE TO CACHE ---
	jsonData, _ := json.Marshal(result)
	_ = h.cache.Set(cacheKey, string(jsonData))

	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetDetails(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
		return
	}

	cacheKey := "movie:details:" + idStr

	// --- TRY CACHE ---
	if h.cache.Exists(cacheKey) {
		cached, err := h.cache.Get(cacheKey)
		if err == nil {
			var cachedResp MovieWithTrailer
			if json.Unmarshal([]byte(cached), &cachedResp) == nil {
				c.JSON(http.StatusOK, cachedResp)
				return
			}
		}
	}

	movie, err := h.tmdb.GetMovieDetails(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "TMDB error"})
		return
	}

	trailerKey, err := h.tmdb.GetMovieTrailerKey(id)
	if err != nil {
		// jeśli coś się wywali przy trailerze – nie zabijamy całego requestu
		trailerKey = ""
	}

	resp := MovieWithTrailer{
		Data:       *movie,
		YoutubeKey: trailerKey,
	}

	// --- SAVE TO CACHE ---
	jsonData, _ := json.Marshal(resp)
	_ = h.cache.Set(cacheKey, string(jsonData))

	c.JSON(http.StatusOK, resp)
}
