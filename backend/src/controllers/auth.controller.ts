import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Generate JWT tokens
const generateTokens = (userId: string, email: string, role: string, communityId: string) => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production';
  
  const accessToken = jwt.sign(
    { id: userId, email, role, communityId },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    refreshSecret,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// REGISTER
export const register = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { email, password, full_name, role, community_id, phone } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    // Verify community exists
    const community = await query(
      'SELECT id FROM communities WHERE id = $1 AND is_active = true',
      [community_id]
    );

    if (community.rows.length === 0) {
      throw new AppError('Invalid community', 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, community_id, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, community_id, created_at`,
      [email, password_hash, full_name, role, community_id, phone]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          community_id: user.community_id,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      `SELECT u.*, c.name as community_name
       FROM users u
       JOIN communities c ON u.community_id = c.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role,
      user.community_id
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          community_id: user.community_id,
          community_name: user.community_name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { refresh_token } = req.body;

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production';

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, refreshSecret) as any;

    // Check if token exists in database
    const tokenResult = await query(
      `SELECT rt.*, u.email, u.role, u.community_id
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > CURRENT_TIMESTAMP AND u.is_active = true`,
      [refresh_token]
    );

    if (tokenResult.rows.length === 0) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenData = tokenResult.rows[0];

    // Generate new access token
    const { accessToken } = generateTokens(
      tokenData.user_id,
      tokenData.email,
      tokenData.role,
      tokenData.community_id
    );

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token) {
      await query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refresh_token]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
export const getCurrentUser = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.phone, u.profile_image_url,
              u.community_id, c.name as community_name, u.created_at
       FROM users u
       JOIN communities c ON u.community_id = c.id
       WHERE u.id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CURRENT USER
export const updateCurrentUser = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { full_name, phone } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (full_name) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }

    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      throw new AppError('No updates provided', 400);
    }

    values.push(req.user!.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, phone, role`,
      values
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// CHANGE PASSWORD
export const changePassword = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { current_password, new_password } = req.body;

    // Get user with password
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.id]
    );

    const user = result.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 12);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [new_password_hash, req.user!.id]
    );

    // Invalidate all refresh tokens
    await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [req.user!.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    next(error);
  }
};