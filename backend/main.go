package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"
	"damukids-backend/routes"
	"damukids-backend/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()

	config.ConnectDB()

	// Auto-migrate models
	err := config.DB.AutoMigrate(
		&models.User{},
		&models.Child{},
		&models.Appointment{},
		&models.MedicalRecord{},
		&models.GameProgress{},
		&models.RewardPurchase{},
	)
	if err != nil {
		log.Println("Не удалось выполнить миграцию базы данных:", err)
	}

	seedUser("test@damukids.kz", "Демо пользователь", "parent", "010101500003", "", "")
	seedUser("doctor@damukids.kz", "Смирнов А.В.", "doctor", "010101500003", "ped-001", "Педиатр")
	seedUser("logoped@damukids.kz", "Иванова Е.С.", "doctor", "010101500011", "speech-001", "Логопед-дефектолог")
	seedUser("neurolog@damukids.kz", "Ким Д.И.", "doctor", "010101500038", "neuro-001", "Детский невролог")
	seedUser("psycholog@damukids.kz", "Оспанова А.К.", "doctor", "010101500046", "psy-001", "Детский психолог")
	seedUser("admin@damukids.kz", "Администратор DamuKids", "admin", "010101500054", "", "")

	router := gin.Default()
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	router.Use(cors.New(corsConfig))

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "DamuKids API работает с MySQL"})
	})

	// Serve uploaded files
	router.Static("/uploads", "./uploads")

	routes.SetupRouter(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Не удалось запустить API: ", err)
	}
}

func seedUser(email, username, role, iin, doctorCode, specialty string) {
	var count int64
	if err := config.DB.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		log.Println("Не удалось проверить demo user:", err)
		return
	}
	if count > 0 {
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte("123456"), 12)
	if err != nil {
		log.Println("Не удалось создать пароль demo user:", err)
		return
	}

	user := models.User{
		Username:   username,
		Email:      strings.ToLower(email),
		Password:   string(hashed),
		Role:       role,
		Status:     "active",
		IIN:        iin,
		Gender:     utils.IINGender(iin),
		DoctorCode: doctorCode,
		Specialty:  specialty,
		BirthDate:  time.Now(),
		CreatedAt:  time.Now(),
	}

	if err := config.DB.Create(&user).Error; err != nil {
		log.Println("Не удалось создать demo user:", err)
	}
}
