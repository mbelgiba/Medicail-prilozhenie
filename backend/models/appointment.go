package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Appointment struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       string             `bson:"user_id" json:"userId"`
	ChildID      string             `bson:"child_id,omitempty" json:"childId,omitempty"`
	ChildName    string             `bson:"child_name,omitempty" json:"childName,omitempty"`
	DoctorID     string             `bson:"doctor_id,omitempty" json:"doctorId,omitempty"`
	DocName      string             `bson:"doc_name" json:"docName"`
	Spec         string             `bson:"spec" json:"spec"`
	Date         string             `bson:"date" json:"date"`
	Time         string             `bson:"time" json:"time"`
	VisitType    string             `bson:"visit_type,omitempty" json:"visitType,omitempty"`
	LocationType string             `bson:"location_type,omitempty" json:"locationType,omitempty"`
	Reason       string             `bson:"reason" json:"reason"`
	Note         string             `bson:"note,omitempty" json:"note,omitempty"`
	Status       string             `bson:"status" json:"status"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
}
