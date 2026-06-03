package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GameProgress struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `bson:"user_id" json:"userId"`
	ChildID   string             `bson:"child_id,omitempty" json:"childId,omitempty"`
	GameID    string             `bson:"game_id" json:"gameId"`
	Score     int                `bson:"score" json:"score"`
	Coins     int                `bson:"coins" json:"coins"`
	Completed bool               `bson:"completed" json:"completed"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updatedAt"`
}

type RewardPurchase struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `bson:"user_id" json:"userId"`
	ChildID   string             `bson:"child_id,omitempty" json:"childId,omitempty"`
	ItemID    string             `bson:"item_id" json:"itemId"`
	Title     string             `bson:"title" json:"title"`
	Price     int                `bson:"price" json:"price"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}
