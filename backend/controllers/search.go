package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func Search(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if len(q) < 2 {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID := c.GetString("userID")
	regex := primitiveRegex(q)
	results := []gin.H{}

	children := []models.Child{}
	if cursor, err := config.GetCollection("children").Find(ctx, bson.M{"parent_id": userID, "$or": []bson.M{{"name": regex}, {"iin": regex}}}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &children)
	}
	for _, child := range children {
		results = append(results, gin.H{"type": "child", "title": child.Name, "subtitle": "Ребёнок - ИИН " + child.IIN, "to": "/profile"})
	}

	appointments := []models.Appointment{}
	if cursor, err := config.GetCollection("appointments").Find(ctx, bson.M{"user_id": userID, "$or": []bson.M{{"doc_name": regex}, {"spec": regex}, {"reason": regex}}}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &appointments)
	}
	for _, appointment := range appointments {
		results = append(results, gin.H{"type": "appointment", "title": appointment.Spec, "subtitle": appointment.DocName + " - " + appointment.Date, "to": "/appointments"})
	}

	doctors := []models.User{}
	if cursor, err := config.GetCollection("users").Find(ctx, bson.M{"role": "doctor", "$or": []bson.M{{"username": regex}, {"specialty": regex}}}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &doctors)
	}
	for _, doctor := range doctors {
		results = append(results, gin.H{"type": "doctor", "title": doctor.Username, "subtitle": doctor.Specialty, "to": "/appointments"})
	}

	c.JSON(http.StatusOK, results)
}

func primitiveRegex(q string) bson.M {
	return bson.M{"$regex": q, "$options": "i"}
}
