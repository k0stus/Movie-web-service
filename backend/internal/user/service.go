package user

import (
	"context"
	"time"
	"errors"

	"movie-backend/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	col *mongo.Collection
}

func NewService(db *mongo.Database) *Service {
	return &Service{
		col: db.Collection("users"),
	}
}

var ErrEmailExists = errors.New("email already exists")

func (s *Service) CreateUser(ctx context.Context, email, name, password string) error {
	 err := s.col.FindOne(ctx, bson.M{"email": email}).Err()
    if err == nil {
       
        return ErrEmailExists
    }
    if err != mongo.ErrNoDocuments {
        return err
    }

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if name == "" {
		name = email
	}

	user := models.User{
		ID:           uuid.NewString(),
		Email:        email,
		Name:         name,
		PasswordHash: string(hash),
		CreatedAt:    time.Now(),
	}

	_, err = s.col.InsertOne(ctx, user)
	return err
}

func (s *Service) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var u models.User
	err := s.col.FindOne(ctx, bson.M{"email": email}).Decode(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

