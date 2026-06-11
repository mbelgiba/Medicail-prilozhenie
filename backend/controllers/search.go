package controllers

import (
	"net/http"
	"strings"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func Search(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if len(q) < 2 {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	userID := c.GetString("userID")
	likeQuery := "%" + q + "%"
	var results []gin.H

	var children []models.Child
	config.DB.Where("parent_id = ? AND (name LIKE ? OR iin LIKE ?)", userID, likeQuery, likeQuery).Find(&children)
	for _, child := range children {
		results = append(results, gin.H{"type": "child", "title": child.Name, "subtitle": "Ребёнок - ИИН " + child.IIN, "to": "/profile"})
	}

	var appointments []models.Appointment
	config.DB.Where("user_id = ? AND (doc_name LIKE ? OR spec LIKE ? OR reason LIKE ?)", userID, likeQuery, likeQuery, likeQuery).Find(&appointments)
	for _, appointment := range appointments {
		results = append(results, gin.H{"type": "appointment", "title": appointment.Spec, "subtitle": appointment.DocName + " - " + appointment.Date, "to": "/appointments"})
	}

	var doctors []models.User
	config.DB.Where("role = ? AND (username LIKE ? OR specialty LIKE ?)", "doctor", likeQuery, likeQuery).Find(&doctors)
	for _, doctor := range doctors {
		results = append(results, gin.H{"type": "doctor", "title": doctor.Username, "subtitle": doctor.Specialty, "to": "/appointments"})
	}

	if results == nil {
		results = []gin.H{}
	}

	c.JSON(http.StatusOK, results)
}
