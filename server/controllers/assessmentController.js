import { pool } from '../db.js';
import { validateAssessment } from '../validation.js';
import { readSettings } from './settingsController.js';

const SELECT_ASSESSMENTS = `
  SELECT a.id, a.patient_id, a.status, a.submitted_at, a.all_answers_payload,
         p.last_name, p.first_name, p.full_name
  FROM dental_assessments a
  LEFT JOIN patients p ON p.id = a.patient_id`;

const toCode = (prefix, id) => (id == null ? '' : `${prefix}-${String(id).padStart(4, '0')}`);

function parseAnswers(payload) {
  if (payload && typeof payload === 'object') return payload;
  try {
    return JSON.parse(payload) ?? {};
  } catch {
    return {};
  }
}

// Database row -> the shape the Dentist Panel shows.
function toAssessment(row) {
  const answers = parseAnswers(row.all_answers_payload);
  return {
    id: row.id,
    code: toCode('A', row.id),
    patientCode: toCode('P', row.patient_id),
    status: row.status,
    submittedAt: row.submitted_at,
    answers: {
      ...answers,
      lastName: answers.lastName || row.last_name || '',
      firstName: answers.firstName || row.first_name || '',
      fullName: answers.fullName || row.full_name || ''
    }
  };
}

// Route ids must be positive whole numbers.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const optional = (value) => (value === undefined || value === '' ? null : value);
const toScale = (value) => (value === undefined || value === null || value === '' ? null : Number(value));

// GET /api/assessments
export async function listAssessments(req, res) {
  const [rows] = await pool.query(`${SELECT_ASSESSMENTS} ORDER BY a.submitted_at DESC, a.id DESC`);
  res.json(rows.map(toAssessment));
}

// GET /api/assessments/:id
export async function getAssessment(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'The id must be a positive whole number.' });

  const [rows] = await pool.execute(`${SELECT_ASSESSMENTS} WHERE a.id = ?`, [id]);
  if (rows.length === 0) return res.status(404).json({ error: `Assessment ${id} was not found.` });
  res.json(toAssessment(rows[0]));
}

// POST /api/assessments  { answers }
export async function createAssessment(req, res) {
  const answers = req.body?.answers;
  const problem = validateAssessment(answers);
  if (problem) return res.status(400).json({ error: problem.message, field: problem.field });

  const lastName = answers.lastName.trim();
  const firstName = answers.firstName.trim();
  const fullName = `${firstName} ${lastName}`;
  const settings = await readSettings();
  const visitReasons = Array.isArray(answers.visitReasons) ? answers.visitReasons.join(', ') : optional(answers.visitReasons);
  const hasConditions = Array.isArray(answers.medicalConditions) && !answers.medicalConditions.includes('None');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [patient] = await conn.execute(
      `INSERT INTO patients (
        last_name, first_name, full_name, preferred_name, date_of_birth, age, sex,
        mobile_number, email, address, occupation,
        emergency_contact_name, emergency_contact_number, emergency_contact_relationship
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lastName, firstName, fullName, optional(answers.preferredName), answers.dateOfBirth,
        optional(answers.age), optional(answers.sex), answers.mobileNumber, optional(answers.email),
        optional(answers.address), optional(answers.occupation), optional(answers.emergencyContactName),
        optional(answers.emergencyContactNumber), optional(answers.emergencyContactRelationship)
      ]
    );
    const [assessment] = await conn.execute(
      `INSERT INTO dental_assessments (
        patient_id, clinic_name, form_title, status,
        visit_reasons, visit_reasons_other, concern_description,
        toothache_pain_level, anxiety_level,
        has_medical_conditions, taking_medications, has_allergies, pregnancy,
        consent_accurate, consent_inform_changes, consent_privacy, all_answers_payload
      ) VALUES (?, ?, ?, 'New', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?)`,
      [
        patient.insertId, settings.clinicName, settings.formTitle,
        visitReasons, optional(answers.visitReasonsOther), optional(answers.concernDescription),
        toScale(answers.toothachePain), toScale(answers.anxietyLevel),
        hasConditions ? 1 : 0, optional(answers.takingMedications), optional(answers.hasAllergies),
        optional(answers.pregnancy), JSON.stringify({ ...answers, fullName })
      ]
    );
    await conn.commit();
    res.status(201).json({ id: assessment.insertId, patientId: patient.insertId, message: 'Assessment saved.' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// PATCH /api/assessments/:id/status  { status }
export async function updateAssessmentStatus(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'The id must be a positive whole number.' });
  const { status } = req.body ?? {};
  if (!['New', 'Reviewed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "New" or "Reviewed".' });
  }

  const [result] = await pool.execute('UPDATE dental_assessments SET status = ? WHERE id = ?', [status, id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: `Assessment ${id} was not found.` });
  res.json({ id, status });
}

// DELETE /api/assessments/:id
// Also deletes the patient if they have no other assessments.
export async function deleteAssessment(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'The id must be a positive whole number.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT patient_id FROM dental_assessments WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: `Assessment ${id} was not found.` });
    }
    const patientId = rows[0].patient_id;
    await conn.execute('DELETE FROM dental_assessments WHERE id = ?', [id]);
    if (patientId != null) {
      await conn.execute(
        'DELETE FROM patients WHERE id = ? AND NOT EXISTS (SELECT 1 FROM dental_assessments WHERE patient_id = ?)',
        [patientId, patientId]
      );
    }
    await conn.commit();
    res.json({ id, message: 'Assessment deleted.' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
