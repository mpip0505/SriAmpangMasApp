import { Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateVisitorQRCode, validateQRCode } from '../utils/qr';

// REGISTER VISITOR
export const registerVisitor = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const {
      visitor_name,
      visitor_phone,
      visitor_ic_passport,
      vehicle_plate,
      purpose,
      expected_arrival,
      expected_departure,
      property_id,
    } = req.body;

    const userId = req.user!.id;
    const communityId = req.user!.communityId;

    // Verify property belongs to user's community
    const propertyCheck = await query(
      'SELECT id FROM properties WHERE id = $1 AND community_id = $2',
      [property_id, communityId]
    );

    if (propertyCheck.rows.length === 0) {
      throw new AppError('Property not found', 404);
    }

    // Calculate QR expiry (24 hours after expected arrival or expected departure)
    const qrExpiresAt = expected_departure 
      ? new Date(expected_departure)
      : new Date(new Date(expected_arrival).getTime() + 24 * 60 * 60 * 1000);

    // Generate QR code placeholder (we'll update after insert)
    const tempQrCode = 'TEMP';

    // Insert visitor
    const result = await query(
      `INSERT INTO visitors (
        community_id, registered_by, property_id,
        visitor_name, visitor_phone, visitor_ic_passport, vehicle_plate,
        purpose, expected_arrival, expected_departure,
        qr_code, qr_expires_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, visitor_name, expected_arrival, qr_expires_at`,
      [
        communityId, userId, property_id,
        visitor_name, visitor_phone, visitor_ic_passport, vehicle_plate,
        purpose, expected_arrival, expected_departure,
        tempQrCode, qrExpiresAt, 'pending'
      ]
    );

    const visitor = result.rows[0];

    // Generate actual QR code
    const qrCode = await generateVisitorQRCode(
      visitor.id,
      communityId,
      qrExpiresAt
    );

    // Update visitor with actual QR code
    await query(
      'UPDATE visitors SET qr_code = $1 WHERE id = $2',
      [qrCode, visitor.id]
    );

    // Get full visitor details with property info
    const fullVisitor = await query(
        `SELECT v.*, p.unit_number, p.street, u.full_name as registered_by_name
        FROM visitors v
        JOIN properties p ON v.property_id = p.id
        JOIN users u ON v.registered_by = u.id
        WHERE v.id = $1`,
        [visitor.id]
    );

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully',
      data: {
        visitor: fullVisitor.rows[0],
        qr_code: qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL VISITORS (with filters)
export const getVisitors = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { status, date, property_id, page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const communityId = req.user!.communityId;

    let whereConditions = ['v.community_id = $1'];
    const params: any[] = [communityId];
    let paramCount = 2;

    // Residents can only see their own visitors
    if (userRole === 'resident') {
      whereConditions.push(`v.registered_by = $${paramCount}`);
      params.push(userId);
      paramCount++;
    }

    // Filter by status
    if (status) {
      whereConditions.push(`v.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    // Filter by date
    if (date) {
      whereConditions.push(`DATE(v.expected_arrival) = $${paramCount}`);
      params.push(date);
      paramCount++;
    }

    // Filter by property
    if (property_id) {
      whereConditions.push(`v.property_id = $${paramCount}`);
      params.push(property_id);
      paramCount++;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const result = await query(
        `SELECT v.*, 
                p.unit_number, p.street,
                u.full_name as registered_by_name,
                ci.full_name as checked_in_by_name,
                co.full_name as checked_out_by_name
         FROM visitors v
         JOIN properties p ON v.property_id = p.id
         JOIN users u ON v.registered_by = u.id
         LEFT JOIN users ci ON v.checked_in_by = ci.id
         LEFT JOIN users co ON v.checked_out_by = co.id
         WHERE ${whereConditions.join(' AND ')}
         ORDER BY v.expected_arrival DESC
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM visitors v WHERE ${whereConditions.join(' AND ')}`,
      params
    );

    res.json({
      success: true,
      data: {
        visitors: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(countResult.rows[0].count / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET VISITOR BY ID
export const getVisitorById = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const communityId = req.user!.communityId;

    const result = await query(
        `SELECT v.*, 
                p.unit_number, p.street,
                u.full_name as registered_by_name, u.phone as registered_by_phone,
                ci.full_name as checked_in_by_name,
                co.full_name as checked_out_by_name
         FROM visitors v
         JOIN properties p ON v.property_id = p.id
         JOIN users u ON v.registered_by = u.id
         LEFT JOIN users ci ON v.checked_in_by = ci.id
         LEFT JOIN users co ON v.checked_out_by = co.id
         WHERE v.id = $1 AND v.community_id = $2`,
        [id, communityId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Visitor not found', 404);
    }

    const visitor = result.rows[0];

    // Residents can only view their own visitors
    if (userRole === 'resident' && visitor.registered_by !== userId) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

// VALIDATE QR CODE (for guard scanning)
export const validateVisitorQR = async (req: AuthRequest, res: Response, next: any) => {
    try {
        const qrCode = req.params.qrCode as string; // Type assertion
        const communityId = req.user!.communityId;

        const validation = await validateQRCode(qrCode);

        if (!validation.valid) {
            throw new AppError(validation.error || 'Invalid QR Code', 400);
        }

        // Get visitor details from database using QR code
        const result = await query(
            `SELECT v.*, p.unit_number, p.street, 
                    u.full_name as registered_by_name, u.phone as registered_by_phone
             FROM visitors v
             JOIN properties p ON v.property_id = p.id
             JOIN users u ON v.registered_by = u.id
             WHERE v.qr_code = $1 AND v.community_id = $2`,
            [qrCode, communityId]
        );

        if (result.rowCount === 0) {
            throw new AppError('Visitor not found for this QR Code', 404);
        }

        const visitor = result.rows[0];

        // Check visitor status
        if (visitor.status === 'checked_out') {
            throw new AppError('Visitor has already checked out', 400);
        }

        if (visitor.status === 'cancelled') {
            throw new AppError('Visitor entry has been cancelled', 400);
        }

        if (visitor.status === 'checked_in') {
            throw new AppError('Visitor is already checked in', 400);
        }

        // Check if QR Code is expired
        if (new Date(visitor.qr_expires_at) < new Date()) {
            throw new AppError('QR Code has expired', 400);
        }

        res.json({
            success: true,
            message: 'QR Code is valid',
            data: { visitor },
        });
    } catch (error) {
        next(error);
    }
};

// CHECK-IN VISITOR
export const checkInVisitor = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const guardId = req.user!.id;
    const communityId = req.user!.communityId;

    // Get visitor
    const visitorResult = await query(
      'SELECT * FROM visitors WHERE id = $1 AND community_id = $2',
      [id, communityId]
    );

    if (visitorResult.rows.length === 0) {
      throw new AppError('Visitor not found', 404);
    }

    const visitor = visitorResult.rows[0];

    if (visitor.status === 'checked_in') {
      throw new AppError('Visitor already checked in', 400);
    }

    if (visitor.status === 'cancelled') {
      throw new AppError('Visit has been cancelled', 400);
    }

    // Update visitor
    const result = await query(
      `UPDATE visitors 
       SET status = 'checked_in', 
           actual_arrival = CURRENT_TIMESTAMP,
           checked_in_by = $1
       WHERE id = $2
       RETURNING *`,
      [guardId, id]
    );

    res.json({
      success: true,
      message: 'Visitor checked in successfully',
      data: { visitor: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// CHECK-OUT VISITOR
export const checkOutVisitor = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const guardId = req.user!.id;
    const communityId = req.user!.communityId;

    // Get visitor
    const visitorResult = await query(
      'SELECT * FROM visitors WHERE id = $1 AND community_id = $2',
      [id, communityId]
    );

    if (visitorResult.rows.length === 0) {
      throw new AppError('Visitor not found', 404);
    }

    const visitor = visitorResult.rows[0];

    if (visitor.status !== 'checked_in') {
      throw new AppError('Visitor must be checked in first', 400);
    }

    // Update visitor
    const result = await query(
      `UPDATE visitors 
       SET status = 'checked_out', 
           actual_departure = CURRENT_TIMESTAMP,
           checked_out_by = $1
       WHERE id = $2
       RETURNING *`,
      [guardId, id]
    );

    res.json({
      success: true,
      message: 'Visitor checked out successfully',
      data: { visitor: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// CANCEL VISITOR
export const cancelVisitor = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const communityId = req.user!.communityId;

    // Get visitor
    const visitorResult = await query(
      'SELECT * FROM visitors WHERE id = $1 AND community_id = $2',
      [id, communityId]
    );

    if (visitorResult.rows.length === 0) {
      throw new AppError('Visitor not found', 404);
    }

    const visitor = visitorResult.rows[0];

    // Only owner or admin can cancel
    if (userRole === 'resident' && visitor.registered_by !== userId) {
      throw new AppError('You can only cancel your own visitors', 403);
    }

    if (visitor.status === 'checked_in') {
      throw new AppError('Cannot cancel visitor who is already checked in', 400);
    }

    if (visitor.status === 'checked_out') {
      throw new AppError('Cannot cancel visitor who has checked out', 400);
    }

    // Update visitor
    await query(
      `UPDATE visitors SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Visitor cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};