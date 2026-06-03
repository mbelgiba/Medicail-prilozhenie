package main

import (
	"context"
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
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()

	config.ConnectDB()
	seedUser("test@damukids.kz", "Демо пользователь", "parent", "010101500003", "", "")
	seedUser("doctor@damukids.kz", "Смирнов А.В.", "doctor", "010101500003", "1", "Педиатр")

	router := gin.Default()
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	router.Use(cors.New(corsConfig))

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "DamuKids API работает с MongoDB"})
	})

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
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := collection.CountDocuments(ctx, bson.M{"email": email})
	if err != nil {
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
		ID:         primitive.NewObjectID(),
		Username:   username,
		Email:      strings.ToLower(email),
		Password:   string(hashed),
		Role:       role,
		IIN:        iin,
		Gender:     utils.IINGender(iin),
		DoctorCode: doctorCode,
		Specialty:  specialty,
		CreatedAt:  time.Now(),
	}

	if _, err := collection.InsertOne(ctx, user); err != nil {
		log.Println("Не удалось создать demo user:", err)
	}
}
