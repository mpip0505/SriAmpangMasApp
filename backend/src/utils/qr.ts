import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { setCache, getCache } from '../config/redis';

interface QRPayload {
  visitorId: string;
  communityId: string;
  expiresAt: number;
}

// Generate unique QR code for visitor
export const generateVisitorQRCode = async (
  visitorId: string,
  communityId: string,
  expiresAt: Date
): Promise<string> => {
  // Create JWT payload
  const payload: QRPayload = {
    visitorId,
    communityId,
    expiresAt: Math.floor(expiresAt.getTime() / 1000),
  };

  // Sign with JWT
  const qrSecret = process.env.QR_SECRET || 'default-qr-secret';
  const token = jwt.sign(payload, qrSecret, {
    expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  });

  // Generate unique QR code identifier
  const qrCode = `VIS-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

  // Store in Redis for fast lookup (with TTL)
  const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  await setCache(`qr:${qrCode}`, { token, visitorId, communityId }, ttl);

  return qrCode;
};

// Validate QR code
export const validateQRCode = async (qrCode: string): Promise<{
  valid: boolean;
  visitorId?: string;
  communityId?: string;
  error?: string;
}> => {
  try {
    // Check Redis cache first
    const cached = await getCache(`qr:${qrCode}`);

    if (!cached) {
      return { valid: false, error: 'QR code not found or expired' };
    }

    // Verify JWT signature
    const qrSecret = process.env.QR_SECRET || 'default-qr-secret';
    const decoded = jwt.verify(cached.token, qrSecret) as QRPayload;

    // Check if expired
    if (decoded.expiresAt < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'QR code expired' };
    }

    return {
      valid: true,
      visitorId: decoded.visitorId,
      communityId: decoded.communityId,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid or tampered QR code' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'QR code expired' };
    }
    return { valid: false, error: 'QR code validation failed' };
  }
};

// Invalidate QR code (after check-in or cancellation)
export const invalidateQRCode = async (qrCode: string): Promise<void> => {
  const { deleteCache } = require('../config/redis');
  await deleteCache(`qr:${qrCode}`);
};