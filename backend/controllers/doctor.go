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

func GetDoctors(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("users").Find(ctx, bson.M{
		"role":   models.RoleDoctor,
		"status": bson.M{"$ne": models.UserStatusBlocked},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить список врачей"})
		return
	}
	defer cursor.Close(ctx)

	doctors := []gin.H{}
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось обработать список врачей"})
			return
		}
		doctors = append(doctors, gin.H{
			"id":           user.DoctorCode,
			"name":         user.Username,
			"specialty":    user.Specialty,
			"doctorCode":   user.DoctorCode,
			"organization": user.Organization,
			"cabinet":      user.Cabinet,
			"phone":        user.Phone,
		})
	}
	if doctors == nil {
		doctors = []gin.H{}
	}

	c.JSON(http.StatusOK, doctors)
}

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

func EnsureDoctorProfile(user *models.User) {
	if user.Role != models.RoleDoctor {
		return
	}
	if strings.TrimSpace(user.DoctorCode) == "" {
		user.DoctorCode = user.ID.Hex()
	}
	if strings.TrimSpace(user.Specialty) == "" {
		user.Specialty = "Специалист"
	}
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
