package review

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	svc *Service
}

func NewHandler(db *mongo.Database) *Handler {
	return &Handler{svc: NewService(db)}
}

type createReq struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

// Create - protected endpoint to add a review for a movie
func (h *Handler) Create(c *gin.Context) {
	var body createReq
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	idStr := c.Param("id")
	movieID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
		return
	}

	userID := c.MustGet("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := h.svc.CreateReview(ctx, userID, movieID, body.Rating, body.Comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot save review"})
		return
	}

	c.Status(http.StatusCreated)
}

// List - public endpoint to get reviews for a movie
func (h *Handler) List(c *gin.Context) {
	idStr := c.Param("id")
	movieID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	revs, err := h.svc.GetByMovie(ctx, movieID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, revs)
}

func (h *Handler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	movieID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
		return
	}

	userID := c.MustGet("userId").(string)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	deleted, err := h.svc.DeleteByUserAndMovie(ctx, userID, movieID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete review"})
		return
	}
	if !deleted {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
