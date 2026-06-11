package controllers

import (
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"
	"damukids-backend/utils"

	"github.com/gin-gonic/gin"
)

func GetChildren(c *gin.Context) {
	userID := c.GetString("userID")
	var children []models.Child
	if err := config.DB.Where("parent_id = ?", userID).Find(&children).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось получить список детей"})
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
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат данных"})
		return
	}
	if err := utils.ValidateIIN(input.IIN); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Некорректный ИИН: " + err.Error()})
		return
	}

	parentID := c.GetString("userID")

	var duplicate int64
	config.DB.Model(&models.Child{}).Where("parent_id = ? AND iin = ?", parentID, input.IIN).Count(&duplicate)
	if duplicate > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Ребенок с таким ИИН уже добавлен"})
		return
	}

	var count int64
	config.DB.Model(&models.Child{}).Where("parent_id = ?", parentID).Count(&count)

	child := models.Child{
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

	if err := config.DB.Create(&child).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось добавить ребенка"})
		return
	}
	c.JSON(http.StatusCreated, child)
}
