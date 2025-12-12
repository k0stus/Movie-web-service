package router

import (
	"movie-backend/internal/auth"
	"movie-backend/internal/list"
	"movie-backend/internal/movie"
	"movie-backend/internal/user"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Deps struct {
	UserHandler  *user.Handler
	MovieHandler *movie.Handler
	ListHandler  *list.Handler
	JWTSecret    string
}

func New(deps Deps) *gin.Engine {
	r := gin.Default()
	r.Use(cors.Default())

	api := r.Group("/api")

	// -------- AUTH --------
	api.POST("/auth/register", deps.UserHandler.Register)
	api.POST("/auth/login", deps.UserHandler.Login)

	// -------- PUBLIC MOVIES --------
	api.GET("/movies/popular", deps.MovieHandler.GetPopular)
	api.GET("/movies/:id", deps.MovieHandler.GetDetails)
	api.GET("/movies/genre", deps.MovieHandler.GetByGenre)

	// -------- PUBLIC COMMENTS (do podglądu komentarzy do filmu) --------
	api.GET("/comments/:movieId", deps.ListHandler.GetCommentsForMovie)

	// -------- PROTECTED (wymaga JWT) --------
	protected := api.Group("/")
	protected.Use(auth.JWTMiddleware(deps.JWTSecret))
	{
		// WATCHLIST
		protected.POST("/lists/watchlist", deps.ListHandler.AddToWatchlist)
		protected.GET("/lists/watchlist", deps.ListHandler.GetWatchlist)


		// WATCHED
		protected.POST("/lists/watched", deps.ListHandler.AddToWatched)
		protected.GET("/lists/watched", deps.ListHandler.GetWatched)

		// PLAYLISTY
		protected.POST("/playlists", deps.ListHandler.CreatePlaylist)
		protected.GET("/playlists", deps.ListHandler.GetPlaylists)
		protected.GET("/playlists/:id", deps.ListHandler.GetPlaylist)
		protected.POST("/playlists/:id/add", deps.ListHandler.AddToPlaylist)
		protected.DELETE("/playlists/:id/remove", deps.ListHandler.RemoveFromPlaylist)
		protected.DELETE("/playlists/:id",   deps.ListHandler.DeletePlaylist)

		// KOMENTARZE (dodawanie komentarza wymaga logowania)
		protected.POST("/comments", deps.ListHandler.AddComment)
		protected.DELETE("/comments/:id", deps.ListHandler.DeleteComment)
	}


	return r
}
