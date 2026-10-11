import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { pool } from '../db.js';
import { PANEL_ROLES, toPublicUser } from '../middleware/requireAuth.js';

const TOKEN_LIFETIME = '12h';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const failedLogins = new Map();

function isLockedOut(email) {
  const entry = failedLogins.get(email);
  if (!entry?.lockedUntil) return false;
  if (entry.lockedUntil > Date.now()) return true;
  failedLogins.delete(email);
  return false;
}

function recordFailure(email) {
  const entry = failedLogins.get(email) ?? { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_FAILED_ATTEMPTS) entry.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
  failedLogins.set(email, entry);
}

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (isLockedOut(email)) {
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` });
  }

  const [rows] = await pool.execute('SELECT * FROM user_profiles WHERE email = ?', [email]);
  const user = rows[0];
  const passwordOk = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
  if (!passwordOk) {
    recordFailure(email);
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  if (user.status !== 'active' || !PANEL_ROLES.includes(user.role)) {
    return res.status(403).json({ error: 'This account does not have access to the Dentist Panel.' });
  }

  failedLogins.delete(email);
  const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: TOKEN_LIFETIME });
  res.json({ token, user: toPublicUser(user) });
}

export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}
