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

func GetAppointments(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("appointments").Find(ctx, bson.M{"user_id": c.GetString("userID")})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить записи"})
		return
	}
	defer cursor.Close(ctx)

	appointments := []models.Appointment{}
	if err := cursor.All(ctx, &appointments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось обработать записи"})
		return
	}
	c.JSON(http.StatusOK, appointments)
}

func AddAppointment(c *gin.Context) {
	var appointment models.Appointment
	if err := c.ShouldBindJSON(&appointment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректные данные записи"})
		return
	}
	if appointment.DocName == "" || appointment.Spec == "" || appointment.Date == "" || appointment.Time == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Выберите врача, дату и время"})
		return
	}

	appointment.ID = primitive.NewObjectID()
	appointment.UserID = c.GetString("userID")
	appointment.Status = "planned"
	appointment.CreatedAt = time.Now()
	if appointment.Reason == "" {
		appointment.Reason = "Консультация"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if _, err := config.GetCollection("appointments").InsertOne(ctx, appointment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось создать запись"})
		return
	}
	c.JSON(http.StatusCreated, appointment)
}

func CancelAppointment(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректный ID записи"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	result, err := config.GetCollection("appointments").DeleteOne(ctx, bson.M{"_id": id, "user_id": c.GetString("userID")})
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Запись не найдена"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Запись отменена"})
}
