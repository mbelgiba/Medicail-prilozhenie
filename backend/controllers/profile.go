package controllers

import (
	"net/http"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func GetMe(c *gin.Context) {
	userID := c.GetString("userID") // email
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Некорректный пользователь"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, user)
}
