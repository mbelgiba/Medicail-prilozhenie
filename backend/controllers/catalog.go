package controllers

import (
	"net/http"

	"damukids-backend/models"

	"github.com/gin-gonic/gin"
)

func GetCatalog(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"roles":               models.RoleLabels,
		"developmentStatuses": models.DevelopmentStatuses,
		"specialistTypes":     models.SpecialistTypes,
	})
}
