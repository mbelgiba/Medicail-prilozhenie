package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// UploadFile обрабатывает загрузку аватарок и документов
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Файл не найден"})
		return
	}

	// Создаем папку uploads, если ее нет
	uploadDir := "uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, os.ModePerm)
	}

	// Генерируем уникальное имя файла
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	filepath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось сохранить файл"})
		return
	}

	// Возвращаем публичный URL файла
	fileURL := fmt.Sprintf("/uploads/%s", filename)

	c.JSON(http.StatusOK, gin.H{
		"message": "Файл успешно загружен",
		"url":     fileURL,
	})
}
