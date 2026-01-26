# Residential Management System

A comprehensive mobile and web application for managing guarded residential communities with visitor registration, delivery tracking, and community announcements.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Management](#user-management)
- [API Documentation](#api-documentation)
- [Mobile App Usage](#mobile-app-usage)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### For Residents
- **Visitor Registration**: Register visitors and generate QR codes for entry
- **My Visitors**: View history of registered visitors and their status
- **Delivery Registration**: Register deliveries with 6-digit passcode system
- **Community News**: Read announcements and updates from management
- **Delivery Tracking**: Track delivery status with passcode validation

### For Security Guards
- **QR Code Scanner**: Scan visitor QR codes for instant verification
- **Manual QR Entry**: Backup option to enter QR codes manually
- **Passcode Validation**: Validate delivery passcodes
- **Visitor Check-in/Check-out**: Track visitor entry and exit times
- **Expected Visitors/Deliveries**: View today's expected arrivals

### For Administrators
- **User Management**: Create and manage resident and guard accounts
- **News Publishing**: Create and publish community announcements
- **Analytics Dashboard**: View visitor and delivery statistics (future)
- **Property Management**: Manage properties and resident assignments

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT with refresh tokens
- **QR Generation**: Custom implementation with JWT signing

### Mobile App
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **QR Scanner**: expo-camera
- **QR Display**: react-native-qrcode-svg
- **HTTP Client**: Axios

### Database Schema
- Communities, Users, Properties
- Visitors (with QR codes)
- Deliveries (with passcodes)
- News & Notifications
- Activity Logs

---

## 📁 Project Structure

```
SriAmpangMasApp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # PostgreSQL configuration
│   │   │   └── redis.ts             # Redis configuration
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Authentication logic
│   │   │   ├── visitor.controller.ts
│   │   │   ├── delivery.controller.ts
│   │   │   └── news.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   └── validator.ts         # Input validation
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── visitor.routes.ts
│   │   │   ├── delivery.routes.ts
│   │   │   └── news.routes.ts
│   │   ├── services/
│   │   ├── utils/
│   │   │   └── qr.ts               # QR code generation
│   │   ├── database/
│   │   │   ├── init.sql            # Database schema
│   │   │   └── complete-setup.sql  # Schema + seed data
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    └── mobile/
        ├── src/
        │   ├── screens/
        │   │   ├── auth/
        │   │   │   └── LoginScreen.tsx
        │   │   ├── resident/
        │   │   │   ├── ResidentHomeScreen.tsx
        │   │   │   ├── RegisterVisitorScreen.tsx
        │   │   │   └── VisitorDetailsScreen.tsx
        │   │   └── guard/
        │   │       ├── GuardHomeScreen.tsx
        │   │       ├── ScanQRScreen.tsx
        │   │       └── ManualQRScreen.tsx
        │   ├── navigation/
        │   │   └── AppNavigator.tsx
        │   ├── contexts/
        │   │   └── AuthContext.tsx
        │   ├── services/
        │   │   ├── api.ts
        │   │   ├── authService.ts
        │   │   ├── visitorService.ts
        │   │   └── deliveryService.ts
        │   └── components/
        ├── App.tsx
        └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- Expo CLI (for mobile development)

### Backend Setup

1. **Install PostgreSQL and Redis**

   ```bash
   # Mac
   brew install postgresql@15 redis
   brew services start postgresql@15
   brew services start redis

   # Verify installations
   psql --version
   redis-cli ping  # Should return PONG
   ```

2. **Clone and Setup Backend**

   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**

   Create `.env` file:

   ```env
   NODE_ENV=development
   PORT=3000

   # Database
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=residential_db
   DATABASE_USER=your_username
   DATABASE_PASSWORD=

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # JWT Secrets (generate random strings)
   JWT_SECRET=your_jwt_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_secret_here
   QR_SECRET=your_qr_secret_here

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
   ```

4. **Setup Database**

   ```bash
   # Create database
   createdb residential_db

   # Run schema and seed data
   psql -d residential_db -f src/database/complete-setup.sql
   ```

5. **Start Backend Server**

   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 Server running on port 3000
   ✅ Database connected successfully
   ✅ Redis connected successfully
   ```

### Mobile App Setup

1. **Install Dependencies**

   ```bash
   cd frontend/mobile
   npm install
   ```

2. **Update API URL**

   In `src/services/api.ts`, update with your computer's IP:

   ```typescript
   // Find your IP: ipconfig getifaddr en0 (Mac)
   const API_URL = 'http://192.168.X.X:3000/api/v1';
   ```

3. **Start Mobile App**

   ```bash
   npx expo start
   ```

   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

---

## 👥 User Management

### Default Users

After running `complete-setup.sql`, you'll have:

**Admin:**
- Email: `admin@tamanpetaling.com`
- Password: `password123`

**Guards:**
- `guard1@tamanpetaling.com` / `password123`
- `guard2@tamanpetaling.com` / `password123`

**Residents:**
- `resident.1.jp1@tamanpetaling.com` / `password123`
- `resident.2.jp1@tamanpetaling.com` / `password123`
- `resident.3.jp1@tamanpetaling.com` / `password123`
- ... (10 residents total)

### Adding New Residents

**Via SQL:**

```sql
-- 1. Insert user
INSERT INTO users (community_id, email, password_hash, full_name, role, phone, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- Your community ID
  'newresident@tamanpetaling.com',
  '$2b$12$TKeWeOVFumU9QJiBiRcLwuPBwMDpC7hcTKMtdQLc6B2uF517GLYLq', -- password123
  'New Resident Name',
  'resident',
  '+60123456789',
  true
)
RETURNING id;

-- 2. Link to property
INSERT INTO resident_properties (resident_id, property_id, is_primary, relationship)
VALUES (
  'USER_ID_FROM_ABOVE',
  'PROPERTY_ID', -- Get from: SELECT id FROM properties WHERE unit_number = 'X'
  true,
  'owner'
);
```

**Email Format Convention:**
- Format: `resident.{unit}.{street}@{community}.com`
- Example: `resident.5.jp1@tamanpetaling.com` (Unit 5, Jalan Petaling 1)

### Adding New Guards

```sql
INSERT INTO users (community_id, email, password_hash, full_name, role, phone, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'guard3@tamanpetaling.com',
  '$2b$12$TKeWeOVFumU9QJiBiRcLwuPBwMDpC7hcTKMtdQLc6B2uF517GLYLq',
  'Guard Name',
  'guard',
  '+60123456789',
  true
);
```

### Adding New Properties

```sql
INSERT INTO properties (community_id, unit_number, street, property_type, is_occupied)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '10',                    -- Unit number
  'Jalan Petaling 1',      -- Street name
  'landed',                -- Type
  true                     -- Occupied
);
```

### Removing Users

```sql
-- Soft delete (recommended)
UPDATE users SET is_active = false WHERE email = 'user@example.com';

-- Hard delete (cascades to related records)
DELETE FROM users WHERE email = 'user@example.com';
```

### Resetting Passwords

```bash
# Generate new hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('newpassword', 12, (e,h) => console.log(h));"

# Update in database
psql -d residential_db -c "UPDATE users SET password_hash = 'NEW_HASH' WHERE email = 'user@example.com';"
```

### Viewing All Users

```sql
-- List all users
SELECT email, role, full_name, is_active FROM users ORDER BY role, email;

-- List residents with properties
SELECT 
  u.email,
  u.full_name,
  p.unit_number,
  p.street
FROM users u
JOIN resident_properties rp ON u.id = rp.resident_id
JOIN properties p ON rp.property_id = p.id
WHERE u.role = 'resident'
ORDER BY p.street, p.unit_number;
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require JWT token:
```
Authorization: Bearer <access_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

#### Visitors (Resident)
- `POST /visitors` - Register visitor
- `GET /visitors` - Get my visitors
- `GET /visitors/:id` - Get visitor details
- `DELETE /visitors/:id` - Cancel visitor

#### Visitors (Guard)
- `GET /visitors` - Get all expected visitors
- `GET /visitors/qr/:qrCode` - Validate QR code
- `POST /visitors/:id/check-in` - Check in visitor
- `POST /visitors/:id/check-out` - Check out visitor

#### Deliveries (Resident)
- `POST /deliveries` - Register delivery
- `GET /deliveries/my` - Get my deliveries

#### Deliveries (Guard)
- `GET /deliveries` - Get all deliveries
- `GET /deliveries/passcode/:passcode` - Validate passcode
- `POST /deliveries/passcode/:passcode/collected` - Mark collected

#### News
- `GET /news` - Get all news (All users)
- `POST /news` - Create news (Admin only)
- `PUT /news/:id` - Update news (Admin only)
- `DELETE /news/:id` - Delete news (Admin only)

---

## 📱 Mobile App Usage

### Resident Workflow

1. **Login** with provided credentials
2. **Register Visitor**:
   - Tap "Register Visitor"
   - Fill in visitor details
   - Generate QR code
   - Share QR code with visitor via WhatsApp/SMS
3. **Register Delivery**:
   - Tap "Register Delivery"
   - Enter delivery service and vehicle plate
   - Get 6-digit passcode
   - Share passcode with delivery driver
4. **View News**: Check community announcements

### Guard Workflow

1. **Login** with guard credentials
2. **Scan QR Code**:
   - Tap "Scan QR Code"
   - Point camera at visitor's QR code
   - View visitor details
   - Tap "Check In" to allow entry
3. **Validate Passcode**:
   - Tap "Validate Passcode"
   - Enter 6-digit delivery code
   - Verify delivery details
   - Mark as collected when resident picks up
4. **Manual Entry**: Use "Enter QR Code" for backup

---

## 🔧 Troubleshooting

### Backend Issues

**Database connection failed**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start if stopped
brew services start postgresql@15

# Test connection
psql -d residential_db -c "SELECT NOW();"
```

**Redis connection failed**
```bash
# Check if Redis is running
redis-cli ping

# Start if stopped
brew services start redis
```

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

### Mobile App Issues

**Cannot connect to backend**
- Make sure backend is running
- Check API URL has your correct IP (not localhost)
- Ensure phone and computer on same WiFi network
- Check firewall settings

**Camera not working**
- Grant camera permissions in phone settings
- Use "Enter QR Code" as backup option

**Login fails**
- Verify backend is running
- Check network connectivity
- Verify user exists: `psql -d residential_db -c "SELECT email FROM users;"`
- Check password hash is correct

### Database Issues

**Need to reset everything**
```bash
# Drop and recreate database
dropdb residential_db
createdb residential_db
psql -d residential_db -f src/database/complete-setup.sql
```

**Check what's in database**
```bash
# Connect to database
psql -d residential_db

# List tables
\dt

# View users
SELECT * FROM users;

# View visitors
SELECT * FROM visitors ORDER BY created_at DESC LIMIT 5;

# Exit
\q
```

---

## 📝 Development Notes

### Default Password
All seeded users have password: `password123`

Hash: `$2b$12$TKeWeOVFumU9QJiBiRcLwuPBwMDpC7hcTKMtdQLc6B2uF517GLYLq`

### Default Community ID
`550e8400-e29b-41d4-a716-446655440000`

### Property IDs
Properties are assigned sequential UUIDs starting from:
`650e8400-e29b-41d4-a716-446655440001`

### Generate New JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚧 Future Enhancements

- [ ] Push notifications for visitors/deliveries
- [ ] Analytics dashboard for admin
- [ ] Recurring visitor templates
- [ ] Facility booking system
- [ ] Maintenance request system
- [ ] Payment integration
- [ ] Facial recognition
- [ ] Web admin dashboard

---

## 📄 License

Private - All rights reserved

---

## 👨‍💻 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for Sri Ampang Mas**
