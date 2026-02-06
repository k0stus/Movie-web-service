package models

import "time"

type Review struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	UserID    string    `bson:"userId" json:"userId"`
	MovieID   int       `bson:"movieId" json:"movieId"` // TMDB ID
	Rating    int       `bson:"rating" json:"rating"`
	Comment   string    `bson:"comment" json:"comment"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}
