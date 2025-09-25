============================================================

YOUAPP – FULL-STACK TECHNICAL CHALLENGE

============================================================

Full-stack implementation of the YouApp technical test.

============================================================

TECH STACK

Frontend : Next.js 14 (App Router, TypeScript, Tailwind, Axios)

Backend : NestJS (TypeScript, MongoDB/Mongoose, JWT Auth, Swagger)

Messaging: RabbitMQ (chat notifications)

Database : MongoDB

Container: Docker & Docker Compose

============================================================

SERVICES & PORTS

Frontend : http://localhost:3000

Backend (API) : http://localhost:3001

Swagger Docs : http://localhost:3001/api-docs

RabbitMQ Mgmt : http://localhost:15672
 (credentials from .env / docker-compose)
MongoDB : localhost:27017 (via container)

============================================================

FEATURES

AUTHENTICATION

Register & Login (JWT based)

PROFILE

Create / Retrieve / Update profile (user is identified from JWT, not request body)

Auto-calculate Western Horoscope and Chinese Zodiac

Edit display name, gender, birthday, height, weight, bio, and avatar

Add or remove interests

MESSAGING

Send and retrieve chat history

Publish notifications via RabbitMQ

FILE UPLOADS (AVATAR)

Endpoint : POST /api/files/upload

Form field : avatar (multipart/form-data)

Example response :
{ "url": "/uploads/1699999999999-123456789.png", "filename": "1699999999999-123456789.png" }

Files are stored inside the backend container at /app/uploads
On host machine mounted to ./uploads (see docker-compose.yml)

Access images from frontend using backend absolute URL, e.g.
http://localhost:3001/uploads/1699999999999-123456789.png

============================================================

QUICK START

Copy backend env file
cp .env.example .env

Build and run everything
docker compose up --build

Open in browser:

Frontend : http://localhost:3000

API Docs : http://localhost:3001/api-docs

CORS NOTE: Backend enableCors is already configured for origin http://localhost:3000
.

============================================================

ENVIRONMENT

Backend : use .env.example → .env for JWT secret, RabbitMQ credentials, etc.

Frontend: env is passed from docker-compose

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

============================================================

USEFUL SCRIPTS

Stop all services:
docker compose down

Stop + remove volumes (wipe database & uploads):
docker compose down -v

Rebuild if dependencies change:
docker compose build --no-cache

============================================================

DOCUMENTATION VIDEO

Google Drive: https://drive.google.com/file/d/1PPHTqWZv0IjH0eoRgF41dNX5ypDFVDo7/view?usp=sharing