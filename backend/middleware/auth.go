package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthRequired validates the Bearer JWT token in the Authorization header.
// On success it injects the user ID as "userID" into the Gin context.
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Требуется авторизация — передайте Bearer токен"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Неверный формат токена. Ожидается: Bearer <token>"})
			c.Abort()
			return
		}

		tokenStr := parts[1]
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "damukids_default_secret_change_me"
		}

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Токен недействителен или истёк. Войдите снова"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Не удалось прочитать данные токена"})
			c.Abort()
			return
		}

		userID, ok := claims["id"].(string)
		if !ok || userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Токен не содержит идентификатор пользователя"})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		
		if role, ok := claims["role"].(string); ok {
			c.Set("userRole", role)
		}

		c.Next()
	}
}

// RequireRole checks if the user has one of the allowed roles
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("userRole")
		if userRole == "" {
			c.JSON(http.StatusForbidden, gin.H{"message": "Недостаточно прав: роль не определена"})
			c.Abort()
			return
		}

		for _, role := range allowedRoles {
			if userRole == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"message": "Недостаточно прав для выполнения операции"})
		c.Abort()
	}
}
