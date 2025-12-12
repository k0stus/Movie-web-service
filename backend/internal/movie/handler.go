package movie

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"movie-backend/internal/cache"
	"movie-backend/internal/models"
	"movie-backend/internal/tmdb"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Handler struct {
	tmdb      *tmdb.Client
	cache     *cache.RedisCache
	moviesCol *mongo.Collection
}

func NewHandler(db *mongo.Database, tmdbClient *tmdb.Client, cache *cache.RedisCache) *Handler {
	return &Handler{
		tmdb:      tmdbClient,
		cache:     cache,
		moviesCol: db.Collection("cached_movies"),
	}
}

type MovieWithTrailer struct {
	Data       tmdb.MovieFromTMDB `json:"data"`
	YoutubeKey string             `json:"youtubeKey"`
}

//
// ============ POPULARNE ============
// GET /api/movies/popular?limit=10
//
func (h *Handler) GetPopular(c *gin.Context) {
	limit := 10
	if lStr := c.Query("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	cacheKey := "movies:popular:limit:" + strconv.Itoa(limit)

	// -------- L1: REDIS --------
	if h.cache != nil && h.cache.Exists(cacheKey) {
		if cached, err := h.cache.Get(cacheKey); err == nil {
			var cachedResult []gin.H
			if json.Unmarshal([]byte(cached), &cachedResult) == nil {
				c.JSON(http.StatusOK, cachedResult)
				return
			}
		}
	}

	// -------- TMDB: zbieramy aż do limit filmów z trailerem --------
	maxPages := 10
	var result []gin.H

	for page := 1; page <= maxPages && len(result) < limit; page++ {
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
				continue
			}

			result = append(result, gin.H{
				"id":         m.ID,
				"title":      m.Title,
				"posterPath": m.PosterPath,
				"voteAvg":    m.VoteAvg,
				"youtubeKey": trailerKey,
			})

			// cache do Mongo (lekki – overview może być puste, uzupełni go GetDetails)
			ctxUp, cancelUp := context.WithTimeout(context.Background(), 3*time.Second)
			filter := bson.M{"_id": strconv.Itoa(m.ID)}
			update := bson.M{
				"$set": models.CachedMovie{
					ID:         strconv.Itoa(m.ID),
					MovieID:    m.ID,
					Title:      m.Title,
					PosterPath: m.PosterPath,
					VoteAvg:    m.VoteAvg,
					YoutubeKey: trailerKey,
					Category:   "popular",
					CreatedAt:  time.Now(),
				},
			}
			opts := options.Update().SetUpsert(true)
			_, _ = h.moviesCol.UpdateOne(ctxUp, filter, update, opts)
			cancelUp()
		}
	}

	if len(result) > limit {
		result = result[:limit]
	}

	if h.cache != nil {
		jsonData, _ := json.Marshal(result)
		_ = h.cache.Set(cacheKey, string(jsonData))
	}

	c.JSON(http.StatusOK, result)
}

//
// ============ SZCZEGÓŁY FILMU ============
// GET /api/movies/:id
//
func (h *Handler) GetDetails(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
		return
	}

	cacheKey := "movie:details:" + idStr

	// -------- L1: REDIS --------
	if h.cache != nil && h.cache.Exists(cacheKey) {
		if cached, err := h.cache.Get(cacheKey); err == nil {
			var cachedResp MovieWithTrailer
			if json.Unmarshal([]byte(cached), &cachedResp) == nil {
				c.JSON(http.StatusOK, cachedResp)
				return
			}
		}
	}

	// -------- L2: MONGO --------
	// UWAGA: jeżeli rekord pochodzi z GetPopular, overview może być puste.
	// Wtedy nie zwracamy Mongo tylko dociągamy TMDB i uzupełniamy cache.
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var cached models.CachedMovie
	err = h.moviesCol.FindOne(ctx, bson.M{"_id": idStr}).Decode(&cached)
	if err == nil && cached.Overview != "" {
		movieData := tmdb.MovieFromTMDB{
			ID:         id,
			Title:      cached.Title,
			Overview:   cached.Overview, // ✅ opis z Mongo
			PosterPath: cached.PosterPath,
			VoteAvg:    cached.VoteAvg,
		}

		resp := MovieWithTrailer{
			Data:       movieData,
			YoutubeKey: cached.YoutubeKey,
		}

		if h.cache != nil {
			jsonData, _ := json.Marshal(resp)
			_ = h.cache.Set(cacheKey, string(jsonData))
		}

		c.JSON(http.StatusOK, resp)
		return
	}

	// -------- TMDB (fallback: brak w Mongo albo brak overview) --------
	movie, err := h.tmdb.GetMovieDetails(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "TMDB error"})
		return
	}

	trailerKey, err := h.tmdb.GetMovieTrailerKey(id)
	if err != nil {
		trailerKey = ""
	}

	resp := MovieWithTrailer{
		Data:       *movie,
		YoutubeKey: trailerKey,
	}

	// ✅ zapis do Mongo z overview
	ctxUp, cancelUp := context.WithTimeout(context.Background(), 3*time.Second)
	filter := bson.M{"_id": strconv.Itoa(movie.ID)}
	update := bson.M{
		"$set": models.CachedMovie{
			ID:         strconv.Itoa(movie.ID),
			MovieID:    movie.ID,
			Title:      movie.Title,
			Overview:   movie.Overview, // ✅ NAJWAŻNIEJSZE
			PosterPath: movie.PosterPath,
			VoteAvg:    movie.VoteAvg,
			GenreIDs:   movie.GenreIDs, // jeśli masz w tmdb.MovieFromTMDB
			YoutubeKey: trailerKey,
			Category:   "details",
			CreatedAt:  time.Now(),
		},
	}
	opts := options.Update().SetUpsert(true)
	_, _ = h.moviesCol.UpdateOne(ctxUp, filter, update, opts)
	cancelUp()

	// zapis do Redis
	if h.cache != nil {
		jsonData, _ := json.Marshal(resp)
		_ = h.cache.Set(cacheKey, string(jsonData))
	}

	c.JSON(http.StatusOK, resp)
}

//
// ============ PO GATUNKU ============
// GET /api/movies/genre?genreId=28&limit=10
//
func (h *Handler) GetByGenre(c *gin.Context) {
	genreStr := c.Query("genreId")
	if genreStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "genreId is required"})
		return
	}
	genreID, err := strconv.Atoi(genreStr)
	if err != nil || genreID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid genreId"})
		return
	}

	limit := 10
	if lStr := c.Query("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	cacheKey := "movies:genre:" + strconv.Itoa(genreID) + ":limit:" + strconv.Itoa(limit)

	// -------- L1: REDIS --------
	if h.cache != nil && h.cache.Exists(cacheKey) {
		if cached, err := h.cache.Get(cacheKey); err == nil {
			var cachedResult []gin.H
			if json.Unmarshal([]byte(cached), &cachedResult) == nil {
				c.JSON(http.StatusOK, cachedResult)
				return
			}
		}
	}

	// -------- TMDB: zbieramy aż do limit filmów z trailerem --------
	maxPages := 10
	var result []gin.H

	for page := 1; page <= maxPages && len(result) < limit; page++ {
		movies, err := h.tmdb.GetMoviesByGenre(genreID, page)
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
				continue
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

	if len(result) > limit {
		result = result[:limit]
	}

	if h.cache != nil {
		jsonData, _ := json.Marshal(result)
		_ = h.cache.Set(cacheKey, string(jsonData))
	}

	c.JSON(http.StatusOK, result)
}
