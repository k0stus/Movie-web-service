package list

import (
	"context"
	"net/http"
	"time"

	"movie-backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	svc *Service
}

func NewHandler(db *mongo.Database) *Handler {
	return &Handler{
		svc: NewService(db),
	}
}

type addMovieReq struct {
	MovieID  int    `json:"movieId" binding:"required"`
	ListName string `json:"listName"` // tylko dla playlist
}

func (h *Handler) AddToWatchlist(c *gin.Context) {
	h.addToList(c, models.ListTypeWatchlist)
}

func (h *Handler) AddToWatched(c *gin.Context) {
	h.addToList(c, models.ListTypeWatched)
}

func (h *Handler) addToList(c *gin.Context, listType models.ListType) {
	var body addMovieReq
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := h.svc.AddMovie(ctx, userID, body.MovieID, listType, body.ListName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot save"})
		return
	}

	c.Status(http.StatusCreated)
}

func (h *Handler) GetWatchlist(c *gin.Context) {
	h.getList(c, models.ListTypeWatchlist)
}

func (h *Handler) GetWatched(c *gin.Context) {
	h.getList(c, models.ListTypeWatched)
}

func (h *Handler) getList(c *gin.Context, listType models.ListType) {
	userID := c.MustGet("userId").(string)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	list, err := h.svc.GetList(ctx, userID, listType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch list"})
		return
	}

	c.JSON(http.StatusOK, list)
}

