package list


import (
	"context"
	"time"

	"movie-backend/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service struct {
	watchlistCol *mongo.Collection
	watchedCol   *mongo.Collection
	playlistsCol *mongo.Collection
	commentsCol  *mongo.Collection
	userCol      *mongo.Collection
}

func NewService(db *mongo.Database) *Service {
	return &Service{
		watchlistCol: db.Collection("watchlist"),
		watchedCol:   db.Collection("watched"),
		playlistsCol: db.Collection("playlists"),
		commentsCol:  db.Collection("comments"),
		userCol:      db.Collection("users"),
	}
}

// ---------- WATCHLISTA ----------

func (s *Service) AddToWatchlist(ctx context.Context, userID string, movieID int) error {
	filter := bson.M{"user_id": userID, "movie_id": movieID}
	update := bson.M{
		"$setOnInsert": bson.M{
			"_id":        uuid.NewString(),
			"created_at": time.Now(),
		},
		"$set": bson.M{
			"user_id":  userID,
			"movie_id": movieID,
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := s.watchlistCol.UpdateOne(ctx, filter, update, opts)
	return err
}

func (s *Service) GetWatchlist(ctx context.Context, userID string) ([]models.WatchlistItem, error) {
	cur, err := s.watchlistCol.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []models.WatchlistItem
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

// ---------- PLAYLISTY ----------

func (s *Service) CreatePlaylist(ctx context.Context, userID, name string) (*models.Playlist, error) {
	playlist := models.Playlist{
		ID:        uuid.NewString(),
		UserID:    userID,
		Name:      name,
		MovieIDs:  []int{},
		CreatedAt: time.Now(),
	}

	_, err := s.playlistsCol.InsertOne(ctx, playlist)
	if err != nil {
		return nil, err
	}
	return &playlist, nil
}

func (s *Service) AddToPlaylist(ctx context.Context, userID, playlistID string, movieID int) error {
	filter := bson.M{"_id": playlistID, "user_id": userID}
	update := bson.M{"$addToSet": bson.M{"movie_ids": movieID}}

	res, err := s.playlistsCol.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (s *Service) GetPlaylists(ctx context.Context, userID string) ([]models.Playlist, error) {
	cur, err := s.playlistsCol.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var lists []models.Playlist
	if err := cur.All(ctx, &lists); err != nil {
		return nil, err
	}
	return lists, nil
}

func (s *Service) GetPlaylist(ctx context.Context, userID, playlistID string) (*models.Playlist, error) {
	var pl models.Playlist
	err := s.playlistsCol.FindOne(ctx, bson.M{"_id": playlistID, "user_id": userID}).Decode(&pl)
	if err != nil {
		return nil, err
	}
	return &pl, nil
}

func (s *Service) RemoveFromPlaylist(ctx context.Context, userID, playlistID string, movieID int) error {
	filter := bson.M{"_id": playlistID, "user_id": userID}
	update := bson.M{"$pull": bson.M{"movie_ids": movieID}}

	res, err := s.playlistsCol.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (s *Service) DeletePlaylist(ctx context.Context, userID, playlistID string) error {
  filter := bson.M{
    "_id":     playlistID,
    "user_id": userID,
  }

  res, err := s.playlistsCol.DeleteOne(ctx, filter)
  if err != nil {
    return err
  }
  if res.DeletedCount == 0 {
    return mongo.ErrNoDocuments
  }
  return nil
}



// ---------- KOMENTARZE ----------

func (s *Service) AddComment(ctx context.Context, userID string, movieID int, content string) (*models.Comment, error) {
	userEmail := ""

	if s.userCol != nil && userID != "" {
		var user models.User
		if err := s.userCol.FindOne(ctx, bson.M{"_id": userID}).Decode(&user); err == nil {
			userEmail = user.Email
		}
	}

	comment := models.Comment{
		ID:        uuid.NewString(),
		UserID:    userID,
		UserEmail: userEmail,
		MovieID:   movieID,
		Content:   content,
		CreatedAt: time.Now(),
	}

	_, err := s.commentsCol.InsertOne(ctx, comment)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (s *Service) GetCommentsForMovie(ctx context.Context, movieID int) ([]models.Comment, error) {
	cur, err := s.commentsCol.Find(ctx, bson.M{"movie_id": movieID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var comments []models.Comment
	if err := cur.All(ctx, &comments); err != nil {
		return nil, err
	}
	return comments, nil
}

func (s *Service) DeleteComment(ctx context.Context, userID, commentID string) error {
	filter := bson.M{"_id": commentID, "user_id": userID}

	res, err := s.commentsCol.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

// ---------- WATCHED (obejrzane, TO DO) ----------

func (s *Service) AddToWatched(ctx context.Context, userID string, movieID int) error {
	filter := bson.M{"user_id": userID, "movie_id": movieID}
	update := bson.M{
		"$setOnInsert": bson.M{
			"_id":        uuid.NewString(),
			"created_at": time.Now(),
		},
		"$set": bson.M{
			"user_id":  userID,
			"movie_id": movieID,
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := s.watchedCol.UpdateOne(ctx, filter, update, opts)
	return err
}

func (s *Service) GetWatched(ctx context.Context, userID string) ([]models.WatchlistItem, error) {
	cur, err := s.watchedCol.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []models.WatchlistItem
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}
