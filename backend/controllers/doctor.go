package controllers

import (
	"net/http"
	"strings"
	"fmt"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	var users []models.User
	if err := config.DB.Where("role = ? AND status != ?", models.RoleDoctor, models.UserStatusBlocked).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить список врачей"})
		return
	}

	var doctors []gin.H
	for _, user := range users {
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

	var appointments []models.Appointment
	if err := config.DB.Where("doctor_id = ?", user.DoctorCode).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить записи врача"})
		return
	}

	c.JSON(http.StatusOK, appointments)
}

func EnsureDoctorProfile(user *models.User) {
	if user.Role != models.RoleDoctor {
		return
	}
	if strings.TrimSpace(user.DoctorCode) == "" {
		user.DoctorCode = fmt.Sprint(user.ID) // Wait, we use fmt.Sprint because ID might be empty here. In GORM, ID is auto-increment.
	}
	if strings.TrimSpace(user.Specialty) == "" {
		user.Specialty = "Специалист"
	}
}

func currentUser(c *gin.Context) (models.User, bool) {
	userID := c.GetString("userID") // this is email based on my updated auth
	if userID == "" {
		return models.User{}, false
	}

	var user models.User
	if err := config.DB.Where("email = ?", userID).First(&user).Error; err != nil {
		return models.User{}, false
	}
	return user, true
}
