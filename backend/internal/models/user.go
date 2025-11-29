package models

import "time"

type User struct {
	ID           string    `bson:"_id,omitempty" json:"id"`
	Email        string    `bson:"email" json:"email"`
	PasswordHash string    `bson:"passwordHash" json:"-"`
	Name         string    `bson:"name" json:"name"`
	CreatedAt    time.Time `bson:"createdAt" json:"createdAt"`
}

