package models

import "time"

type WatchlistItem struct {
    ID        string    `bson:"_id" json:"id"`
    UserID    string    `bson:"user_id" json:"userId"`
    MovieID   int       `bson:"movie_id" json:"movieId"`
    CreatedAt time.Time `bson:"created_at" json:"createdAt"`
}

type Playlist struct {
  ID        string    `bson:"_id" json:"id"`
  UserID    string    `bson:"user_id" json:"userId"`
  Name      string    `bson:"name" json:"name"`
  MovieIDs  []int     `bson:"movie_ids" json:"movieIds"`
  CreatedAt time.Time `bson:"created_at" json:"createdAt"`
}


type Comment struct {
    ID        string    `bson:"_id" json:"id"`
    UserID    string    `bson:"user_id" json:"userId"`
    UserEmail string    `bson:"user_email" json:"userEmail"`
    MovieID   int       `bson:"movie_id" json:"movieId"`
    Content   string    `bson:"content" json:"content"`
    CreatedAt time.Time `bson:"created_at" json:"createdAt"`
}

type CachedMovie struct {
	ID         string    `bson:"_id" json:"id"`          // np. "popular:123" albo "genre:28:123"
	MovieID    int       `bson:"movie_id" json:"movieId"`
	Title      string    `bson:"title" json:"title"`
	Overview   string    `bson:"overview" json:"overview"`
	PosterPath string    `bson:"poster_path" json:"poster_path"`
	VoteAvg    float64   `bson:"vote_avg" json:"vote_average"`
	GenreIDs   []int     `bson:"genre_ids" json:"genre_ids"`
	YoutubeKey string    `bson:"youtube_key" json:"youtubeKey"`
	Category   string    `bson:"category" json:"category"` // "popular" albo "genre:28"
	CreatedAt  time.Time `bson:"created_at" json:"createdAt"`
}