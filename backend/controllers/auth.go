package controllers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"
	"damukids-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Register — регистрация нового пользователя с валидацией ИИН РК
func Register(c *gin.Context) {
	var input struct {
		Username     string `json:"username" binding:"required"`
		Email        string `json:"email"    binding:"required,email"`
		Password     string `json:"password" binding:"required,min=6"`
		IIN          string `json:"iin"      binding:"required"`
		Role         string `json:"role"`
		Phone        string `json:"phone"`
		Specialty    string `json:"specialty"`
		Organization string `json:"organization"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Неверный формат данных", "error": err.Error()})
		return
	}
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.Username = strings.TrimSpace(input.Username)

	// ── Валидация ИИН РК ──────────────────────────────────────────────────────
	if err := utils.ValidateIIN(input.IIN); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Некорректный ИИН: " + err.Error(),
		})
		return
	}

	// ── Проверка роли ─────────────────────────────────────────────────────────
	role := strings.TrimSpace(input.Role)
	if !models.AllowedPublicRoles[role] {
		role = models.RoleParent
	}

	// ── Проверка дублирующего email ───────────────────────────────────────────
	var count int64
	config.DB.Model(&models.User{}).Where("email = ?", input.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Пользователь с таким email уже существует"})
		return
	}

	// ── Проверка дублирующего ИИН ─────────────────────────────────────────────
	config.DB.Model(&models.User{}).Where("iin = ?", input.IIN).Count(&count)
	if count > 0 {
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
		Username:     input.Username,
		Email:        input.Email,
		Password:     string(hashed),
		Role:         role,
		Status:       models.UserStatusActive,
		Phone:        strings.TrimSpace(input.Phone),
		IIN:          input.IIN,
		Specialty:    strings.TrimSpace(input.Specialty),
		Organization: strings.TrimSpace(input.Organization),
		Gender:       utils.IINGender(input.IIN),
		BirthDate:    time.Now(),
		CreatedAt:    time.Now(),
	}
	EnsureDoctorProfile(&user)

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Ошибка при создании пользователя"})
		return
	}

	// Для JWT нужен строковый ID. В GORM ID это uint (скорее всего, т.к. мы убрали ObjectID)
	// Допустим, мы парсим его как строку через fmt.Sprint или strconv
	token := generateToken(user.Email, user.Role)
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
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// Возвращаем одно и то же сообщение, чтобы не раскрывать, существует ли email
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Неверный email или пароль"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Неверный email или пароль"})
		return
	}

	token := generateToken(user.Email, user.Role)
	c.JSON(http.StatusOK, gin.H{
		"message": "Вход выполнен успешно",
		"token":   token,
		"user":    user,
	})
}

// generateToken создаёт подписанный JWT
func generateToken(userID string, role string) string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "damukids_default_secret_change_me"
	}

	claims := jwt.MapClaims{
		"id":   userID,
		"role": role,
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(72 * time.Hour).Unix(), // 3 дня
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte(secret))
	return signed
}
