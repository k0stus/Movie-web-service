package user

import (
	"context"
	"log"
	"errors"
	"net/http"
	"time"

	"movie-backend/internal/auth"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	svc       *Service
	jwtSecret string
}

func NewHandler(db *mongo.Database, jwtSecret string) *Handler {
	return &Handler{
		svc:       NewService(db),
		jwtSecret: jwtSecret,
	}
}

type registerReq struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *Handler) Register(c *gin.Context) {
    var body registerReq
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.svc.CreateUser(ctx, body.Email, body.Name, body.Password); err != nil {

	if errors.Is(err, ErrEmailExists) {
            c.JSON(http.StatusBadRequest, gin.H{"error": "email already exists"})
            return
        }

        log.Println("CreateUser error:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create user"})
        return
    }

    c.Status(http.StatusCreated)
}


type loginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var body loginReq
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user, err := h.svc.FindByEmail(ctx, body.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(body.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := auth.GenerateToken(h.jwtSecret, user.ID, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

