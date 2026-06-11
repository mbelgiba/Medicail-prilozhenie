package controllers

import (
	"net/http"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func GetNotifications(c *gin.Context) {
	userID := c.GetString("userID")
	var notifications []gin.H

	var appointments []models.Appointment
	config.DB.Where("user_id = ?", userID).Find(&appointments)
	for _, appointment := range appointments {
		notifications = append(notifications, gin.H{
			"id":    "appointment-" + appointment.Time, // Using time or something since ID is not hex
			"type":  "appointment",
			"title": "Запись к врачу",
			"text":  appointment.Date + " в " + appointment.Time + " - " + appointment.Spec,
		})
	}

	var progress []models.GameProgress
	config.DB.Where("user_id = ?", userID).Find(&progress)
	for _, item := range progress {
		notifications = append(notifications, gin.H{
			"id":    "game-" + item.GameID,
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
	var digits []byte
	for value > 0 {
		digits = append([]byte{byte('0' + value%10)}, digits...)
		value /= 10
	}
	return string(digits)
}
