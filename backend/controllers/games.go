package controllers

import (
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func GetGames(c *gin.Context) {
	c.JSON(http.StatusOK, []gin.H{
		{"id": "animals", "title": "Животные", "category": "speech"},
		{"id": "gymnastics", "title": "Артикуляционная гимнастика", "category": "speech"},
		{"id": "puzzle", "title": "Пазлы", "category": "habits"},
	})
}

func GetGameProgress(c *gin.Context) {
	userID := c.GetString("userID")
	var progress []models.GameProgress
	if err := config.DB.Where("user_id = ?", userID).Find(&progress).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить прогресс"})
		return
	}
	c.JSON(http.StatusOK, progress)
}

func SaveGameProgress(c *gin.Context) {
	var progress models.GameProgress
	if err := c.ShouldBindJSON(&progress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат данных"})
		return
	}
	if progress.GameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Игра не указана"})
		return
	}
	if progress.Coins == 0 {
		progress.Coins = progress.Score / 10
		if progress.Completed && progress.Coins < 10 {
			progress.Coins = 10
		}
	}

	progress.UserID = c.GetString("userID")
	progress.UpdatedAt = time.Now()

	if err := config.DB.Create(&progress).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось сохранить прогресс"})
		return
	}
	c.JSON(http.StatusCreated, progress)
}
