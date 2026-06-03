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

func GetDoctorAppointments(c *gin.Context) {
	user, ok := currentUser(c)
	if !ok || user.Role != "doctor" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Доступ только для врача"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("appointments").Find(ctx, bson.M{"doctor_id": user.DoctorCode})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить записи врача"})
		return
	}
	defer cursor.Close(ctx)

	appointments := []models.Appointment{}
	if err := cursor.All(ctx, &appointments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось обработать записи врача"})
		return
	}

	c.JSON(http.StatusOK, appointments)
}

func currentUser(c *gin.Context) (models.User, bool) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return models.User{}, false
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	if err := config.GetCollection("users").FindOne(ctx, bson.M{"_id": objectID}).Decode(&user); err != nil {
		return models.User{}, false
	}
	return user, true
}
