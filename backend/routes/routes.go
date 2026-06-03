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
			protected.GET("/profile/me", controllers.GetMe)
			protected.GET("/search", controllers.Search)
			protected.GET("/notifications", controllers.GetNotifications)

			family := protected.Group("/family")
			{
				family.GET("/children", controllers.GetChildren)
				family.POST("/children", controllers.AddChild)
			}

			appointments := protected.Group("/appointments")
			{
				appointments.GET("", controllers.GetAppointments)
				appointments.GET("/", controllers.GetAppointments)
				appointments.POST("", controllers.AddAppointment)
				appointments.POST("/", controllers.AddAppointment)
				appointments.DELETE("/:id", controllers.CancelAppointment)
			}

			// Medical records
			medical := protected.Group("/medical")
			{
				medical.GET("", controllers.GetMedicalRecords)
				medical.GET("/", controllers.GetMedicalRecords)
				medical.POST("", controllers.AddMedicalRecord)
				medical.POST("/", controllers.AddMedicalRecord)
			}

			// AI analysis
			ai := protected.Group("/ai")
			{
				ai.POST("/analyze", controllers.AnalyzeHealth)
			}

			games := protected.Group("/games")
			{
				games.GET("", controllers.GetGames)
				games.GET("/", controllers.GetGames)
				games.GET("/progress", controllers.GetGameProgress)
				games.POST("/progress", controllers.SaveGameProgress)
			}

			doctor := protected.Group("/doctor")
			{
				doctor.GET("/appointments", controllers.GetDoctorAppointments)
			}

			rewards := protected.Group("/rewards")
			{
				rewards.GET("/shop", controllers.GetRewardShop)
				rewards.POST("/buy", controllers.BuyReward)
			}
		}
	}
}
