package models

type MovieFromTMDB struct {
	ID         int     `json:"id" bson:"id"`
	Title      string  `json:"title" bson:"title"`
	Overview   string  `json:"overview" bson:"overview"`
	PosterPath string  `json:"poster_path" bson:"poster_path"`
	VoteAvg    float64 `json:"vote_average" bson:"vote_average"`
}

