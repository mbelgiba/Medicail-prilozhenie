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

// GetMedicalRecords возвращает список медкарт
func GetMedicalRecords(c *gin.Context) {
	collection := config.GetCollection("medical_records")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"user_id": c.GetString("userID")})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка получения данных"})
		return
	}
	defer cursor.Close(ctx)

	var records []models.MedicalRecord
	if err = cursor.All(ctx, &records); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка обработки данных"})
		return
	}

	// Если записей нет, возвращаем пустой массив
	if records == nil {
		records = []models.MedicalRecord{}
	}

	c.JSON(http.StatusOK, records)
}

// AddMedicalRecord добавляет новую запись в медкарту
func AddMedicalRecord(c *gin.Context) {
	var record models.MedicalRecord

	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат данных"})
		return
	}

	record.ID = primitive.NewObjectID()
	record.UserID = c.GetString("userID")
	record.VisitDate = time.Now()

	collection := config.GetCollection("medical_records")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, record)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка при сохранении"})
		return
	}

	c.JSON(http.StatusCreated, record)
}
