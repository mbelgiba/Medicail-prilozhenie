package controllers

import (
	"context"
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"
	"damukids-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetChildren(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.GetCollection("children").Find(ctx, bson.M{"parent_id": c.GetString("userID")})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить детей"})
		return
	}
	defer cursor.Close(ctx)

	children := []models.Child{}
	if err := cursor.All(ctx, &children); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось обработать детей"})
		return
	}
	c.JSON(http.StatusOK, children)
}

func AddChild(c *gin.Context) {
	var input struct {
		Name              string `json:"name" binding:"required"`
		IIN               string `json:"iin" binding:"required"`
		BirthDate         string `json:"birthDate" binding:"required"`
		DevelopmentStatus string `json:"developmentStatus"`
		PrimaryNeed       string `json:"primaryNeed"`
		Notes             string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Заполните ФИО, ИИН и дату рождения"})
		return
	}
	if err := utils.ValidateIIN(input.IIN); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректный ИИН: " + err.Error()})
		return
	}

	parentID := c.GetString("userID")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	duplicate, _ := config.GetCollection("children").CountDocuments(ctx, bson.M{"parent_id": parentID, "iin": input.IIN})
	if duplicate > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Этот ребёнок уже прикреплён к вашему профилю"})
		return
	}

	count, _ := config.GetCollection("children").CountDocuments(ctx, bson.M{"parent_id": parentID})
	child := models.Child{
		ID:                primitive.NewObjectID(),
		ParentID:          parentID,
		Name:              input.Name,
		IIN:               input.IIN,
		BirthDate:         input.BirthDate,
		Gender:            utils.IINGender(input.IIN),
		DevelopmentStatus: input.DevelopmentStatus,
		PrimaryNeed:       input.PrimaryNeed,
		Notes:             input.Notes,
		Active:            count == 0,
		CreatedAt:         time.Now(),
	}

	if _, err := config.GetCollection("children").InsertOne(ctx, child); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось прикрепить ребёнка"})
		return
	}
	c.JSON(http.StatusCreated, child)
}
