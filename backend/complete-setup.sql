-- ============================================
-- COMPLETE DATABASE SETUP
-- Schema + Seed Data
-- ============================================

-- Drop existing tables
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS resident_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE TABLES (SCHEMA)
-- ============================================

CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Kuala_Lumpur',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'resident', 'guard')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_community ON users(community_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    street VARCHAR(255),
    property_type VARCHAR(50),
    is_occupied BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, unit_number)
);

CREATE INDEX idx_properties_community ON properties(community_id);

CREATE TABLE resident_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    relationship VARCHAR(50),
    move_in_date DATE,
    move_out_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resident_id, property_id)
);

CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    visitor_ic_passport VARCHAR(50),
    visitor_photo_url TEXT,
    vehicle_plate VARCHAR(20),
    
    purpose TEXT,
    expected_arrival TIMESTAMP NOT NULL,
    expected_departure TIMESTAMP,
    actual_arrival TIMESTAMP,
    actual_departure TIMESTAMP,
    
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    qr_expires_at TIMESTAMP NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'checked_in', 'checked_out', 'cancelled', 'expired')),
    
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    checked_out_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visitors_qr ON visitors(qr_code);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_arrival ON visitors(expected_arrival);
CREATE INDEX idx_visitors_community ON visitors(community_id);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    delivery_service VARCHAR(100) NOT NULL,
    delivery_type VARCHAR(50) DEFAULT 'food',
    estimated_arrival TIMESTAMP NOT NULL,
    actual_arrival TIMESTAMP,
    
    delivery_person_name VARCHAR(255),
    delivery_person_phone VARCHAR(20),
    vehicle_plate VARCHAR(20),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'collected', 'cancelled')),
    
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_arrival ON deliveries(estimated_arrival);
CREATE INDEX idx_deliveries_community ON deliveries(community_id);

CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    image_urls TEXT[],
    attachment_urls TEXT[],
    
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    target_properties UUID[],
    
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_news_community ON news(community_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    
    related_type VARCHAR(50),
    related_id UUID,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    is_push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- 1. Community
INSERT INTO communities (id, name, address, contact_email, contact_phone, timezone)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Taman Petaling Heights',
  'Jalan Petaling, 46000 Petaling Jaya, Selangor',
  'admin@tamanpetaling.com',
  '+60321234567',
  'Asia/Kuala_Lumpur'
);

-- 2. Properties
INSERT INTO properties (id, community_id, unit_number, street, property_type, is_occupied)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '1', 'Jalan Petaling 1', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '2', 'Jalan Petaling 1', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '3', 'Jalan Petaling 1', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '5', 'Jalan Petaling 1', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '1', 'Jalan Petaling 2', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '2', 'Jalan Petaling 2', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '4', 'Jalan Petaling 2', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '1', 'Jalan Petaling 3', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '3', 'Jalan Petaling 3', 'landed', true),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '5', 'Jalan Petaling 3', 'landed', true);

-- 3. Admin
INSERT INTO users (id, community_id, email, password_hash, full_name, role, phone, is_active, is_email_verified)
VALUES (
  '750e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@tamanpetaling.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa',
  'System Administrator',
  'admin',
  '+60321234567',
  true,
  true
);

-- 4. Guards
INSERT INTO users (id, community_id, email, password_hash, full_name, role, phone, is_active, is_email_verified)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440002',
   '550e8400-e29b-41d4-a716-446655440000',
   'guard1@tamanpetaling.com',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa',
   'Ahmad Razak (Day Shift)',
   'guard',
   '+60123456701',
   true,
   true),
   
  ('750e8400-e29b-41d4-a716-446655440003',
   '550e8400-e29b-41d4-a716-446655440000',
   'guard2@tamanpetaling.com',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa',
   'Kumar Singh (Night Shift)',
   'guard',
   '+60123456702',
   true,
   true);

-- 5. Residents
INSERT INTO users (id, community_id, email, password_hash, full_name, role, phone, is_active, is_email_verified)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'resident.1.jp1@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Ahmad Abdullah', 'resident', '+60123456789', true, true),
  ('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'resident.2.jp1@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Siti Nurhaliza', 'resident', '+60123456788', true, true),
  ('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'resident.3.jp1@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Kumar Ramesh', 'resident', '+60123456787', true, true),
  ('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'resident.5.jp1@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Lee Wei Ming', 'resident', '+60123456786', true, true),
  ('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'resident.1.jp2@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Tan Mei Ling', 'resident', '+60123456785', true, true),
  ('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', 'resident.2.jp2@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Wong Kar Wai', 'resident', '+60123456784', true, true),
  ('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', 'resident.4.jp2@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Raj Patel', 'resident', '+60123456783', true, true),
  ('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', 'resident.1.jp3@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Chen Li Hua', 'resident', '+60123456782', true, true),
  ('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440000', 'resident.3.jp3@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Murugan Subramaniam', 'resident', '+60123456781', true, true),
  ('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440000', 'resident.5.jp3@tamanpetaling.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa', 'Noor Azlina', 'resident', '+60123456780', true, true);

-- 6. Link residents to properties
INSERT INTO resident_properties (resident_id, property_id, is_primary, relationship)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440002', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440004', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440005', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440006', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440007', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440008', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440009', true, 'owner'),
  ('750e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440010', true, 'owner');

-- Summary
SELECT '=== DATABASE SETUP COMPLETE ===' as status;
SELECT 'Total users:' as info, COUNT(*) as count FROM users;
SELECT 'Total properties:' as info, COUNT(*) as count FROM properties;
SELECT '' as blank;
SELECT '📧 All passwords: password123' as note;
SELECT '' as blank;
SELECT email, role FROM users ORDER BY role, email;