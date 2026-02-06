package review

import (
	"context"
	"time"

	"movie-backend/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Service struct {
	col *mongo.Collection
}

func NewService(db *mongo.Database) *Service {
	return &Service{col: db.Collection("reviews")}
}

func (s *Service) CreateReview(ctx context.Context, userID string, movieID int, rating int, comment string) error {
	r := models.Review{
		ID:        uuid.NewString(),
		UserID:    userID,
		MovieID:   movieID,
		Rating:    rating,
		Comment:   comment,
		CreatedAt: time.Now(),
	}
	_, err := s.col.InsertOne(ctx, r)
	return err
}

func (s *Service) GetByMovie(ctx context.Context, movieID int) ([]models.Review, error) {
	cur, err := s.col.Find(ctx, bson.M{"movieId": movieID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []models.Review
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Service) DeleteByUserAndMovie(ctx context.Context, userID string, movieID int) (bool, error) {
	res, err := s.col.DeleteOne(ctx, bson.M{
		"userId":  userID,
		"movieId": movieID,
	})
	if err != nil {
		return false, err
	}
	return res.DeletedCount > 0, nil
}
