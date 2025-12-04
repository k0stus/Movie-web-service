package main

import (
	"log"

	"movie-backend/internal/config"
	"movie-backend/internal/db"
	"movie-backend/internal/list"
	"movie-backend/internal/movie"
	"movie-backend/internal/review"
	"movie-backend/internal/router"
	"movie-backend/internal/tmdb"
	"movie-backend/internal/user"
)

func main() {
	cfg := config.Load()
	client, err := db.NewMongoClient(cfg.MongoURI)
	if err != nil {
		log.Fatal("cannot connect to Mongo: ", err)
	}
	database := client.Database(cfg.MongoDB)

	tmdbClient := tmdb.NewClient(cfg.TMDBApiKey)

	userHandler := user.NewHandler(database, cfg.JWTSecret)
	movieHandler := movie.NewHandler(tmdbClient)
	listHandler := list.NewHandler(database)
	reviewHandler := review.NewHandler(database)

	r := router.New(router.Deps{
		UserHandler:   userHandler,
		MovieHandler:  movieHandler,
		ListHandler:   listHandler,
		ReviewHandler: reviewHandler,
		JWTSecret:     cfg.JWTSecret,
	})

	log.Println("Server running on port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
