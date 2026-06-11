package models

import (
	"time"

	"gorm.io/gorm"
)

type Child struct {
	ID                uint `gorm:"primaryKey" json:"id"`
	ParentID          string             `gorm:"column:parent_id" json:"parentId"`
	Name              string             `gorm:"column:name" json:"name"`
	IIN               string             `gorm:"column:iin" json:"iin"`
	BirthDate         string             `gorm:"column:birth_date" json:"birthDate"`
	Gender            string             `gorm:"column:gender" json:"gender"`
	DevelopmentStatus string             `gorm:"column:development_status" json:"developmentStatus,omitempty"`
	PrimaryNeed       string             `gorm:"column:primary_need" json:"primaryNeed,omitempty"`
	Notes             string             `gorm:"column:notes" json:"notes,omitempty"`
	AssignedDoctorIDs []string           `gorm:"column:assigned_doctor_ids;serializer:json" json:"assignedDoctorIds,omitempty"`
	Active            bool               `gorm:"column:active" json:"active"`
	CreatedAt         time.Time          `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt         time.Time          `gorm:"column:updated_at" json:"updatedAt,omitempty"`
	DeletedAt         gorm.DeletedAt     `gorm:"index" json:"-"`
}
