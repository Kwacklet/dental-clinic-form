/*
 * Local version: keeps assessments and clinic settings in this browser's
 * storage (localStorage). No database, no internet needed.
 *
 * Limits: the data exists only in the browser it was typed into, so the
 * patient form and the Dentist Panel must be opened in the same browser on
 * the same computer. Clearing the browser's site data deletes it.
 */
import { formSettings } from '../../data/formSettings'

const ASSESSMENTS_KEY = 'dentalForm.assessments'
const COUNTERS_KEY = 'dentalForm.counters' // { lastAssessment, lastPatient }
const SETTINGS_KEY = 'dentalForm.settings'

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value, action) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Could not ${action}:`, error)
    throw new Error(`Could not ${action}. This browser is not allowing the form to be saved.`, { cause: error })
  }
}

const readAssessments = () => read(ASSESSMENTS_KEY, [])

// Stored record -> the shape the app uses.
function fromRecord(record) {
  return { ...record, code: `A-${String(record.id).padStart(4, '0')}` }
}

// ---------- Patient side ----------

export async function submitAssessment(answers) {
  // Numbers only go up, so an ID is never reused after a delete.
  const counters = read(COUNTERS_KEY, { lastAssessment: 0, lastPatient: 0 })
  const next = { lastAssessment: counters.lastAssessment + 1, lastPatient: counters.lastPatient + 1 }
  const record = {
    id: next.lastAssessment,
    patientId: `P-${String(next.lastPatient).padStart(4, '0')}`,
    status: 'New',
    submittedAt: new Date().toISOString(),
    answers,
  }
  write(ASSESSMENTS_KEY, [...readAssessments(), record], 'send your form')
  write(COUNTERS_KEY, next, 'send your form')
}

// ---------- Dentist side ----------

export async function getAssessments() {
  return readAssessments()
    .map(fromRecord)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt) || b.id - a.id)
}

// One assessment, or null if it does not exist (or was deleted).
export async function getAssessmentById(id) {
  const record = readAssessments().find((a) => String(a.id) === String(id))
  return record ? fromRecord(record) : null
}

export async function setAssessmentStatus(id, status) {
  const assessments = readAssessments()
  if (!assessments.some((a) => a.id === id)) throw new Error('Could not update the status. This record no longer exists.')
  write(
    ASSESSMENTS_KEY,
    assessments.map((a) => (a.id === id ? { ...a, status } : a)),
    'update the status',
  )
}

export async function deleteAssessment(id) {
  const assessments = readAssessments()
  if (!assessments.some((a) => a.id === id)) throw new Error('Could not delete this record. It no longer exists.')
  write(
    ASSESSMENTS_KEY,
    assessments.filter((a) => a.id !== id),
    'delete this record',
  )
}

// ---------- Clinic settings ----------

export async function getSettings() {
  return { ...formSettings, ...read(SETTINGS_KEY, {}) }
}

export async function saveSettings(settings) {
  write(
    SETTINGS_KEY,
    { dentistName: settings.dentistName, clinicName: settings.clinicName, formTitle: settings.formTitle },
    'save the settings',
  )
}
