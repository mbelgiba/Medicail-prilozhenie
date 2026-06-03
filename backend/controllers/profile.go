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

func GetMe(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Некорректный пользователь"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	if err := config.GetCollection("users").FindOne(ctx, bson.M{"_id": objectID}).Decode(&user); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, user)
}
