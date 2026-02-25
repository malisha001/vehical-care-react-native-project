# Vehicle Service Center — Full-Stack Monorepo

A complete, production-ready Vehicle Service Center application built as a monorepo with three sub-projects:

| Project      | Tech Stack                                    | Purpose                 |
| ------------ | --------------------------------------------- | ----------------------- |
| `/backend`   | Node.js · Express · TypeScript · MongoDB      | REST API + Swagger docs |
| `/admin-web` | Vite · React · TypeScript · TailwindCSS       | Admin dashboard         |
| `/mobile`    | Expo · React Native · TypeScript · NativeWind | Customer mobile app     |

---

## Features

- **JWT Authentication** — access token (15 min) + refresh token (7 days), role-based (`USER` / `ADMIN`)
- **Vehicle Cleaning** — service catalog management (CRUD by admin, browsable by users)
- **Modification Items** — parts/accessories catalog with search, category filter, stock tracking
- **Repair Booking** — time-slot system with conflict prevention via DB transactions; admin manages statuses
- **Carrier Service** — on-demand pickup requests with GPS coordinates and driver assignment
- **Admin Dashboard** — real-time stats, Recharts analytics, full CRUD for all modules
- **Swagger/OpenAPI** docs at `/api/docs`
- **Seed script** — pre-populates admin user, sample services, and 42 repair slots (7 days × 6 time slots)

---

## Prerequisites

| Tool                     | Version                    |
| ------------------------ | -------------------------- |
| Node.js                  | ≥ 18.x                     |
| npm                      | ≥ 9.x                      |
| MongoDB                  | ≥ 6.x (local or Atlas)     |
| Expo CLI                 | `npm i -g expo-cli`        |
| Android Studio / Expo Go | for running the mobile app |

---

## 1 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm run seed          # seeds admin user + sample data
npm run dev           # starts on http://localhost:5000
```

### Environment variables (`.env`)

| Variable             | Default                                     | Description                  |
| -------------------- | ------------------------------------------- | ---------------------------- |
| `PORT`               | `5000`                                      | Server port                  |
| `MONGODB_URI`        | `mongodb://localhost:27017/vehicle-service` | MongoDB connection string    |
| `JWT_SECRET`         | _(required)_                                | Secret for signing JWTs      |
| `JWT_REFRESH_SECRET` | _(required)_                                | Secret for refresh tokens    |
| `ADMIN_EMAIL`        | `admin@vehicleservice.com`                  | Seed admin email             |
| `ADMIN_PASSWORD`     | `Admin@123456`                              | Seed admin password          |
| `NODE_ENV`           | `development`                               | `development` / `production` |

### Available scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start with nodemon (hot-reload) |
| `npm run build` | Compile TypeScript → `dist/`    |
| `npm start`     | Run compiled build              |
| `npm run seed`  | Run database seeder             |

### API Documentation

Swagger UI is served at: **`http://localhost:5000/api/docs`**

---

## 2 — Admin Web Setup

```bash
cd admin-web
npm install
cp .env.example .env.local
# Edit .env.local if backend runs on a different port
npm run dev           # starts on http://localhost:5173
```

### Default admin credentials

```
Email:    admin@vehicleservice.com
Password: Admin@123456
```

> The login form validates that the role is `ADMIN`. Regular user accounts cannot log in to the admin panel.

### Environment variables (`.env.local`)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 3 — Mobile App Setup

```bash
cd mobile
npm install
cp .env.example .env
# Update EXPO_PUBLIC_API_URL if needed
npx expo start
```

Press `a` to open the Android emulator, `i` for iOS simulator, or scan the QR code with **Expo Go**.

