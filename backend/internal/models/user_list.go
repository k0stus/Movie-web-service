package models

import "time"

type ListType string

const (
	ListTypeWatchlist ListType = "WATCHLIST"
	ListTypeWatched   ListType = "WATCHED"
	ListTypePlaylist  ListType = "PLAYLIST"
)

type UserMovieEntry struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	UserID    string    `bson:"userId" json:"userId"`
	MovieID   int       `bson:"movieId" json:"movieId"` // TMDB ID
	ListType  ListType  `bson:"listType" json:"listType"`
	ListName  string    `bson:"listName,omitempty" json:"listName,omitempty"` // np. nazwa playlisty
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}

