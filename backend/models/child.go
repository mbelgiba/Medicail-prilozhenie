package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Child struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ParentID  string             `bson:"parent_id" json:"parentId"`
	Name      string             `bson:"name" json:"name"`
	IIN       string             `bson:"iin" json:"iin"`
	BirthDate string             `bson:"birth_date" json:"birthDate"`
	Gender    string             `bson:"gender" json:"gender"`
	Active    bool               `bson:"active" json:"active"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}
