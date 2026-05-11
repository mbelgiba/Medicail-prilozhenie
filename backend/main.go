package main

import (
	"log"
	"os"

	"damukids-backend/config"
	"damukids-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Загрузка переменных окружения из .env
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Файл .env не найден, используются системные переменные")
	}

	// 2. Подключение к MongoDB
	config.ConnectDB()

	// 3. Создание сервера Gin
	router := gin.Default()

	// 4. Настройка CORS (чтобы React-фронтенд мог отправлять запросы)
	configCors := cors.DefaultConfig()
	configCors.AllowAllOrigins = true
	configCors.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(configCors))

	// 5. Базовый тестовый маршрут
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API сервера DamuKids на Golang работает! 🚀",
		})
	})

	// 6. Подключение маршрутов API
	routes.SetupRouter(router)

	// 7. Запуск сервера
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	log.Printf("🚀 Сервер запущен на порту: %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("❌ Ошибка при запуске сервера: ", err)
	}
}
