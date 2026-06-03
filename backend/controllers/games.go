package controllers

import (
	"context"
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetGames(c *gin.Context) {
	c.JSON(http.StatusOK, []gin.H{
		{"id": "animals", "title": "Звукоподражание", "category": "speech"},
		{"id": "gymnastics", "title": "Артикуляционная гимнастика", "category": "speech"},
		{"id": "puzzle", "title": "Полезные пары", "category": "habits"},
	})
}

func GetGameProgress(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("game_progress").Find(ctx, bson.M{"user_id": c.GetString("userID")})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить прогресс"})
		return
	}
	defer cursor.Close(ctx)

	progress := []models.GameProgress{}
	if err := cursor.All(ctx, &progress); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось обработать прогресс"})
		return
	}
	c.JSON(http.StatusOK, progress)
}

func SaveGameProgress(c *gin.Context) {
	var progress models.GameProgress
	if err := c.ShouldBindJSON(&progress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректный прогресс"})
		return
	}
	if progress.GameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Не указана игра"})
		return
	}
	if progress.Coins == 0 {
		progress.Coins = progress.Score / 10
		if progress.Completed && progress.Coins < 10 {
			progress.Coins = 10
		}
	}

	progress.ID = primitive.NewObjectID()
	progress.UserID = c.GetString("userID")
	progress.UpdatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if _, err := config.GetCollection("game_progress").InsertOne(ctx, progress); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось сохранить прогресс"})
		return
	}
	c.JSON(http.StatusCreated, progress)
}
