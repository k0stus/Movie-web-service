package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI   string
	MongoDB    string
	TMDBApiKey string
	JWTSecret  string
	Port       string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		MongoURI:   os.Getenv("MONGO_URI"),
		MongoDB:    os.Getenv("MONGO_DB"),
		TMDBApiKey: os.Getenv("TMDB_API_KEY"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
		Port:       os.Getenv("PORT"),
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	log.Println("Config loaded")
	return cfg
}

