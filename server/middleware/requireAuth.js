import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { pool } from '../db.js';

export const PANEL_ROLES = ['dentist', 'staff', 'admin'];

export const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role
});

export async function requireAuth(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Please log in.' });

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Your session has ended. Please log in again.' });
  }

  const [rows] = await pool.execute('SELECT * FROM user_profiles WHERE id = ?', [payload.sub]);
  const user = rows[0];
  if (!user || user.status !== 'active' || !PANEL_ROLES.includes(user.role)) {
    return res.status(401).json({ error: 'Your session has ended. Please log in again.' });
  }
  req.user = toPublicUser(user);
  next();
}
