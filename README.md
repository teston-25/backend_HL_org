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
  
