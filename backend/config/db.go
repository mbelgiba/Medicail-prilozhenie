package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

// ConnectDB подключается к MongoDB и сохраняет ссылку на базу данных
func ConnectDB() {
	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")

	if mongoURI == "" || strings.Contains(mongoURI, "<db_password>") {
		mongoURI = "mongodb://localhost:27017"
	}
	if dbName == "" {
		dbName = "damukids"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("❌ Ошибка при создании клиента MongoDB: ", err)
	}

	// Проверка подключения
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("❌ Не удалось подключиться к MongoDB: ", err)
	}

	fmt.Println("✅ Успешно подключено к базе данных MongoDB!")
	DB = client.Database(dbName)
}

// GetCollection возвращает нужную коллекцию из базы данных
func GetCollection(collectionName string) *mongo.Collection {
	return DB.Collection(collectionName)
}
