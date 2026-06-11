package controllers

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Разрешаем всем (CORS)
	},
}

// Hub управляет клиентами WebSocket
type Hub struct {
	clients map[string]*websocket.Conn // userID -> connection
	mu      sync.Mutex
}

var WsHub = &Hub{
	clients: make(map[string]*websocket.Conn),
}

func ServeWS(c *gin.Context) {
	userID := c.Query("token") // Для простоты MVP передаем токен как userID или просто берем из query
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WS Upgrade Error:", err)
		return
	}

	WsHub.mu.Lock()
	WsHub.clients[userID] = conn
	WsHub.mu.Unlock()

	defer func() {
		WsHub.mu.Lock()
		delete(WsHub.clients, userID)
		WsHub.mu.Unlock()
		conn.Close()
	}()

	for {
		// Читаем сообщения (или просто держим коннект открытым)
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// SendNotification отправляет уведомление конкретному пользователю
func SendNotification(userID string, message interface{}) {
	WsHub.mu.Lock()
	defer WsHub.mu.Unlock()

	if conn, ok := WsHub.clients[userID]; ok {
		err := conn.WriteJSON(message)
		if err != nil {
			log.Println("WS Write Error:", err)
			conn.Close()
			delete(WsHub.clients, userID)
		}
	}
}
