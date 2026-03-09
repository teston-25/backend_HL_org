# Backend_HL_org

Backend API for the Hibret Lebego organization project, built with Node.js, Express, and TypeScript. This application handles donations, contact forms, news management, and admin authentication using a payment integration with Chapa (Ethiopian payment gateway).

## Features

### Payment System (Chapa Integration)

- **Donation Processing**: Secure payment processing for donations in Ethiopian Birr (ETB)
- **Payment Initiation**: Create payment requests with donor details
- **Payment Verification**: Verify transaction status with Chapa API
- **Webhook Handling**: Automatic callback processing for payment confirmations
- **Transaction Tracking**: Store and retrieve donation records with status tracking

### Admin Management

- Admin authentication with JWT tokens (tokens expire after 1 day)
- Role-based access control (Super Admin and Admin roles)
- **Single Super Admin policy**: Only one Super Admin account allowed at a time
- Super Admin can manage other admin users (create, update, delete regular admins)
- Cannot delete the last Super Admin or promote multiple users to Super Admin
- Secure password hashing with bcrypt

### Content Management

- News articles with slug-based URLs
- Contact form submissions
- File upload support for images/documents

### Database

- PostgreSQL database with Prisma ORM
- Migration support for schema updates
- Models: Admin, Donation, Contact, News

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Chapa API
- **HTTP Client**: Axios
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Backend_HL_org
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   CHAPA_SECRET_KEY="your_chapa_secret_key"
   BASE_URL="http://localhost:3000"
   JWT_SECRET="your_jwt_secret_key"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or the port specified in your environment).

## API Endpoints

### Payment Endpoints

- `POST /api/initialize-payment` - Initialize a new payment/donation
- `GET /api/verify-payment/:tx_ref` - Verify payment status
- `POST /api/payment-callback` - Handle Chapa webhook callbacks
- `GET /api/transaction-status/:tx_ref` - Get donation details

### Admin Endpoints

- `POST /api/admin/login` - Admin authentication
- `PUT /api/admin/password` - Update own password (authenticated admin)
- `GET /api/admin/admins` - List all admins (Super Admin only)
- `POST /api/admin/admins` - Create new admin (Super Admin only)
- `PUT /api/admin/admins/:id` - Update admin (Super Admin only)
- `DELETE /api/admin/admins/:id` - Delete admin (Super Admin only)
- `GET /api/admin/news` - Get all news articles
- `POST /api/admin/news` - Create new news article
- `PUT /api/admin/news/:id` - Update news article
- `DELETE /api/admin/news/:id` - Delete news article
- `GET /api/admin/contacts` - List contacts
- `GET /api/admin/donations` - List donations
- `CRUD /api/admin/emergencies` - Emergency updates
- `GET/PUT /api/admin/beneficiary-stats` - Manage stats
- `GET/POST /api/admin/audit-log` - Financial audit log
- `POST /api/admin/transparency-files` - Upload transparency PDFs

### Public Endpoints

- `GET /api/news` - Get published news articles
- `GET /api/news/:slug` - Get specific news article by slug
- `POST /api/contact` - Submit contact form
- `GET /api/emergencies` - Public emergencies
- `GET /api/transparency-files` - Public transparency PDFs
- `GET /api/beneficiary-stats` - Public stats (for homepage)

## Payment Flow

1. **Initiate Payment**
   - Client sends donation details (amount, email, name, etc.) to `/api/initialize-payment`
   - Backend creates a donation record in database with status "pending"
   - Generates unique transaction reference (tx_ref)
   - Returns Chapa checkout URL

2. **Payment Processing**
   - User is redirected to Chapa's secure payment page
   - User completes payment using various methods (card, mobile money, etc.)

3. **Payment Confirmation**
   - Chapa sends webhook to `/api/payment-callback` with payment status
   - Backend updates donation status to "completed" or "failed"
   - Optional: Client can poll `/api/verify-payment/:tx_ref` for status

4. **Status Tracking**
   - All donations are stored with full details and status
   - Admin can view donation history and statistics

## Database Schema

### Donation Model

- Tracks all payment transactions
- Fields: amount, donor details, transaction reference, status, timestamps

### Admin Model

- Admin user authentication
- Fields: email, password hash, role (SUPER_ADMIN or ADMIN)

### News Model

- Content management for news articles
- Fields: title, slug, excerpt, content, publication status

### Contact Model

- Contact form submissions
- Fields: name, email, subject, message, type

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Environment Variables

| Variable           | Description                  | Required |
| ------------------ | ---------------------------- | -------- |
| `DATABASE_URL`     | PostgreSQL connection string | Yes      |
| `CHAPA_SECRET_KEY` | Chapa API secret key         | Yes      |
| `BASE_URL`         | Base URL for the application | Yes      |
| `JWT_SECRET`       | Secret key for JWT tokens    | Yes      |

## Development Notes

- The payment initialization currently uses a mock checkout URL for development
- Uncomment the actual Chapa API call in `chapaService.ts` for production
- File uploads are stored in the `uploads/` directory
- Error handling is implemented with custom error classes
- Async operations are wrapped with `catchAsync` utility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
