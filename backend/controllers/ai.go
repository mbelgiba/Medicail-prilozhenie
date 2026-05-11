package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AnalyzeHealth возвращает ИИ-отчет для фронтенда
func AnalyzeHealth(c *gin.Context) {
	// Имитация ответа от нейросети (как и в версии Node.js)
	mockResponse := gin.H{
		"status":           "success",
		"analysis":         "Golang ИИ-ассистент: На основе последних данных анализы в норме. Динамика положительная. Основные показатели соответствуют возрасту.",
		"riskLevel":        "Low",
		"recommendedGames": []string{"Гимнастика для глаз", "Пазлы логики"},
	}

	c.JSON(http.StatusOK, mockResponse)
}
