package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Child struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ParentID          string             `bson:"parent_id" json:"parentId"`
	Name              string             `bson:"name" json:"name"`
	IIN               string             `bson:"iin" json:"iin"`
	BirthDate         string             `bson:"birth_date" json:"birthDate"`
	Gender            string             `bson:"gender" json:"gender"`
	DevelopmentStatus string             `bson:"development_status,omitempty" json:"developmentStatus,omitempty"`
	PrimaryNeed       string             `bson:"primary_need,omitempty" json:"primaryNeed,omitempty"`
	Notes             string             `bson:"notes,omitempty" json:"notes,omitempty"`
	AssignedDoctorIDs []string           `bson:"assigned_doctor_ids,omitempty" json:"assignedDoctorIds,omitempty"`
	Active            bool               `bson:"active" json:"active"`
	CreatedAt         time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
}
