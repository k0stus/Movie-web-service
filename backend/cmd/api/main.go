package main

import (
	"log"

	"movie-backend/internal/cache"
	"movie-backend/internal/config"
	"movie-backend/internal/db"
	"movie-backend/internal/list"
	"movie-backend/internal/movie"
	"movie-backend/internal/router"
	"movie-backend/internal/tmdb"
	"movie-backend/internal/user"
)

func main() {
	cfg := config.Load()

	client, err := db.NewMongoClient(cfg.MongoURI)
	if err != nil {
		log.Fatal("cannot connect to Mongo:", err)
	}
	database := client.Database(cfg.MongoDB)

	tmdbClient := tmdb.NewClient(cfg.TMDBApiKey)

	// ---- Redis ----
	var redisCache *cache.RedisCache
	if cfg.RedisURI != "" && cfg.RedisTTL > 0 {
		rc, err := cache.NewRedisCache(cfg.RedisURI, cfg.RedisTTL)
		if err != nil {
			log.Println("Redis disabled, cannot init:", err)
		} else {
			log.Println("Redis cache enabled")
			redisCache = rc
		}
	} else {
		log.Println("Redis not configured, cache disabled")
	}

	userHandler := user.NewHandler(database, cfg.JWTSecret)
	movieHandler := movie.NewHandler(database, tmdbClient, redisCache)
	listHandler := list.NewHandler(database)

	r := router.New(router.Deps{
		UserHandler:  userHandler,
		MovieHandler: movieHandler,
		ListHandler:  listHandler,
		JWTSecret:    cfg.JWTSecret,
	})

	log.Println("Server running on port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
