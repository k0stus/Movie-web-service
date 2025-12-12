package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
	ttl    time.Duration
	ctx    context.Context
}

// NewRedisCache initializes Redis client
func NewRedisCache(uri string, ttl time.Duration) (*RedisCache, error) {
	opts, err := redis.ParseURL(uri)
	if err != nil {
		return nil, err
	}

	rdb := redis.NewClient(opts)

	return &RedisCache{
		client: rdb,
		ttl:    ttl,
		ctx:    context.Background(),
	}, nil
}

// Set caches value for a key (with TTL)
func (rc *RedisCache) Set(key string, value string) error {
	return rc.client.Set(rc.ctx, key, value, rc.ttl).Err()
}

// Get retrieves cached value by key
func (rc *RedisCache) Get(key string) (string, error) {
	return rc.client.Get(rc.ctx, key).Result()
}

// Delete clears key
func (rc *RedisCache) Delete(key string) error {
	return rc.client.Del(rc.ctx, key).Err()
}

// Exists checks whether key exists
func (rc *RedisCache) Exists(key string) bool {
	n, _ := rc.client.Exists(rc.ctx, key).Result()
	return n == 1
}