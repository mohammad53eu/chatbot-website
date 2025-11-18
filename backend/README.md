# Chatbot Backend - JWT Authentication

A Node.js/Express backend with PostgreSQL and JWT-based authentication.

## 🚀 Features

- ✅ User registration with email & password
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ Input validation & sanitization
- ✅ PostgreSQL database with raw queries (no ORM)
- ✅ Protected routes with authentication middleware
- ✅ TypeScript for type safety

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controllers.ts    # Register & login handlers
│   ├── database/
│   │   ├── db.ts                   # PostgreSQL connection pool
│   │   ├── schema.sql              # Database schema
│   │   ├── testConnection.ts       # DB connection test
│   │   └── userQueries.ts          # User CRUD operations
│   ├── middleware/
│   │   └── auth.middleware.ts      # JWT verification middleware
│   ├── routes/
│   │   ├── auth.routes.ts          # Auth route definitions
│   │   └── index.ts                # Route aggregation
│   ├── types/
│   │   ├── auth.types.ts           # User & auth types
│   │   └── express.d.ts            # Express type extensions
│   ├── utils/
│   │   ├── env.ts                  # Environment variable helper
│   │   ├── jwt.ts                  # JWT generation & verification
│   │   ├── password.ts             # Password hashing & comparison
│   │   └── validation.ts           # Input validation utilities
│   └── server.ts                   # Express app entry point
├── .env                            # Environment variables
├── package.json
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📦 Installation

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatbot
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=24h

# Password Hashing
BCRYPT_ROUNDS=10
```

### 3. Database Setup

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE chatbot;
```

#### Run Schema

```bash
# From backend directory
psql -U postgres -d chatbot -f src/database/schema.sql
```

Or using the migration script:

```bash
npx tsx -r dotenv/config src/database/migrate.ts
```

#### Verify Connection

```bash
npx tsx -r dotenv/config src/database/testConnection.ts
```

Expected output:
```
✅ Database connected: { now: 2025-11-18T... }
```

## 🚦 Running the Server

### Development Mode

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

## 🔐 Authentication Flow

### Registration

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "username123",
  "password": "SecurePass123!@#"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username123",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400` - Validation failed
- `409` - Email or username already exists
- `500` - Server error

### Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username123",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400` - Validation failed
- `401` - Invalid credentials
- `500` - Server error

### Protected Routes

Add the authentication middleware to protect routes:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});
```

**Request Header**:
```
Authorization: Bearer <your_jwt_token>
```

## 🧪 Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:4000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the collection from the tests provided
2. Set environment variable `base_url` to `http://localhost:4000`
3. Register a user → Token auto-saved to `auth_token`
4. Use `{{auth_token}}` in Authorization headers

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with configurable salt rounds
- ✅ **JWT Tokens**: Signed with secret key, configurable expiration
- ✅ **SQL Injection Prevention**: Parameterized queries (`$1`, `$2`)
- ✅ **Input Validation**: Email format, password strength, username rules
- ✅ **Input Sanitization**: Trim whitespace, remove dangerous characters
- ✅ **Secure Error Messages**: Don't reveal if email exists during login
- ✅ **Token Verification**: Validates signature and expiration

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## 🔧 Utilities

### JWT Utils (`utils/jwt.ts`)
- `generateToken(userId, email)` - Create JWT token
- `verifyToken(token)` - Verify and decode token

### Password Utils (`utils/password.ts`)
- `hashPassword(password)` - Hash password with bcrypt
- `comparePassword(plain, hash)` - Verify password

### Validation Utils (`utils/validation.ts`)
- `isValidEmail(email)` - Email format validation
- `validatePassword(password)` - Password strength validation
- `validateUsername(username)` - Username format validation
- `validateRegistration(email, username, password)` - Combined validation
- `validateLogin(email, password)` - Login validation
- `sanitizeInput(input)` - Sanitize user input

### Database Queries (`database/userQueries.ts`)
- `createUser(email, username, passwordHash, avatarPath?)` - Insert new user
- `findUserByEmail(email)` - Get user by email (with password_hash)
- `findUserByUsername(username)` - Get user by username
- `findUserById(id)` - Get user by ID (without password_hash)
- `updateUserAvatar(userId, avatarPath)` - Update avatar
- `emailExists(email)` - Check if email is taken
- `usernameExists(username)` - Check if username is taken

## 📚 Learning Path

This implementation follows these steps:

1. **JWT Token Management** - Token generation and verification
2. **Password Security** - Hashing with bcrypt
3. **Input Validation** - Format validation and sanitization
4. **Database Setup** - PostgreSQL connection and schema
5. **Database Queries** - User CRUD operations
6. **Authentication Middleware** - Protect routes with JWT
7. **Auth Controllers** - Register and login handlers

## 🚨 Common Issues

### Environment Variables Not Loading
```bash
# Use dotenv flag with tsx
npx tsx -r dotenv/config src/server.ts
```

### Database Connection Failed
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env` file
- Ensure database exists: `psql -U postgres -l`

### Token Verification Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token format: `Bearer <token>`
- Verify token hasn't expired

## 📄 License

ISC

## 👥 Contributors

Built with ❤️ using modern best practices for authentication and security.