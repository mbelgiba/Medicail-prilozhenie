package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Структура Медицинской записи
type MedicalRecord struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       string             `bson:"user_id" json:"userId"`
	DoctorName   string             `bson:"doctor_name" json:"doctorName"`
	Specialty    string             `bson:"specialty" json:"specialty"`
	Diagnosis    string             `bson:"diagnosis" json:"diagnosis"`
	Prescription string             `bson:"prescription" json:"prescription"`
	Status       string             `bson:"status" json:"status"`
	VisitDate    time.Time          `bson:"visit_date" json:"visitDate"`
}
