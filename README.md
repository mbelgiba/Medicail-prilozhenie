# 🏥 DamuKids - Медицинская платформа будущего

DamuKids — это современная медицинская HealthTech-экосистема для всей семьи, разработанная с использованием React, Golang и Electron. Проект направлен на то, чтобы сделать медицину ближе и доступнее.

## 🌟 Ключевые возможности
- **Семейные профили:** Прикрепление детей по ИИН РК.
- **Интеграция с GPS:** Интерактивная карта ближайших поликлиник и центров (Leaflet).
- **ИИ-Ассистент:** Умный бот для анализа показателей здоровья и выдачи рекомендаций.
- **Геймификация:** Специализированные мини-игры для стимуляции развития (ЗРР/ЗПР) со встроенным синтезом речи (Text-to-Speech).
- **Медицинская аналитика:** Графики (Recharts) для отслеживания динамики анализов.
- **Документооборот:** Импорт и экспорт PDF/Изображений анализов в профиле пациента.

## 🛠 Технологии
- **Frontend:** React.js, React Router, Recharts, Leaflet, React-Icons
- **Backend:** Golang (Gin), MongoDB
- **Desktop:** Electron
- **Mobile:** Apache Cordova (в планах)

## 🚀 Запуск проекта (Режим разработки)

1. **Бэкенд (Golang):**
   ```bash
   cd backend
   go run main.go
2.Фронтенд (React):

Bash
cd frontend
npm install
npm start

3.Десктоп (Electron):

Bash
cd electron
npm start

Damumed - Делаем медицину ближе и доступнее.

docker-compose up -d
Другие полезные команды:
Остановка контейнеров:
powershell
docker-compose down
Просмотр статуса запущенных контейнеров:
powershell
docker-compose ps
Просмотр логов (если что-то не работает):
powershell
docker-compose logs -f

test@damukids.kz
123456