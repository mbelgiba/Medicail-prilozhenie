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
			protected.GET("/doctors", controllers.GetDoctors)
			protected.GET("/catalog", controllers.GetCatalog)

			family := protected.Group("/family")
			{
				family.GET("/children", controllers.GetChildren)
				family.POST("/children", controllers.AddChild)
			}

			appointments := protected.Group("/appointments")
			{
				appointments.GET("", controllers.GetAppointments)
				appointments.GET("/", controllers.GetAppointments)
				appointments.GET("/availability", controllers.GetAppointmentAvailability)
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

		}
	}
}
