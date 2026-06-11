package models

import (
	"time"

	)

type GameProgress struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	UserID    string             `gorm:"column:user_id" json:"userId"`
	ChildID   string             `gorm:"column:child_id" json:"childId,omitempty"`
	GameID    string             `gorm:"column:game_id" json:"gameId"`
	Score     int                `gorm:"column:score" json:"score"`
	Coins     int                `gorm:"column:coins" json:"coins"`
	Completed bool               `gorm:"column:completed" json:"completed"`
	UpdatedAt time.Time          `gorm:"column:updated_at" json:"updatedAt"`
}

type RewardPurchase struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	UserID    string             `gorm:"column:user_id" json:"userId"`
	ChildID   string             `gorm:"column:child_id" json:"childId,omitempty"`
	ItemID    string             `gorm:"column:item_id" json:"itemId"`
	Title     string             `gorm:"column:title" json:"title"`
	Price     int                `gorm:"column:price" json:"price"`
	CreatedAt time.Time          `gorm:"column:created_at" json:"createdAt"`
}
