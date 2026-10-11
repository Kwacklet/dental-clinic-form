import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { login, logout, me, requireAuth } from './auth.js';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database: dental_clinic_db');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });

app.post('/api/login', login);
app.post('/api/logout', logout);
app.get('/api/me', requireAuth, me);

// Public (patient form): GET /api/settings and POST /api/assessments.
// Everything else is for logged-in Dentist Panel users only.

app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clinic_settings ORDER BY id LIMIT 1');
    if (rows.length === 0) {
      return res.json({
        clinicName: "Meg's Clinic",
        formTitle: "Dental Assessment Form",
        dentistName: "Dr. Sample Dentist"
      });
    }
    res.json({
      clinicName: rows[0].clinic_name,
      formTitle: rows[0].form_title,
      dentistName: rows[0].dentist_name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', requireAuth, async (req, res) => {
  const limits = { dentistName: 100, clinicName: 100, formTitle: 150 };
  const values = {};
  for (const [key, max] of Object.entries(limits)) {
    const value = typeof req.body[key] === 'string' ? req.body[key].trim() : '';
    if (!value) return res.status(400).json({ error: 'All settings fields are required.' });
    if (value.length > max) return res.status(400).json({ error: `Each field must be ${max} characters or fewer.` });
    values[key] = value;
  }
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assessments', async (req, res) => {
  const { answers, clinicName = "Meg's Clinic", formTitle = "Dental Assessment Form" } = req.body;

  const lastName = answers?.lastName?.trim();
  const firstName = answers?.firstName?.trim();
  if (!lastName || !firstName) {
    return res.status(400).json({ error: 'Last name and first name are required.' });
  }
  const fullName = `${firstName} ${lastName}`;

  const optional = (key) => answers[key] || null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [patientResult] = await conn.execute(
      `INSERT INTO patients (
        last_name, first_name, full_name, preferred_name, date_of_birth, age, sex,
        mobile_number, email, address, occupation,
        emergency_contact_name, emergency_contact_number, emergency_contact_relationship
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lastName,
        firstName,
        fullName,
        optional('preferredName'),
        answers.dateOfBirth,
        optional('age'),
        optional('sex'),
        answers.mobileNumber,
        optional('email'),
        optional('address'),
        optional('occupation'),
        optional('emergencyContactName'),
        optional('emergencyContactNumber'),
        optional('emergencyContactRelationship')
      ]
    );

    const patientId = patientResult.insertId;

    const visitReasonsStr = Array.isArray(answers.visitReasons)
      ? answers.visitReasons.join(', ')
      : answers.visitReasons || null;

    const hasConditions = answers.medicalConditions && !answers.medicalConditions.includes('None') ? 1 : 0;

    const [assessmentResult] = await conn.execute(
      `INSERT INTO dental_assessments (
        patient_id, clinic_name, form_title, status,
        visit_reasons, visit_reasons_other, concern_description,
        toothache_pain_level, anxiety_level,
        has_medical_conditions, taking_medications, has_allergies, pregnancy,
        consent_accurate, consent_inform_changes, consent_privacy,
        all_answers_payload
      ) VALUES (?, ?, ?, 'New', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        clinicName,
        formTitle,
        visitReasonsStr,
        optional('visitReasonsOther'),
        optional('concernDescription'),
        answers.toothachePain != null ? Number(answers.toothachePain) : null,
        answers.anxietyLevel != null ? Number(answers.anxietyLevel) : null,
        hasConditions,
        optional('takingMedications'),
        optional('hasAllergies'),
        optional('pregnancy'),
        answers.consentAccurate ? 1 : 0,
        answers.consentInformChanges ? 1 : 0,
        answers.consentPrivacy ? 1 : 0,
        JSON.stringify({ ...answers, fullName })
      ]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Assessment submitted successfully',
      assessmentId: assessmentResult.insertId,
      patientId: patientId
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

const sendRows = (sql) => async (req, res) => {
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get('/api/assessments', requireAuth, sendRows(
  `SELECT a.*, p.last_name, p.first_name, p.full_name, p.mobile_number, p.email, p.date_of_birth, p.age, p.sex
   FROM dental_assessments a
   LEFT JOIN patients p ON a.patient_id = p.id
   ORDER BY a.submitted_at DESC`
));

app.patch('/api/assessments/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!['New', 'Reviewed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "New" or "Reviewed".' });
  }
  try {
    const [result] = await pool.execute('UPDATE dental_assessments SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Could not update the status. This record no longer exists.' });
    }
    res.json({ id: Number(req.params.id), status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletes the assessment, and its patient if they have no other assessments.
app.delete('/api/assessments/:id', requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT patient_id FROM dental_assessments WHERE id = ? FOR UPDATE', [req.params.id]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Could not delete this record. It no longer exists.' });
    }
    const patientId = rows[0].patient_id;
    await conn.execute('DELETE FROM dental_assessments WHERE id = ?', [req.params.id]);
    if (patientId != null) {
      await conn.execute(
        'DELETE FROM patients WHERE id = ? AND NOT EXISTS (SELECT 1 FROM dental_assessments WHERE patient_id = ?)',
        [patientId, patientId]
      );
    }
    await conn.commit();
    res.json({ id: Number(req.params.id) });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

app.get('/api/inventory', requireAuth, sendRows('SELECT * FROM inventory_records ORDER BY item_name ASC'));

app.get('/api/users', requireAuth, sendRows('SELECT id, first_name, last_name, email, role, status FROM user_profiles'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://127.0.0.1:${PORT}`);
});