package list

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
	return &Service{
		col: db.Collection("user_lists"),
	}
}

func (s *Service) AddMovie(ctx context.Context, userID string, movieID int, listType models.ListType, listName string) error {
	entry := models.UserMovieEntry{
		ID:        uuid.NewString(),
		UserID:    userID,
		MovieID:   movieID,
		ListType:  listType,
		ListName:  listName,
		CreatedAt: time.Now(),
	}
	_, err := s.col.InsertOne(ctx, entry)
	return err
}

func (s *Service) GetList(ctx context.Context, userID string, listType models.ListType) ([]models.UserMovieEntry, error) {
	cur, err := s.col.Find(ctx, bson.M{
		"userId":   userID,
		"listType": listType,
	})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var result []models.UserMovieEntry
	if err := cur.All(ctx, &result); err != nil {
		return nil, err
	}
	return result, nil
}

