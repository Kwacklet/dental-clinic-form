import { getTodayISO, toLocalISODate } from '../utils/dates';
import { API_BASE } from './api';
import { authHeaders, handleUnauthorized } from './authService';

// A 401 means the login expired: show the login screen again.
async function checkResponse(response, failMessage, useServerMessage) {
  if (response.ok) return response.json();
  const errorData = await response.json().catch(() => ({}));
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error(errorData.error || 'Please log in again.');
  }
  throw new Error((useServerMessage && errorData.error) || failMessage);
}

export async function submitAssessment(answers, settings) {
  const response = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answers,
      clinicName: settings.clinicName,
      formTitle: settings.formTitle,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit form to server.');
  }

  return response.json();
}

async function getJSON(path, failMessage) {
  const response = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  return checkResponse(response, failMessage, false);
}

export async function getSettings() {
  return getJSON('/settings', 'Failed to load clinic settings from server.');
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
    answers: {
      ...answers,
      lastName: answers.lastName || row.last_name || '',
      firstName: answers.firstName || row.first_name || '',
      fullName: answers.fullName || row.full_name || '',
    },
  };
}

export async function getAssessments() {
  const rows = await getJSON('/assessments', 'Failed to load assessments from server.');
  return rows.map(toAssessment);
}

export async function getAssessmentById(id) {
  const assessments = await getAssessments();
  return assessments.find((a) => a.id === Number(id)) || null;
}

async function send(path, method, failMessage, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...authHeaders(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return checkResponse(response, failMessage, true);
}

export async function setAssessmentStatus(id, status) {
  return send(`/assessments/${id}/status`, 'PATCH', 'Could not update the status.', { status });
}

export async function deleteAssessment(id) {
  return send(`/assessments/${id}`, 'DELETE', 'Could not delete this record.');
}

export async function saveSettings(settings) {
  return send('/settings', 'PUT', 'Could not save the settings.', {
    dentistName: settings.dentistName,
    clinicName: settings.clinicName,
    formTitle: settings.formTitle,
  });
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