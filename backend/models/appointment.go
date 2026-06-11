package models

import (
	"time"

	"gorm.io/gorm"
)

type Appointment struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	UserID       string             `gorm:"column:user_id" json:"userId"`
	ChildID      string             `gorm:"column:child_id" json:"childId,omitempty"`
	ChildName    string             `gorm:"column:child_name" json:"childName,omitempty"`
	DoctorID     string             `gorm:"column:doctor_id" json:"doctorId,omitempty"`
	DocName      string             `gorm:"column:doc_name" json:"docName"`
	Spec         string             `gorm:"column:spec" json:"spec"`
	Date         string             `gorm:"column:date" json:"date"`
	Time         string             `gorm:"column:time" json:"time"`
	VisitType    string             `gorm:"column:visit_type" json:"visitType,omitempty"`
	LocationType string             `gorm:"column:location_type" json:"locationType,omitempty"`
	Reason       string             `gorm:"column:reason" json:"reason"`
	Note         string             `gorm:"column:note" json:"note,omitempty"`
	Status       string             `gorm:"column:status" json:"status"`
	CreatedAt    time.Time          `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt    time.Time          `gorm:"column:updated_at" json:"updatedAt,omitempty"`
	DeletedAt    gorm.DeletedAt     `gorm:"index" json:"-"`
}
