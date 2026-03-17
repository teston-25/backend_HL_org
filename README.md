<<<<<<< HEAD
<div align="center">  
  
# Backend — Hibret Lebego Organization  
  
**REST API for a nonprofit platform: donations, emergencies, news & transparency.**  
  
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)  
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)  
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?logo=prisma&logoColor=white)  
![License](https://img.shields.io/badge/License-ISC-blue)  
  
</div>  
  
---  
  
## About  
  
Backend API for the **Hibret Lebego Organization** — a nonprofit platform that accepts donations via Chapa, publishes news and emergency updates, collects contact inquiries, and provides transparency reports. Built with Express, TypeScript, PostgreSQL, and Prisma.  
  
---  
  
## Features  
  
- **Donations** — Chapa payment gateway integration (initialize, verify, webhook, email confirmation)  
- **Admin Panel** — JWT auth with role-based access (`SUPER_ADMIN` / `ADMIN`)  
- **News & Emergencies** — CRUD with slug URLs, categories, fundraising goals  
- **Contact Forms** — Public submission with admin review  
- **Transparency Reports** — PDF upload via Cloudinary  
- **Beneficiary Stats** — Editable homepage statistics  
- **Security** — Rate limiting, bcrypt hashing, Zod validation, audit logging  
  
---  
  
## Tech Stack  
  
**Runtime:** Node.js | **Framework:** Express.js | **Language:** TypeScript | **Database:** PostgreSQL | **ORM:** Prisma  
  
**Auth:** JWT + bcryptjs | **Validation:** Zod | **Payments:** Chapa API | **Storage:** Cloudinary + Multer | **Email:** Nodemailer | **Rate Limiting:** express-rate-limit  
  
---  
  
## Project Structure  
  
```  
src/  
├── config/          # Cloudinary, mail, Prisma client  
├── controllers/     # Route handlers (admin, chapa, news, etc.)  
├── middleware/       # Auth, error handler, Zod validation  
├── routes/          # Express route definitions  
├── services/        # Business logic, Chapa API, email, audit log  
├── validations/     # Zod schemas per domain  
└── index.ts         # Entry point  
prisma/  
├── schema.prisma    # Database models  
└── migrations/      # Migration history  
```  
  
---  
  
## Getting Started  
  
### Prerequisites  
  
Node.js v18+, PostgreSQL, [Chapa](https://chapa.co) account, [Cloudinary](https://cloudinary.com) account, SMTP credentials  
  
### Install & Run  
  
```bash  
git clone https://github.com/teston-25/backend_HL_org.git  
cd backend_HL_org  
npm install  
# Create .env file (see below)  
npm run prisma:generate  
npm run prisma:migrate  
npm run dev  
```  
  
Server starts at `http://localhost:5000`.  
  
---  
  
## Environment Variables  
  
```env  
DATABASE_URL="postgresql://user:pass@localhost:5432/hibret_lebego"  
PORT=5000  
CORS_ORIGIN="http://localhost:5173"  
BASE_URL="http://localhost:5000"  
JWT_SECRET="your_secret"  
CHAPA_SECRET_KEY="your_chapa_key"  
CLOUDINARY_CLOUD_NAME="your_cloud_name"  
CLOUDINARY_API_KEY="your_key"  
CLOUDINARY_API_SECRET="your_secret"  
EMAIL_HOST="smtp.example.com"  
EMAIL_PORT=587  
EMAIL_USER="you@example.com"  
EMAIL_PASS="your_password"  
EMAIL_FROM="noreply@hibretlebego.org"  
```  
  
---  
  
## Database Models  
  
8 Prisma models: **Admin**, **Donation**, **Contact**, **News**, **Emergency**, **BeneficiaryStats**, **TransparencyFile**, **AuditLog**  
  
```bash  
npm run prisma:migrate    # Apply migrations  
npm run prisma:generate   # Regenerate client  
```  
  
---  
  
## API Reference  
  
> Base: `/api/v1` | Auth: `Authorization: Bearer <token>`  
  
### Public  
  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| POST | `/donation/initialize-payment` | Start donation |  
| GET | `/donation/verify-payment/:tx_ref` | Verify payment |  
| POST | `/donation/payment-callback` | Chapa webhook |  
| GET | `/donation/transaction-status/:tx_ref` | Donation details |  
| GET | `/news` | List news |  
| GET | `/news/:id` | Single news |  
| POST | `/contacts` | Submit contact form |  
| GET | `/emergencies` | List emergencies |  
| GET | `/emergencies/active` | Active emergencies |  
| GET | `/emergencies/:id` | Single emergency |  
| GET | `/beneficiary-stats/beneficiary-stats` | Homepage stats |  
  
### Auth  
  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| POST | `/admin/login` | Login (rate-limited: 3/10min) |  
  
### Super Admin Only  
  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| POST | `/admin` | Create admin |  
| PUT | `/admin/:id` | Update admin |  
| DELETE | `/admin/:id` | Delete admin |  
  
### All Admins  
  
| Method | Endpoint | Description |  
|--------|----------|-------------|  
| GET | `/admin` | List admins |  
| PUT | `/admin/password/me` | Update own password |  
| GET/DELETE | `/admin/contacts/:id` | Manage contacts |  
| GET | `/admin/donations` | List donations |  
| GET | `/admin/donations/stats` | Donation stats |  
| POST/PUT/DELETE | `/admin/news/:id` | Manage news |  
| POST/PUT/DELETE | `/admin/emergencies/:id` | Manage emergencies |  
| PUT | `/admin/beneficiary-stats` | Update stats |  
| POST/PUT/DELETE | `/admin/transparency/:id` | Manage PDFs |  
  
---  
  
## Payment Flow  
  
```mermaid  
sequenceDiagram  
    participant Client  
    participant Backend  
    participant Chapa  
  
    Client->>Backend: POST /donation/initialize-payment  
    Backend->>Chapa: Initialize transaction  
    Chapa-->>Client: checkout_url (redirect)  
    Chapa->>Backend: POST /donation/payment-callback  
    Backend-->>Client: Confirmation email  
```  
  
---  
  
## Error Handling  
  
All errors return:  
  
```json  
{ "status": "fail", "message": "Error description" }  
```  
  
- **Dev mode** — full stack trace returned  
- **Prod mode** — only operational errors exposed; unknown errors return `"Something went wrong!"`  
  
---  
  
## Security  
  
- JWT tokens (1-day expiry) + bcrypt (12 rounds)  
- Role-based access via `requireRole` middleware  
- Login rate limiting: 3 attempts per 10 minutes  
- Zod validation on all endpoints  
- CORS restricted to configured origin  
- All admin actions logged to `AuditLog` table  
  
---  
  
## Scripts  
  
| Command | Description |  
|---------|-------------|  
| `npm run dev` | Dev server with hot reload |  
| `npm run build` | Compile TypeScript |  
| `npm start` | Run production build |  
| `npm run prisma:generate` | Generate Prisma client |  
| `npm run prisma:migrate` | Run migrations |  
  
---  
  
## Contributing  
  
1. Fork the repo  
2. Create a branch: `git checkout -b feature/your-feature`  
3. Commit and push  
4. Open a Pull Request  
  
---  
  
## License  
  
ISC  
  
---  
  
## Contact  
  
GitHub: [teston-25/backend_HL_org](https://github.com/teston-25/backend_HL_org) — Open an issue for questions or support.
=======
# Backend_HL_org

Backend API for the **Hibret Lebego Organization** project — a nonprofit platform handling donations, emergency relief, news publishing, and transparency reporting. Built with Node.js, Express, TypeScript, and PostgreSQL.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Payment Flow](#payment-flow)
- [Error Handling](#error-handling)
- [Security](#security)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Donation Processing** — Chapa (Ethiopian payment gateway) integration with full payment lifecycle
- **Admin Panel** — JWT-based auth with role-based access (Super Admin / Admin)
- **News Management** — CRUD with slug-based URLs and categories
- **Emergency Tracking** — Active emergencies with fundraising goals and aid tracking
- **Contact Forms** — Public submission with admin review
- **Transparency Reports** — PDF upload to Cloudinary for public access
- **Beneficiary Stats** — Homepage statistics management
- **Audit Logging** — Tracks admin actions (login, create, update, delete)
- **Email Notifications** — Donation confirmation emails via Nodemailer
- **Rate Limiting** — Login brute-force protection (3 attempts per 10 minutes)
- **Input Validation** — Zod schemas on all endpoints

---

## Tech Stack

| Layer            | Technology         |
| ---------------- | ------------------ |
| Runtime          | Node.js            |
| Framework        | Express.js         |
| Language         | TypeScript         |
| Database         | PostgreSQL         |
| ORM              | Prisma             |
| Authentication   | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs           |
| Validation       | Zod                |
| Payment Gateway  | Chapa API          |
| File Storage     | Cloudinary         |
| File Upload      | Multer             |
| Email            | Nodemailer         |
| HTTP Client      | Axios              |
| Rate Limiting    | express-rate-limit |

---

## Project Structure

```
Backend_HL_org/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── migrations/            # Migration history
├── src/
│   ├── config/
│   │   ├── cloudinary.ts      # Cloudinary SDK config
│   │   ├── mail.ts            # Nodemailer transporter
│   │   └── prisma.ts          # Prisma client instance
│   ├── controllers/
│   │   ├── admin.ts           # Auth, admin CRUD, contacts
│   │   ├── beneficiaryStats.ts
│   │   ├── chapa.ts           # Payment endpoints
│   │   ├── contact.ts         # Public contact form
│   │   ├── donation.ts        # Donation listing & stats
│   │   ├── emergencies.ts
│   │   ├── news.ts
│   │   └── transparency.ts    # PDF upload/update/delete
│   ├── middleware/
│   │   ├── auth.ts            # JWT authenticate + requireRole
│   │   ├── errorHandler.ts    # Global error handler
│   │   └── validate.ts        # Zod validation middleware
│   ├── routes/
│   │   ├── adminRoute.ts      # All admin-protected routes
│   │   ├── beneficiaryStatsRoute.ts
│   │   ├── chapaRoute.ts      # Payment routes
│   │   ├── contactRoute.ts
│   │   ├── emergenciesRoute.ts
│   │   └── newsRoute.ts
│   ├── services/
│   │   ├── AppError.ts        # Custom error class
│   │   ├── auditLog.ts        # Audit log helper
│   │   ├── catchAsync.ts      # Async error wrapper
│   │   ├── chapaService.ts    # Chapa API integration
│   │   ├── donationEmail.ts   # Donation confirmation template
│   │   ├── donationService.ts # Donation queries & stats
│   │   ├── emailService.ts    # Generic email sender
│   │   └── loginRateLimiter.ts
│   ├── validations/           # Zod schemas for each domain
│   └── index.ts               # App entry point
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Chapa account ([chapa.co](https://chapa.co))
- Cloudinary account (for file uploads)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/teston-25/backend_HL_org.git
cd backend_HL_org

# 2. Install dependencies
npm install

# 3. Create .env file (see Environment Variables below)

# 4. Generate Prisma client
npm run prisma:generate

# 5. Run database migrations
npm run prisma:migrate

# 6. Start development server
npm run dev
```

The server starts on `http://localhost:5000` by default (or the port set in `PORT`).

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hibret_lebego"

# Server
PORT=5000
CORS_ORIGIN="http://localhost:5173"
BASE_URL="http://localhost:5000"

# Auth
JWT_SECRET="your_jwt_secret"

# Chapa Payment
CHAPA_SECRET_KEY="your_chapa_secret_key"

# Cloudinary (for transparency PDF uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (Nodemailer)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_password"
EMAIL_FROM="noreply@hibretlebego.org"
```

| Variable                | Description                                            | Required |
| ----------------------- | ------------------------------------------------------ | :------: |
| `DATABASE_URL`          | PostgreSQL connection string                           |   Yes    |
| `JWT_SECRET`            | Secret for signing JWT tokens                          |   Yes    |
| `CHAPA_SECRET_KEY`      | Chapa API secret key                                   |   Yes    |
| `BASE_URL`              | Server base URL (for callbacks)                        |   Yes    |
| `PORT`                  | Server port (default: `5000`)                          |    No    |
| `CORS_ORIGIN`           | Allowed CORS origin (default: `http://localhost:5173`) |    No    |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                                  |   Yes    |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                     |   Yes    |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                  |   Yes    |
| `EMAIL_HOST`            | SMTP host                                              |   Yes    |
| `EMAIL_PORT`            | SMTP port                                              |   Yes    |
| `EMAIL_USER`            | SMTP username                                          |   Yes    |
| `EMAIL_PASS`            | SMTP password                                          |   Yes    |
| `EMAIL_FROM`            | Sender email address                                   |   Yes    |

---

## Database Schema

Managed by Prisma. 8 models:

```
Admin            — id, email, password_hash, role (ADMIN | SUPER_ADMIN), timestamps
Donation         — id, amount, email, first_name, last_name, phone_number, title, description, tx_ref, status, ref_id, timestamps
Contact          — id, name, email, subject, message, type, created_at
News             — id, title, slug, excerpt, content, image_url, category, published_at, created_at
Emergency        — id, title, slug, location, description, status, affected_count, raised_amount, goal_amount, aid_deployed, aid_unit, image_url, timestamps
BeneficiaryStats — id, total_beneficiaries, countries_count, water_projects, updated_at
TransparencyFile — id, title, file_url, file_type (annual_report | audit), year, created_at
AuditLog         — id, adminId, action, entity, entityId, details, createdAt
```

Run migrations:

```bash
npm run prisma:migrate
```

---

## API Reference

> Base path: `/api/v1`

### Public Endpoints

| Method | Endpoint                                      | Description               |
| :----: | --------------------------------------------- | ------------------------- |
|  GET   | `/`                                           | Health check              |
|  POST  | `/api/v1/donation/initialize-payment`         | Start a new donation      |
|  GET   | `/api/v1/donation/verify-payment/:tx_ref`     | Verify payment status     |
|  POST  | `/api/v1/donation/payment-callback`           | Chapa webhook callback    |
|  GET   | `/api/v1/donation/transaction-status/:tx_ref` | Get donation details      |
|  GET   | `/api/v1/news`                                | List all news articles    |
|  GET   | `/api/v1/news/:id`                            | Get a single news article |
|  POST  | `/api/v1/contacts`                            | Submit contact form       |
|  GET   | `/api/v1/emergencies`                         | List all emergencies      |
|  GET   | `/api/v1/emergencies/active`                  | List active emergencies   |
|  GET   | `/api/v1/emergencies/:id`                     | Get a single emergency    |
|  GET   | `/api/v1/beneficiary-stats/beneficiary-stats` | Get homepage stats        |

### Auth

| Method | Endpoint              | Description                                     |
| :----: | --------------------- | ----------------------------------------------- |
|  POST  | `/api/v1/admin/login` | Admin login (rate-limited: 3 attempts / 10 min) |

### Protected — Super Admin Only

| Method | Endpoint            | Description        |
| :----: | ------------------- | ------------------ |
|  POST  | `/api/v1/admin`     | Create a new admin |
|  PUT   | `/api/v1/admin/:id` | Update an admin    |
| DELETE | `/api/v1/admin/:id` | Delete an admin    |

### Protected — All Admins (ADMIN + SUPER_ADMIN)

| Method | Endpoint                          | Description                            |
| :----: | --------------------------------- | -------------------------------------- |
|  GET   | `/api/v1/admin`                   | List all admins                        |
|  PUT   | `/api/v1/admin/password/me`       | Update own password                    |
|  GET   | `/api/v1/admin/contacts`          | List contacts (paginated)              |
|  GET   | `/api/v1/admin/contacts/:id`      | Get single contact                     |
| DELETE | `/api/v1/admin/contacts/:id`      | Delete a contact                       |
|  GET   | `/api/v1/admin/donations`         | List donations (paginated, filterable) |
|  GET   | `/api/v1/admin/donations/stats`   | Donation statistics & overview         |
|  POST  | `/api/v1/admin/news`              | Create news article                    |
|  PUT   | `/api/v1/admin/news/:id`          | Update news article                    |
| DELETE | `/api/v1/admin/news/:id`          | Delete news article                    |
|  POST  | `/api/v1/admin/emergencies`       | Create emergency                       |
|  PUT   | `/api/v1/admin/emergencies/:id`   | Update emergency                       |
| DELETE | `/api/v1/admin/emergencies/:id`   | Delete emergency                       |
|  PUT   | `/api/v1/admin/beneficiary-stats` | Update homepage stats                  |
|  POST  | `/api/v1/admin/transparency`      | Upload transparency PDF                |
|  PUT   | `/api/v1/admin/transparency/:id`  | Update transparency file               |
| DELETE | `/api/v1/admin/transparency/:id`  | Delete transparency file               |

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

---

## Payment Flow

1. Client sends donor details + amount to `/initialize-payment`
2. Backend creates a `pending` donation record and calls Chapa API
3. Chapa returns a `checkout_url` — user is redirected there
4. After payment, Chapa sends a webhook to `/payment-callback`
5. Backend updates the donation to `completed` and sends a confirmation email
6. Client can also poll `/verify-payment/:tx_ref` to check status

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "status": "fail",
  "message": "Error description"
}
```

- **`AppError`** — Custom operational error class with `statusCode` and `isOperational` flag
- **`catchAsync`** — Wraps async controller functions to forward errors to the global handler
- **`globalErrorHandler`** — In development: returns full stack trace. In production: only operational errors are exposed; unknown errors return `"Something went wrong!"`
- **Validation errors** — Return `400` with Zod error details

---

## Security

- **JWT Authentication** — Tokens expire after 1 day. Sent via `Authorization: Bearer <token>` header.
- **Password Hashing** — bcrypt with 12 salt rounds
- **Role-Based Access** — `SUPER_ADMIN` and `ADMIN` roles enforced via `requireRole` middleware
- **Single Super Admin Policy** — Only one Super Admin allowed; cannot delete the last one
- **Login Rate Limiting** — 3 attempts per 10-minute window per IP
- **Input Validation** — Zod schemas validate body, params, and query on every endpoint
- **CORS** — Restricted to configured origin (defaults to `http://localhost:5173`)
- **Audit Logging** — Admin actions (login, create, update, delete) are recorded in the `AuditLog` table

---

## Scripts

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run dev`             | Start dev server with hot reload (`tsx watch`) |
| `npm run build`           | Compile TypeScript to `dist/`                  |
| `npm start`               | Run compiled production build                  |
| `npm run prisma:generate` | Generate Prisma client from schema             |
| `npm run prisma:migrate`  | Run database migrations                        |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

ISC
>>>>>>> 263c350 (minor updates & api documentation implemented)
