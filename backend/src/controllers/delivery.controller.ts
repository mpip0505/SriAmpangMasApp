import { Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Generate random 6-digit passcode
const generatePasscode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER DELIVERY
export const registerDelivery = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const {
      delivery_service,
      vehicle_plate,
      estimated_arrival,
      notes,
    } = req.body;

    const userId = req.user!.id;
    const communityId = req.user!.communityId;

    // Get resident's primary property
    const propertyResult = await query(
      `SELECT property_id FROM resident_properties 
       WHERE resident_id = $1 AND is_primary = true
       LIMIT 1`,
      [userId]
    );

    if (propertyResult.rowCount === 0) {
      throw new AppError('No property assigned to your account', 404);
    }

    const propertyId = propertyResult.rows[0].property_id;

    // Generate passcode
    const passcode = generatePasscode();

    // Calculate expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert delivery
    const result = await query(
      `INSERT INTO deliveries (
        community_id, registered_by, property_id,
        delivery_service, vehicle_plate, estimated_arrival,
        passcode, passcode_expires_at, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, delivery_service, vehicle_plate, estimated_arrival, passcode, passcode_expires_at`,
      [
        communityId,
        userId,
        propertyId,
        delivery_service,
        vehicle_plate,
        estimated_arrival,
        passcode,
        expiresAt,
        'pending',
        notes,
      ]
    );

    const delivery = result.rows[0];

    // Get full delivery details
    const fullDelivery = await query(
      `SELECT d.*, p.unit_number, p.street, u.full_name as registered_by_name, u.phone as registered_by_phone
       FROM deliveries d
       JOIN properties p ON d.property_id = p.id
       JOIN users u ON d.registered_by = u.id
       WHERE d.id = $1`,
      [delivery.id]
    );

    res.status(201).json({
      success: true,
      message: 'Delivery registered successfully',
      data: {
        delivery: fullDelivery.rows[0],
        passcode: delivery.passcode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET MY DELIVERIES (RESIDENT)
export const getMyDeliveries = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;

    let whereConditions = ['d.registered_by = $1'];
    const params: any[] = [userId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`d.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
      `SELECT d.*, p.unit_number, p.street
       FROM deliveries d
       JOIN properties p ON d.property_id = p.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY d.estimated_arrival DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, Number(limit), offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM deliveries d WHERE ${whereConditions.join(' AND ')}`,
      params
    );

    res.json({
      success: true,
      data: {
        deliveries: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count, 10),
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(parseInt(countResult.rows[0].count, 10) / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL DELIVERIES (GUARD)
export const getAllDeliveries = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { status, date } = req.query;
    const communityId = req.user!.communityId;

    let whereConditions = ['d.community_id = $1'];
    const params: any[] = [communityId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`d.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (date) {
      whereConditions.push(`DATE(d.estimated_arrival) = $${paramCount}`);
      params.push(date);
      paramCount++;
    }

    const result = await query(
      `SELECT d.*, 
              p.unit_number, p.street,
              u.full_name as registered_by_name, u.phone as registered_by_phone
       FROM deliveries d
       JOIN properties p ON d.property_id = p.id
       JOIN users u ON d.registered_by = u.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY d.estimated_arrival ASC`,
      params
    );

    res.json({
      success: true,
      data: {
        deliveries: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// VALIDATE PASSCODE (GUARD)
export const validatePasscode = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { passcode } = req.params;
    const communityId = req.user!.communityId;

    const result = await query(
      `SELECT d.*, 
              p.unit_number, p.street,
              u.full_name as registered_by_name, u.phone as registered_by_phone
       FROM deliveries d
       JOIN properties p ON d.property_id = p.id
       JOIN users u ON d.registered_by = u.id
       WHERE d.passcode = $1 AND d.community_id = $2`,
      [passcode, communityId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Invalid passcode', 404);
    }

    const delivery = result.rows[0];

    // Check if expired
    if (new Date(delivery.passcode_expires_at) < new Date()) {
      throw new AppError('Passcode has expired', 400);
    }

    // Check status
    if (delivery.status === 'collected') {
      throw new AppError('Delivery already collected', 400);
    }

    if (delivery.status === 'cancelled') {
      throw new AppError('Delivery has been cancelled', 400);
    }

    res.json({
      success: true,
      message: 'Passcode is valid',
      data: { delivery },
    });
  } catch (error) {
    next(error);
  }
};

// MARK ARRIVED (GUARD)
export const markArrived = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const guardId = req.user!.id;
    const communityId = req.user!.communityId;

    const deliveryResult = await query(
      'SELECT * FROM deliveries WHERE id = $1 AND community_id = $2',
      [id, communityId]
    );

    if (deliveryResult.rowCount === 0) {
      throw new AppError('Delivery not found', 404);
    }

    const delivery = deliveryResult.rows[0];

    if (delivery.status === 'collected') {
      throw new AppError('Delivery already collected', 400);
    }

    const result = await query(
      `UPDATE deliveries 
       SET status = 'arrived', 
           actual_arrival = CURRENT_TIMESTAMP,
           checked_in_by = $1
       WHERE id = $2
       RETURNING *`,
      [guardId, id]
    );

    res.json({
      success: true,
      message: 'Delivery marked as arrived',
      data: { delivery: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// MARK COLLECTED (GUARD) - Passcode expires
export const markCollected = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const guardId = req.user!.id;
    const communityId = req.user!.communityId;

    const deliveryResult = await query(
      'SELECT * FROM deliveries WHERE id = $1 AND community_id = $2',
      [id, communityId]
    );

    if (deliveryResult.rowCount === 0) {
      throw new AppError('Delivery not found', 404);
    }

    const delivery = deliveryResult.rows[0];

    if (delivery.status === 'collected') {
      throw new AppError('Delivery already collected', 400);
    }

    // Mark as collected and expire passcode
    const result = await query(
      `UPDATE deliveries 
       SET status = 'collected',
           passcode_expires_at = CURRENT_TIMESTAMP,
           checked_in_by = $1
       WHERE id = $2
       RETURNING *`,
      [guardId, id]
    );

    res.json({
      success: true,
      message: 'Delivery marked as collected. Passcode has expired.',
      data: { delivery: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// CANCEL DELIVERY (RESIDENT)
export const cancelDelivery = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const deliveryResult = await query(
      'SELECT * FROM deliveries WHERE id = $1 AND registered_by = $2',
      [id, userId]
    );

    if (deliveryResult.rowCount === 0) {
      throw new AppError('Delivery not found', 404);
    }

    const delivery = deliveryResult.rows[0];

    if (delivery.status === 'collected') {
      throw new AppError('Cannot cancel collected delivery', 400);
    }

    await query(
      `UPDATE deliveries SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Delivery cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};