package list

import (
    "context"
    "net/http"
    "strconv"
    "time" 
    "fmt"
       
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
    svc *Service
}

func NewHandler(db *mongo.Database) *Handler {
    return &Handler{
        svc: NewService(db),
    }
}

// --------- REQUEST STRUCTS ---------

type watchlistReq struct {
    MovieID int `json:"movieId" binding:"required"`
}

type createPlaylistReq struct {
    Name string `json:"name" binding:"required"`
}

type addToPlaylistReq struct {
    MovieID int `json:"movieId" binding:"required"`
}

type commentReq struct {
    MovieID int    `json:"movieId" binding:"required"`
    Content string `json:"content" binding:"required"`
}

// --------- WATCHLISTA ---------

func (h *Handler) AddToWatchlist(c *gin.Context) {
    userID := c.GetString("userId") // z middleware JWT
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    var body watchlistReq
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.svc.AddToWatchlist(ctx, userID, body.MovieID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot add to watchlist"})
        return
    }

    c.Status(http.StatusCreated)
}

func (h *Handler) GetWatchlist(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    items, err := h.svc.GetWatchlist(ctx, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get watchlist"})
        return
    }

    c.JSON(http.StatusOK, items)
}


func (h *Handler) AddToWatched(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    var body watchlistReq // ten sam struct: { movieId: int }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.svc.AddToWatched(ctx, userID, body.MovieID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot add to watched"})
        return
    }

    c.Status(http.StatusCreated)
}

func (h *Handler) GetWatched(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    items, err := h.svc.GetWatched(ctx, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get watched"})
        return
    }

    c.JSON(http.StatusOK, items)
}


// --------- PLAYLISTY ---------

func (h *Handler) CreatePlaylist(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    var body createPlaylistReq
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    pl, err := h.svc.CreatePlaylist(ctx, userID, body.Name)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create playlist"})
        return
    }

    c.JSON(http.StatusCreated, pl)
}

func (h *Handler) GetPlaylists(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    lists, err := h.svc.GetPlaylists(ctx, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get playlists"})
        return
    }

    c.JSON(http.StatusOK, lists)
}

func (h *Handler) GetPlaylist(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    playlistID := c.Param("id")
    if playlistID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "playlist id required"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    pl, err := h.svc.GetPlaylist(ctx, userID, playlistID)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get playlist"})
        return
    }

    c.JSON(http.StatusOK, pl)
}

func (h *Handler) AddToPlaylist(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    playlistID := c.Param("id")
    if playlistID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "playlist id required"})
        return
    }

    var body addToPlaylistReq
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.svc.AddToPlaylist(ctx, userID, playlistID, body.MovieID); err != nil {
        if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot add to playlist"})
        return
    }

    c.Status(http.StatusCreated)
}

func (h *Handler) RemoveFromPlaylist(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    playlistID := c.Param("id")
    if playlistID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "playlist id required"})
        return
    }

    var body addToPlaylistReq 
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.svc.RemoveFromPlaylist(ctx, userID, playlistID, body.MovieID); err != nil {
        if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot remove from playlist"})
        return
    }

    c.Status(http.StatusNoContent)
}

func (h *Handler) DeletePlaylist(c *gin.Context) {
  userID := c.GetString("userId")      
  playlistID := c.Param("id")
  fmt.Println("DeletePlaylist playlistID =", playlistID, "userID =", userID)

  err := h.svc.DeletePlaylist(c.Request.Context(), userID, playlistID)
  if err != nil {
    if err == mongo.ErrNoDocuments {
      c.JSON(http.StatusNotFound, gin.H{"error": "playlist not found"})
      return
    }
    c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete playlist"})
    return
  }

  c.Status(http.StatusNoContent)
}



// --------- KOMENTARZE ---------

func (h *Handler) AddComment(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    var body commentReq
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    comment, err := h.svc.AddComment(ctx, userID, body.MovieID, body.Content)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot add comment"})
        return
    }

    c.JSON(http.StatusCreated, comment)
}

func (h *Handler) GetCommentsForMovie(c *gin.Context) {
    movieIDStr := c.Param("movieId")
    movieID, err := strconv.Atoi(movieIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid movie id"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    comments, err := h.svc.GetCommentsForMovie(ctx, movieID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot get comments"})
        return
    }

    c.JSON(http.StatusOK, comments)
}

func (h *Handler) DeleteComment(c *gin.Context) {
    userID := c.GetString("userId")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    commentID := c.Param("id")
    if commentID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "comment id required"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := h.svc.DeleteComment(ctx, userID, commentID); err != nil {
        if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete comment"})
        return
    }

    c.Status(http.StatusNoContent)
}

