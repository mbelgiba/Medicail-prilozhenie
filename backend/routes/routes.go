package routes

import (
	"damukids-backend/controllers"
	"damukids-backend/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter registers all API endpoints
func SetupRouter(router *gin.Engine) {
	api := router.Group("/api")
	{
		// ── Public routes (no auth required) ──────────────────────────────────
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}

		// ── Protected routes (JWT required) ───────────────────────────────────
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired())
		{
			// Medical records
			medical := protected.Group("/medical")
			{
				medical.GET("/", controllers.GetMedicalRecords)
				medical.POST("/", controllers.AddMedicalRecord)
			}

			// AI analysis
			ai := protected.Group("/ai")
			{
				ai.POST("/analyze", controllers.AnalyzeHealth)
			}
		}
	}
}
