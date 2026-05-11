package controllers

import (
	"context"
	"net/http"
	"os"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"
	"damukids-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Register — регистрация нового пользователя с валидацией ИИН РК
func Register(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email"    binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		IIN      string `json:"iin"      binding:"required"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат данных", "error": err.Error()})
		return
	}

	// ── Валидация ИИН РК ──────────────────────────────────────────────────────
	if err := utils.ValidateIIN(input.IIN); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Некорректный ИИН: " + err.Error(),
		})
		return
	}

	// ── Проверка роли ─────────────────────────────────────────────────────────
	role := input.Role
	if role != "parent" && role != "patient" && role != "doctor" {
		role = "patient"
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ── Проверка дублирующего email ───────────────────────────────────────────
	count, _ := collection.CountDocuments(ctx, bson.M{"email": input.Email})
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Пользователь с таким email уже существует"})
		return
	}

	// ── Проверка дублирующего ИИН ─────────────────────────────────────────────
	iinCount, _ := collection.CountDocuments(ctx, bson.M{"iin": input.IIN})
	if iinCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Пользователь с таким ИИН уже зарегистрирован"})
		return
	}

	// ── Хеширование пароля ────────────────────────────────────────────────────
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка обработки пароля"})
		return
	}

	user := models.User{
		ID:        primitive.NewObjectID(),
		Username:  input.Username,
		Email:     input.Email,
		Password:  string(hashed),
		Role:      role,
		IIN:       input.IIN,
		Gender:    utils.IINGender(input.IIN),
		CreatedAt: time.Now(),
	}

	if _, err = collection.InsertOne(ctx, user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка при создании пользователя"})
		return
	}

	token := generateToken(user.ID.Hex())
	c.JSON(http.StatusCreated, gin.H{
		"message": "Регистрация прошла успешно",
		"token":   token,
		"user":    user,
	})
}

// Login — вход в систему
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"    binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат данных"})
		return
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	if err := collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&user); err != nil {
		// Возвращаем одно и то же сообщение, чтобы не раскрывать, существует ли email
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Неверный email или пароль"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Неверный email или пароль"})
		return
	}

	token := generateToken(user.ID.Hex())
	c.JSON(http.StatusOK, gin.H{
		"message": "Вход выполнен успешно",
		"token":   token,
		"user":    user,
	})
}

// generateToken создаёт подписанный JWT
func generateToken(userID string) string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "damukids_default_secret_change_me"
	}

	claims := jwt.MapClaims{
		"id":  userID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(72 * time.Hour).Unix(), // 3 дня
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte(secret))
	return signed
}
