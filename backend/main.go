package main

import (
    "net/http"
    "sync"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

type User struct {
    ID       int    `json:"id"`
    Email    string `json:"email"`
    Password string `json:"password"`
    Name     string `json:"name"`
}

type Analysis struct {
    ID     int    `json:"id"`
    UserID int    `json:"user_id"`
    Type   string `json:"type"`
    Value  string `json:"value"`
}

var (
    users     = []User{}
    analyses  = []Analysis{}
    userIDSeq = 1
    analIDSeq = 1
    mu        sync.Mutex
)

func main() {
    r := gin.Default()
    configCors := cors.DefaultConfig()
    configCors.AllowAllOrigins = true
    configCors.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
    r.Use(cors.New(configCors))

    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "API сервера DamuKids (in-memory) работает! 🚀"})
    })

    r.POST("/auth/register", func(c *gin.Context) {
        var req User
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
            return
        }
        mu.Lock()
        req.ID = userIDSeq
        userIDSeq++
        users = append(users, req)
        mu.Unlock()
        c.JSON(200, gin.H{"message": "Пользователь зарегистрирован", "user": req, "token": "fake-token"})
    })

    r.POST("/auth/login", func(c *gin.Context) {
        var req User
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
            return
        }
        for _, u := range users {
            if u.Email == req.Email && u.Password == req.Password {
                c.JSON(200, gin.H{"message": "Успешный вход", "user": u, "token": "fake-token"})
                return
            }
        }
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
    })

    r.GET("/api/profile/:id", func(c *gin.Context) {
        id := c.Param("id")
        for _, u := range users {
            if id == string(rune(u.ID+'0')) {
                c.JSON(200, u)
                return
            }
        }
        c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
    })

    r.POST("/api/analysis", func(c *gin.Context) {
        var req Analysis
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные"})
            return
        }
        mu.Lock()
        req.ID = analIDSeq
        analIDSeq++
        analyses = append(analyses, req)
        mu.Unlock()
        c.JSON(200, gin.H{"message": "Анализ добавлен", "analysis": req})
    })

    r.GET("/api/analysis/:user_id", func(c *gin.Context) {
        userID := c.Param("user_id")
        result := []Analysis{}
        for _, a := range analyses {
            if userID == string(rune(a.UserID+'0')) {
                result = append(result, a)
            }
        }
        c.JSON(200, result)
    })

    r.Run(":5000")
}