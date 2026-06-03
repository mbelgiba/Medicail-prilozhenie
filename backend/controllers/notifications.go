package controllers

import (
	"context"
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetNotifications(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID := c.GetString("userID")
	notifications := []gin.H{}

	appointments := []models.Appointment{}
	if cursor, err := config.GetCollection("appointments").Find(ctx, bson.M{"user_id": userID}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &appointments)
	}
	for _, appointment := range appointments {
		notifications = append(notifications, gin.H{
			"id":    "appointment-" + appointment.ID.Hex(),
			"type":  "appointment",
			"title": "Запись к врачу",
			"text":  appointment.Date + " в " + appointment.Time + " - " + appointment.Spec,
		})
	}

	progress := []models.GameProgress{}
	if cursor, err := config.GetCollection("game_progress").Find(ctx, bson.M{"user_id": userID}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &progress)
	}
	for _, item := range progress {
		notifications = append(notifications, gin.H{
			"id":    "game-" + item.ID.Hex(),
			"type":  "game",
			"title": "Прогресс игры",
			"text":  "Начислено " + itoa(item.Coins) + " койнов за игру " + item.GameID,
		})
	}

	c.JSON(http.StatusOK, notifications)
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}
	digits := []byte{}
	for value > 0 {
		digits = append([]byte{byte('0' + value%10)}, digits...)
		value /= 10
	}
	return string(digits)
}
