package controllers

import (
	"context"
	"net/http"
	"strings"
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

func GetAppointmentAvailability(c *gin.Context) {
	doctorID := strings.TrimSpace(c.Query("doctorId"))
	date := strings.TrimSpace(c.Query("date"))
	if doctorID == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Укажите врача и дату"})
		return
	}
	if _, err := time.Parse("2006-01-02", date); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректная дата"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("appointments").Find(ctx, bson.M{
		"doctor_id": doctorID,
		"date":      date,
		"status":    "planned",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить доступность"})
		return
	}
	defer cursor.Close(ctx)

	occupied := []string{}
	for cursor.Next(ctx) {
		var appointment models.Appointment
		if err := cursor.Decode(&appointment); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось обработать доступность"})
			return
		}
		occupied = append(occupied, appointment.Time)
	}

	c.JSON(http.StatusOK, gin.H{"doctorId": doctorID, "date": date, "occupiedSlots": occupied})
}

func AddAppointment(c *gin.Context) {
	var appointment models.Appointment
	if err := c.ShouldBindJSON(&appointment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректные данные записи"})
		return
	}
	appointment.DoctorID = strings.TrimSpace(appointment.DoctorID)
	appointment.ChildID = strings.TrimSpace(appointment.ChildID)
	appointment.Date = strings.TrimSpace(appointment.Date)
	appointment.Time = strings.TrimSpace(appointment.Time)
	if appointment.DoctorID == "" || appointment.ChildID == "" || appointment.Date == "" || appointment.Time == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Выберите ребёнка, врача, дату и время"})
		return
	}
	visitDate, err := time.Parse("2006-01-02", appointment.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректная дата приёма"})
		return
	}
	today, _ := time.Parse("2006-01-02", time.Now().Format("2006-01-02"))
	if visitDate.Before(today) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Нельзя записаться на прошедшую дату"})
		return
	}

	parentID := c.GetString("userID")
	appointment.ID = primitive.NewObjectID()
	appointment.UserID = parentID
	appointment.Status = "planned"
	appointment.CreatedAt = time.Now()
	if appointment.Reason == "" {
		appointment.Reason = "Консультация"
	}
	if appointment.VisitType == "" {
		appointment.VisitType = "Первичный приём"
	}
	if appointment.LocationType == "" {
		appointment.LocationType = "Очно"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var child models.Child
	childObjectID, err := primitive.ObjectIDFromHex(appointment.ChildID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректный ID ребёнка"})
		return
	}
	if err := config.GetCollection("children").FindOne(ctx, bson.M{"_id": childObjectID, "parent_id": parentID}).Decode(&child); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Ребёнок не найден в вашем профиле"})
		return
	}

	var doctor models.User
	if err := config.GetCollection("users").FindOne(ctx, bson.M{
		"role":        models.RoleDoctor,
		"doctor_code": appointment.DoctorID,
		"status":      bson.M{"$ne": models.UserStatusBlocked},
	}).Decode(&doctor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Специалист не найден или недоступен"})
		return
	}

	slotTaken, _ := config.GetCollection("appointments").CountDocuments(ctx, bson.M{
		"doctor_id": appointment.DoctorID,
		"date":      appointment.Date,
		"time":      appointment.Time,
		"status":    "planned",
	})
	if slotTaken > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": "Это время уже занято у выбранного специалиста"})
		return
	}

	appointment.ChildName = child.Name
	appointment.DocName = doctor.Username
	appointment.Spec = doctor.Specialty

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
