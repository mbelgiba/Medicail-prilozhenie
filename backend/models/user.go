package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username string             `bson:"username" json:"username"`
	Email    string             `bson:"email,omitempty" json:"email,omitempty"`
	Password string             `bson:"password" json:"-"`

	Role   string `bson:"role" json:"role"`
	Status string `bson:"status" json:"status"`
	Phone  string `bson:"phone,omitempty" json:"phone,omitempty"`

	DoctorCode   string `bson:"doctor_code,omitempty" json:"doctorCode,omitempty"`
	Specialty    string `bson:"specialty,omitempty" json:"specialty,omitempty"`
	Organization string `bson:"organization,omitempty" json:"organization,omitempty"`
	Cabinet      string `bson:"cabinet,omitempty" json:"cabinet,omitempty"`
	LicenseNo    string `bson:"license_no,omitempty" json:"licenseNo,omitempty"`

	IIN string `bson:"iin" json:"iin"`

	ParentID primitive.ObjectID `bson:"parent_id,omitempty" json:"parentId,omitempty"`
	Children []User             `bson:"-" json:"children,omitempty"`

	BirthDate time.Time `bson:"birth_date,omitempty" json:"birthDate,omitempty"`
	Gender    string    `bson:"gender,omitempty" json:"gender,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at,omitempty" json:"updatedAt,omitempty"`
}
