package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI   string
	MongoDB    string
	TMDBApiKey string
	JWTSecret  string
	Port       string
	RedisURI   string
	RedisTTL   time.Duration
}

func Load() *Config {
	_ = godotenv.Load()
	ttl, _ := time.ParseDuration(os.Getenv("REDIS_TTL"))

	cfg := &Config{
		MongoURI:   os.Getenv("MONGO_URI"),
		MongoDB:    os.Getenv("MONGO_DB"),
		TMDBApiKey: os.Getenv("TMDB_API_KEY"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
		Port:       os.Getenv("PORT"),
		RedisURI:   os.Getenv("REDIS_URI"),
		RedisTTL:   ttl,
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	log.Println("Config loaded")
	return cfg
}