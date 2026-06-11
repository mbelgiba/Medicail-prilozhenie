package models

import (
	"time"

	"gorm.io/gorm"
)

// Структура Медицинской записи
type MedicalRecord struct {
	ID           uint `gorm:"primaryKey" json:"id"`
	UserID       string             `gorm:"column:user_id" json:"userId"`
	DoctorName   string             `gorm:"column:doctor_name" json:"doctorName"`
	Specialty    string             `gorm:"column:specialty" json:"specialty"`
	Diagnosis    string             `gorm:"column:diagnosis" json:"diagnosis"`
	Prescription string             `gorm:"column:prescription" json:"prescription"`
	Status       string             `gorm:"column:status" json:"status"`
	VisitDate    time.Time          `gorm:"column:visit_date" json:"visitDate"`
	DeletedAt    gorm.DeletedAt     `gorm:"index" json:"-"`
}
