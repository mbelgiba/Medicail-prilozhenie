package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func GetAppointments(c *gin.Context) {
	var appointments []models.Appointment
	
	// Теперь id (userID) может храниться как строка (Email) из токена, так как мы изменили генерацию токена.
	userID := c.GetString("userID")

	if err := config.DB.Where("user_id = ?", userID).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить записи"})
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

	var appointments []models.Appointment
	if err := config.DB.Where("doctor_id = ? AND date = ? AND status = ?", doctorID, date, "planned").Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить доступность"})
		return
	}

	var occupied []string
	for _, appt := range appointments {
		occupied = append(occupied, appt.Time)
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

	var child models.Child
	var childName string
	
	if appointment.ChildID == "self" {
		childName = "Взрослый (Родитель)"
	} else {
		if err := config.DB.Where("id = ? AND parent_id = ?", appointment.ChildID, parentID).First(&child).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Ребёнок не найден в вашем профиле"})
			return
		}
		childName = child.Name
	}

	var doctor models.User
	if err := config.DB.Where("role = ? AND doctor_code = ? AND status != ?", models.RoleDoctor, appointment.DoctorID, models.UserStatusBlocked).First(&doctor).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Специалист не найден или недоступен"})
		return
	}

	var slotTaken int64
	config.DB.Model(&models.Appointment{}).Where("doctor_id = ? AND date = ? AND time = ? AND status = ?", appointment.DoctorID, appointment.Date, appointment.Time, "planned").Count(&slotTaken)
	if slotTaken > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": "Это время уже занято у выбранного специалиста"})
		return
	}

	appointment.ChildName = childName
	appointment.DocName = doctor.Username
	appointment.Spec = doctor.Specialty

	if err := config.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось создать запись"})
		return
	}

	// Отправляем уведомление
	SendNotification(appointment.UserID, gin.H{
		"type":    "NEW_APPOINTMENT",
		"message": fmt.Sprintf("Вы успешно записались к %s на %s %s", appointment.Spec, appointment.Date, appointment.Time),
	})

	c.JSON(http.StatusCreated, appointment)
}

func CancelAppointment(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректный ID записи"})
		return
	}

	result := config.DB.Where("id = ? AND user_id = ?", id, c.GetString("userID")).Delete(&models.Appointment{})
	if result.Error != nil || result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Запись не найдена"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Запись отменена"})
}