> **Android Emulator note**: The API base URL is pre-configured as `http://10.0.2.2:5000/api` (Android's special alias for `localhost`).

### Environment variables (`.env`)

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

---

## Project Structure

```
vehical-care-react-native-project/
├── backend/
│   ├── src/
│   │   ├── config/          # env, db, swagger
│   │   ├── controllers/     # request handlers (7)
│   │   ├── middlewares/     # auth, role, error, validate
│   │   ├── models/          # Mongoose schemas (6)
│   │   ├── routes/          # Express routers (7)
│   │   ├── services/        # business logic (7)
│   │   ├── utils/           # logger, apiResponse, jwt, AppError
│   │   ├── validators/      # Zod schemas (6)
│   │   ├── seed/            # database seeder
│   │   └── app.ts           # Express entry point
│   ├── .env.example
│   └── package.json
│
├── admin-web/
│   ├── src/
│   │   ├── api/             # axios instance + all endpoints
│   │   ├── components/      # layout + reusable UI (Modal, Table, Badge)
│   │   ├── pages/           # 7 pages (Login, Dashboard + 5 CRUD pages)
│   │   ├── store/           # Zustand auth store (persisted)
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # router + protected routes
│   ├── .env.example
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── api/             # axios + all endpoint helpers
│   │   ├── navigation/      # Stack + Bottom Tab navigator
│   │   ├── screens/
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── cleaning/    # List, Detail
│   │   │   ├── modification/# List, Detail
│   │   │   ├── repair/      # Slots, BookingForm, MyBookings
│   │   │   ├── carrier/     # RequestForm, MyCarrierRequests
│   │   │   └── ProfileScreen.tsx
│   │   ├── store/           # Zustand auth store
│   │   └── types/           # TypeScript interfaces
│   ├── App.tsx
│   ├── .env.example
│   └── package.json
│
├── postman_collection.json   # Importable Postman collection
└── README.md
```

---

## API Routes Reference

### Auth — `/api/auth`

| Method | Endpoint    | Auth | Description                       |
| ------ | ----------- | ---- | --------------------------------- |
| POST   | `/register` | —    | Register new user                 |
| POST   | `/login`    | —    | Login, returns tokens             |
| POST   | `/refresh`  | —    | Refresh access token              |
| POST   | `/logout`   | User | Logout (invalidate refresh token) |
| GET    | `/me`       | User | Get current user                  |

### Cleaning Services — `/api/cleaning-services`

| Method | Endpoint | Auth  | Description              |
| ------ | -------- | ----- | ------------------------ |
| GET    | `/`      | —     | List all active services |
| GET    | `/:id`   | —     | Get service by ID        |
| POST   | `/`      | Admin | Create service           |
| PATCH  | `/:id`   | Admin | Update service           |
| DELETE | `/:id`   | Admin | Delete service           |

### Modification Items — `/api/mod-items`

| Method | Endpoint      | Auth  | Description                                      |
| ------ | ------------- | ----- | ------------------------------------------------ |
| GET    | `/`           | —     | List items (search, category filter, pagination) |
| GET    | `/categories` | —     | List all unique categories                       |
| GET    | `/:id`        | —     | Get item by ID                                   |
| POST   | `/`           | Admin | Create item                                      |
| PATCH  | `/:id`        | Admin | Update item                                      |
| PATCH  | `/:id/stock`  | Admin | Update stock quantity                            |
| DELETE | `/:id`        | Admin | Delete item                                      |

### Repair Slots — `/api/repair-slots`

| Method | Endpoint      | Auth  | Description           |
| ------ | ------------- | ----- | --------------------- |
| GET    | `/available`  | —     | List available slots  |
| GET    | `/`           | Admin | List all slots        |
| POST   | `/bulk`       | Admin | Create multiple slots |
| PATCH  | `/:id/toggle` | Admin | Toggle availability   |
| DELETE | `/:id`        | Admin | Delete slot           |

### Repair Bookings — `/api/repair-bookings`

| Method | Endpoint      | Auth  | Description                       |
| ------ | ------------- | ----- | --------------------------------- |
| GET    | `/my`         | User  | My bookings                       |
| POST   | `/`           | User  | Create booking (atomic slot lock) |
| GET    | `/`           | Admin | All bookings (filter, paginate)   |
| PATCH  | `/:id/status` | Admin | Update status + admin notes       |

### Carrier Requests — `/api/carrier-requests`

| Method | Endpoint      | Auth  | Description                     |
| ------ | ------------- | ----- | ------------------------------- |
| GET    | `/my`         | User  | My requests                     |
| POST   | `/`           | User  | Submit carrier request          |
| GET    | `/`           | Admin | All requests (filter, paginate) |
| PATCH  | `/:id/status` | Admin | Update status + driver          |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Auth  | Description                     |
| ------ | -------- | ----- | ------------------------------- |
| GET    | `/stats` | Admin | Aggregate stats for all modules |

---

## Database Models

| Model              | Key Fields                                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| `User`             | name, email, password (bcrypt), role, refreshToken                          |
| `CleaningService`  | name, description, price, duration, isActive                                |
| `ModificationItem` | name, brand, category, stockQty, isAvailable (auto), images, tags           |
| `RepairSlot`       | date, timeSlot, isAvailable, maxBookings, currentBookings                   |
| `RepairBooking`    | userId, slotId, date, timeSlot, status, issueDescription, adminNotes        |
| `CarrierRequest`   | userId, name, mobile, address, coordinates{lat,lng}, status, assignedDriver |

---

## Security

- **Helmet** — sets secure HTTP headers
- **CORS** — configurable allowed origins
- **Rate Limiting** — 200 req/15 min globally, 20 req/15 min on auth routes
- **express-mongo-sanitize** — prevents NoSQL injection
- **JWT** — short-lived access tokens, refresh token rotation
- **Zod** — strict input validation on all routes

---

## License

MIT
