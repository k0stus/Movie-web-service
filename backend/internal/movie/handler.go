package movie

import (
	"net/http"
	"strconv"
	
	"movie-backend/internal/models"
	"movie-backend/internal/tmdb"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	tmdb *tmdb.Client
}

func NewHandler(tmdbClient *tmdb.Client) *Handler {
	return &Handler{tmdb: tmdbClient}
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

    c.JSON(http.StatusOK, result)
}


func (h *Handler) GetDetails(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
		return
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

	c.JSON(http.StatusOK, resp)
}

