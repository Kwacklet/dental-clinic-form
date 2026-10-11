import { pool } from '../db.js';

const DEFAULT_SETTINGS = {
  dentistName: 'Dr. Sample Dentist',
  clinicName: "Meg's Clinic",
  formTitle: 'Dental Assessment Form'
};
const MAX_LENGTHS = { dentistName: 100, clinicName: 100, formTitle: 150 };

export async function readSettings() {
  const [rows] = await pool.query('SELECT * FROM clinic_settings ORDER BY id LIMIT 1');
  if (rows.length === 0) return DEFAULT_SETTINGS;
  return { dentistName: rows[0].dentist_name, clinicName: rows[0].clinic_name, formTitle: rows[0].form_title };
}

// GET /api/settings
export async function getSettings(req, res) {
  res.json(await readSettings());
}

// PUT /api/settings  { dentistName, clinicName, formTitle }
export async function updateSettings(req, res) {
  const values = {};
  for (const [key, max] of Object.entries(MAX_LENGTHS)) {
    const value = typeof req.body?.[key] === 'string' ? req.body[key].trim() : '';
    if (!value) return res.status(400).json({ error: 'All settings fields are required.' });
    if (value.length > max) return res.status(400).json({ error: `Each field must be ${max} characters or fewer.` });
    values[key] = value;
  }

  const params = [values.dentistName, values.clinicName, values.formTitle];
  const [rows] = await pool.query('SELECT id FROM clinic_settings ORDER BY id LIMIT 1');
  if (rows.length > 0) {
    await pool.execute(
      'UPDATE clinic_settings SET dentist_name = ?, clinic_name = ?, form_title = ? WHERE id = ?',
      [...params, rows[0].id]
    );
  } else {
    await pool.execute('INSERT INTO clinic_settings (dentist_name, clinic_name, form_title) VALUES (?, ?, ?)', params);
  }
  res.json(values);
}
