import { getTodayISO, toLocalISODate } from '../utils/dates';

const API_BASE = 'http://127.0.0.1:8080/api';

export async function submitAssessment(answers) {
  const response = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answers,
      clinicName: "Meg's Clinic",
      formTitle: 'Dental Assessment Form',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit form to server.');
  }

  return response.json();
}

export async function getSettings() {
  const response = await fetch(`${API_BASE}/settings`);
  if (!response.ok) {
    throw new Error('Failed to load clinic settings from server.');
  }
  return response.json();
}

// The server returns raw database rows (snake_case, answers stored as a JSON
// string). Convert them to the shape the Dentist Panel uses.
function parseAnswers(payload) {
  if (!payload) return {};
  if (typeof payload === 'object') return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function toAssessment(row) {
  const answers = parseAnswers(row.all_answers_payload);
  return {
    id: row.id,
    patientId: row.patient_id != null ? `P-${String(row.patient_id).padStart(4, '0')}` : '',
    status: row.status,
    submittedAt: row.submitted_at,
    answers: { ...answers, fullName: answers.fullName || row.full_name || '' },
  };
}

export async function getAssessments() {
  const response = await fetch(`${API_BASE}/assessments`);
  if (!response.ok) {
    throw new Error('Failed to load assessments from server.');
  }
  const rows = await response.json();
  return rows.map(toAssessment);
}

export async function getAssessmentById(id) {
  const assessments = await getAssessments();
  return assessments.find((a) => a.id === Number(id)) || null;
}

export async function setAssessmentStatus(id, status) {
  return { id, status };
}

export async function deleteAssessment(id) {
  return { id };
}

export async function saveSettings(settings) {
  return settings;
}

export function getDashboardStats(assessments) {
  const today = getTodayISO();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return {
    total: assessments.length,
    today: assessments.filter((a) => toLocalISODate(a.submittedAt) === today).length,
    thisWeek: assessments.filter((a) => new Date(a.submittedAt) >= weekAgo).length,
    pendingReview: assessments.filter((a) => a.status === 'New').length,
  };
}