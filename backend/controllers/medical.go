package controllers

import (
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

// GetMedicalRecords получает записи
func GetMedicalRecords(c *gin.Context) {
	userID := c.GetString("userID")
	var records []models.MedicalRecord
	if err := config.DB.Where("user_id = ?", userID).Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка получения записей"})
		return
	}
	if records == nil {
		records = []models.MedicalRecord{}
	}
	c.JSON(http.StatusOK, records)
}

// AddMedicalRecord добавляет запись
func AddMedicalRecord(c *gin.Context) {
	var record models.MedicalRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат записи"})
		return
	}
	record.UserID = c.GetString("userID")
	record.VisitDate = time.Now()

	if err := config.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка при создании"})
		return
	}
	c.JSON(http.StatusCreated, record)
}
