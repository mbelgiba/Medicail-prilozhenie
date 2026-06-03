package controllers

import (
	"context"
	"net/http"
	"time"

	"damukids-backend/config"
	"damukids-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var rewardItems = []gin.H{
	{"id": "avatar-star", "title": "Звёздный аватар", "price": 30, "icon": "⭐"},
	{"id": "theme-ocean", "title": "Морская тема", "price": 50, "icon": "🌊"},
	{"id": "badge-brave", "title": "Значок смелости", "price": 40, "icon": "🏅"},
	{"id": "story-pass", "title": "Сказка после игры", "price": 70, "icon": "📖"},
}

func GetRewardShop(c *gin.Context) {
	coins, purchases := rewardBalance(c.GetString("userID"))
	c.JSON(http.StatusOK, gin.H{"coins": coins, "items": rewardItems, "purchases": purchases})
}

func BuyReward(c *gin.Context) {
	var input struct {
		ItemID  string `json:"itemId" binding:"required"`
		ChildID string `json:"childId"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Выберите награду"})
		return
	}

	item := gin.H{}
	for _, candidate := range rewardItems {
		if candidate["id"] == input.ItemID {
			item = candidate
			break
		}
	}
	if item["id"] == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Награда не найдена"})
		return
	}

	userID := c.GetString("userID")
	coins, _ := rewardBalance(userID)
	price := item["price"].(int)
	if coins < price {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Недостаточно койнов"})
		return
	}

	purchase := models.RewardPurchase{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		ChildID:   input.ChildID,
		ItemID:    input.ItemID,
		Title:     item["title"].(string),
		Price:     price,
		CreatedAt: time.Now(),
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if _, err := config.GetCollection("reward_purchases").InsertOne(ctx, purchase); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Не удалось купить награду"})
		return
	}
	c.JSON(http.StatusCreated, purchase)
}

func rewardBalance(userID string) (int, []models.RewardPurchase) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	progress := []models.GameProgress{}
	if cursor, err := config.GetCollection("game_progress").Find(ctx, bson.M{"user_id": userID}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &progress)
	}
	earned := 0
	for _, item := range progress {
		earned += item.Coins
	}

	purchases := []models.RewardPurchase{}
	if cursor, err := config.GetCollection("reward_purchases").Find(ctx, bson.M{"user_id": userID}); err == nil {
		defer cursor.Close(ctx)
		_ = cursor.All(ctx, &purchases)
	}
	spent := 0
	for _, item := range purchases {
		spent += item.Price
	}
	return earned - spent, purchases
}
