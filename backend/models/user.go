package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Структура Пользователя (теперь поддерживает Семью)
type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username string             `bson:"username" json:"username"`
	Email    string             `bson:"email,omitempty" json:"email,omitempty"` // У детей может не быть email
	Password string             `bson:"password" json:"-"`

	// Роли: "parent" (родитель), "child" (ребенок), "doctor" (врач)
	Role string `bson:"role" json:"role"`

	// Валидный ИИН Республики Казахстан
	IIN string `bson:"iin" json:"iin"`

	// Для семейной связи:
	ParentID primitive.ObjectID `bson:"parent_id,omitempty" json:"parentId,omitempty"` // Заполняется только у детей
	Children []User             `bson:"-" json:"children,omitempty"`                   // Список детей (не хранится напрямую в базе, собирается при запросе)

	// Дополнительные данные для детей (для графиков и ИИ)
	BirthDate time.Time `bson:"birth_date,omitempty" json:"birthDate,omitempty"`
	Gender    string    `bson:"gender,omitempty" json:"gender,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
}
