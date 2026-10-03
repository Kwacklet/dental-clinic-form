import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dental_clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('Connected to MySQL database: dental_clinic_db');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });

app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clinic_settings LIMIT 1');
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

app.post('/api/assessments', async (req, res) => {
  const { answers, clinicName = "Meg's Clinic", formTitle = "Dental Assessment Form" } = req.body;

  if (!answers || !answers.fullName) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [patientResult] = await conn.execute(
      `INSERT INTO patients (
        full_name, preferred_name, date_of_birth, age, sex, 
        mobile_number, email, address, occupation, 
        emergency_contact_name, emergency_contact_number, emergency_contact_relationship
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        answers.fullName,
        answers.preferredName || null,
        answers.dateOfBirth,
        answers.age || null,
        answers.sex || null,
        answers.mobileNumber,
        answers.email || null,
        answers.address || null,
        answers.occupation || null,
        answers.emergencyContactName || null,
        answers.emergencyContactNumber || null,
        answers.emergencyContactRelationship || null
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
        answers.visitReasonsOther || null,
        answers.concernDescription || null,
        answers.toothachePain != null ? Number(answers.toothachePain) : null,
        answers.anxietyLevel != null ? Number(answers.anxietyLevel) : null,
        hasConditions,
        answers.takingMedications || null,
        answers.hasAllergies || null,
        answers.pregnancy || null,
        answers.consentAccurate ? 1 : 0,
        answers.consentInformChanges ? 1 : 0,
        answers.consentPrivacy ? 1 : 0,
        JSON.stringify(answers)
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

app.get('/api/assessments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.full_name, p.mobile_number, p.email, p.date_of_birth, p.age, p.sex
       FROM dental_assessments a
       LEFT JOIN patients p ON a.patient_id = p.id
       ORDER BY a.submitted_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory_records ORDER BY item_name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, role, status FROM user_profiles');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://127.0.0.1:${PORT}`);
});