# Residential Management System (RMS)
This is a robust backend API built with Node.js, TypeScript, and PostgreSQL designed to streamline visitor entry, delivery tracking, and community communication for residential areas like Sri Ampang Mas.

---

## 🚀 Current Core Features
### 🔐 Authentication & Authorization

Role-Based Access Control (RBAC): Distinct permissions for Residents, Guards, and Admins.

JWT Authentication: Secure access using Access and Refresh tokens.

Community Isolation: Users can only access data belonging to their specific community.

### 🎫 Visitor Management (QR System)

Pre-Registration: Residents can register visitors with vehicle and contact details.

Secure QR Generation: Generates unique, signed QR codes for every visitor.

Guard Validation: Guards scan/validate QR codes for instant check-in/check-out.

Status Tracking: Real-time updates (Pending → Checked In → Checked Out).

### 📦 Delivery Management

Registry: Track incoming food or parcel deliveries (Grab, Shopee, etc.).

Status Monitoring: Monitor delivery status from arrival to collection.

Guard Verification: Guards can log delivery personnel details for enhanced security.

### 📰 Community News & Announcements

Broadcast System: Admins can post community-wide news or urgent alerts.

Priority Levels: Categorize news by priority (Low, Normal, High, Urgent).

Targeting: Ability to publish announcements to specific groups or properties.

## 🛠 Tech Stack
Language: TypeScript

Runtime: Node.js (Express)

Database: PostgreSQL (with pg pool)

Security: Bcrypt (hashing), JWT (tokens)

Validation: Express-validator

Infrastructure: Docker (for PostgreSQL & Redis)
