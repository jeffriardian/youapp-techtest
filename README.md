YouApp – Full-stack Technical Challenge

Fullstack implementation of the YouApp technical test.

Tech Stack

Frontend: Next.js 14 (App Router, TS, Tailwind, Axios)

Backend: NestJS (TS, MongoDB/Mongoose, JWT Auth, Swagger)

Messaging: RabbitMQ (notifs chat)

Database: MongoDB

Containerization: Docker & Docker Compose

Services & Ports

Frontend: http://localhost:3000

Backend (API): http://localhost:3001

Swagger Docs: http://localhost:3001/api-docs

RabbitMQ Management: http://localhost:15672
 (user/pass dari .env / compose)

MongoDB: localhost:27017 (via container)

Features

Auth: Register & Login (JWT)

Profile

Create / Get / Update (berdasarkan user dari JWT, bukan body)

Auto-calc Horoscope (Western) & Chinese Zodiac

Edit display name, gender, birthday, height, weight, bio, avatar

Add / remove interests

Messaging

Kirim & ambil riwayat chat

Publish notifikasi via RabbitMQ

File Uploads (Avatar)

Endpoint: POST /api/files/upload

Form field: avatar (multipart/form-data)

Response contoh:

{ "url": "/uploads/1699999999999-123456789.png", "filename": "1699999999999-123456789.png" }


File disimpan di folder /app/uploads di container backend. Di host, dimount ke ./uploads (lihat docker-compose.yml).

Akses gambar dari FE pakai URL absolut backend, contoh:
http://localhost:3001/uploads/1699999999999-123456789.png

Quick Start
# 1) copy env backend
cp .env.example .env

# 2) build + run semuanya
docker compose up --build


Buka:

FE: http://localhost:3000

API docs: http://localhost:3001/api-docs

Catatan CORS: backend sudah enableCors untuk origin http://localhost:3000.

Env

Pakai .env.example → .env untuk backend (JWT secret, RabbitMQ creds, dsb).

FE pakai env dari compose: NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api.

Scripts berguna
# stop semua
docker compose down

# bersih sekalian volume (wipe database & uploads)
docker compose down -v

# rebuild kalau ubah dependency
docker compose up --build

Directory Structure (ringkas)
.
├─ backend/
│  ├─ src/
│  │  ├─ auth/ ...
│  │  ├─ profiles/ ...
│  │  └─ main.ts (serve /uploads + endpoint /api/files/upload)
│  └─ ...
├─ frontend/
│  └─ app/ (initial, profile, interest)
├─ uploads/           # mount untuk file avatar (host)
├─ docker-compose.yml
└─ README.md

Troubleshooting

CORS error saat upload: Pastikan request menuju http://localhost:3001/api/files/upload dan origin FE http://localhost:3000.

Gambar 404 dari FE: Pastikan pakai URL backend (http://localhost:3001/uploads/...), bukan http://localhost:3000/uploads/....

400 “userId must be a string”: Jangan kirim userId di body—profil dikaitkan via JWT (controller baca req.user.sub). Jika swagger contoh masih ada userId, abaikan itu.