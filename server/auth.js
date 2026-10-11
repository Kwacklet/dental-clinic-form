import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const SESSION_HOURS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const PANEL_ROLES = ['dentist', 'staff', 'admin'];
const LOGIN_FAILED = 'Incorrect email or password.';

// Only a hash of each session token is stored, so a leaked database
// cannot be used to log in.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role
});

// email -> { count, lockedUntil }. Slows down password guessing.
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
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (isLockedOut(email)) {
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` });
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM user_profiles WHERE email = ?', [email]);
    const user = rows[0];
    const passwordOk = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
    if (!passwordOk) {
      recordFailure(email);
      return res.status(401).json({ error: LOGIN_FAILED });
    }
    if (user.status !== 'active' || !PANEL_ROLES.includes(user.role)) {
      return res.status(403).json({ error: 'This account does not have access to the Dentist Panel.' });
    }

    failedLogins.delete(email);
    const token = crypto.randomBytes(32).toString('hex');
    await pool.execute(
      'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))',
      [hashToken(token), user.id, SESSION_HOURS]
    );
    await pool.query('DELETE FROM auth_sessions WHERE expires_at < NOW()');
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const bearerToken = (req) => req.get('Authorization')?.match(/^Bearer (\w+)$/)?.[1];

// Protects Dentist Panel routes: needs a valid, unexpired session of an
// active dentist, staff or admin account.
export async function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try {
    const [rows] = await pool.execute(
      `SELECT u.* FROM auth_sessions s
       JOIN user_profiles u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > NOW()`,
      [hashToken(token)]
    );
    const user = rows[0];
    if (!user || user.status !== 'active' || !PANEL_ROLES.includes(user.role)) {
      return res.status(401).json({ error: 'Your session has ended. Please log in again.' });
    }
    req.user = publicUser(user);
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function logout(req, res) {
  const token = bearerToken(req);
  try {
    if (token) await pool.execute('DELETE FROM auth_sessions WHERE token_hash = ?', [hashToken(token)]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const me = (req, res) => res.json({ user: req.user });
