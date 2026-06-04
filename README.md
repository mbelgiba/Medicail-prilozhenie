# DamuKids - медицинская платформа для семьи

DamuKids — простой рабочий MVP медицинской платформы для родителей и специалистов. Проект похож по базовой логике на пациентский кабинет Damumed: вход, семейный профиль, запись к врачу, медицинская карта и карта учреждений. Отдельный фокус — поддержка детей с ЗПР/ЗРР через домашние упражнения, которые сохраняют прогресс после занятий.

## Возможности
- Авторизация и регистрация с проверкой ИИН РК.
- Семейные профили: прикрепление детей по ИИН.
- Запись к врачам из базы данных MongoDB.
- Кабинет врача со списком его приемов.
- Медицинская карта: визиты, диагнозы, назначения.
- Упражнения для ЗПР/ЗРР: речь, артикуляция, внимание и бытовые навыки.
- Журнал сохраненных занятий.
- Карта реальных медицинских объектов из OpenStreetMap рядом с GPS-точкой.

## Технологии
- Frontend: React, React Router, Leaflet, React Icons
- Backend: Go, Gin, MongoDB
- Desktop wrapper: Electron

## Запуск

Backend:

```bash
cd backend
go run main.go
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Docker:

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f
docker-compose down
```

Если frontend открыт не с `localhost`, API по умолчанию будет искать backend на том же IP/домене и порту `5000`. Для другого адреса задайте:

```bash
REACT_APP_API_URL=http://YOUR_SERVER_IP:5000/api npm start
```

## Демо-аккаунты

Родитель:
```text
test@damukids.kz
123456
```

Врач:
```text
doctor@damukids.kz
123456
```
