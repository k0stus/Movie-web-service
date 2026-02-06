package router

import (
	"movie-backend/internal/auth"
	"movie-backend/internal/list"
	"movie-backend/internal/movie"
	"movie-backend/internal/review"
	"movie-backend/internal/user"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Deps struct {
	UserHandler   *user.Handler
	MovieHandler  *movie.Handler
	ListHandler   *list.Handler
	ReviewHandler *review.Handler
	JWTSecret     string
}

func New(deps Deps) *gin.Engine {
	r := gin.Default()
	r.Use(cors.Default())

	api := r.Group("/api")

	// auth
	api.POST("/auth/register", deps.UserHandler.Register)
	api.POST("/auth/login", deps.UserHandler.Login)

	// public movies
	api.GET("/movies/popular", deps.MovieHandler.GetPopular)
	api.GET("/movies/:id", deps.MovieHandler.GetDetails)

	// public reviews
	api.GET("/movies/:id/reviews", deps.ReviewHandler.List)

	// protected
	protected := api.Group("/")
	protected.Use(auth.JWTMiddleware(deps.JWTSecret))
	{
		protected.POST("/lists/watchlist", deps.ListHandler.AddToWatchlist)
		protected.GET("/lists/watchlist", deps.ListHandler.GetWatchlist)

		protected.POST("/lists/watched", deps.ListHandler.AddToWatched)
		protected.GET("/lists/watched", deps.ListHandler.GetWatched)

		protected.POST("/movies/:id/reviews", deps.ReviewHandler.Create)
		protected.DELETE("/movies/:id/reviews", deps.ReviewHandler.Delete)

	}

	return r
}
