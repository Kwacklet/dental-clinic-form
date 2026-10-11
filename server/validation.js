const NAME_PATTERN = /^[A-Za-zÀ-ÿ' .-]+$/;
const PHONE_PATTERN = /^\d{7,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const YES_NO_NOT_SURE = ['No', 'Yes', 'Not sure'];
const CHOICES = {
  sex: ['Male', 'Female', 'Prefer not to say', 'Other'],
  takingMedications: YES_NO_NOT_SURE,
  hasAllergies: YES_NO_NOT_SURE,
  pregnancy: ['No', 'Yes', 'Not sure', 'Not applicable', 'Prefer not to say']
};
const MAX_LENGTHS = {
  preferredName: 60, address: 200, occupation: 100,
  emergencyContactName: 100, emergencyContactRelationship: 60, visitReasonsOther: 150
};
const SCALES = ['toothachePain', 'anxietyLevel'];
const CONSENTS = ['consentAccurate', 'consentInformChanges', 'consentPrivacy'];

const isBlank = (value) => value === undefined || value === null || value === '';

function isRealPastDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isReal = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isReal && year >= 1900 && date <= new Date();
}

export function validateAssessment(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { field: 'answers', message: 'The request must include an "answers" object.' };
  }

  for (const [field, label] of [['lastName', 'Last name'], ['firstName', 'First name']]) {
    const value = typeof answers[field] === 'string' ? answers[field].trim() : '';
    if (!value) return { field, message: `${label} is required.` };
    if (value.length > 60) return { field, message: `${label} must be 60 characters or fewer.` };
    if (!NAME_PATTERN.test(value)) return { field, message: `${label} can only use letters, spaces, hyphens and apostrophes.` };
  }

  if (!isRealPastDate(answers.dateOfBirth)) {
    return { field: 'dateOfBirth', message: 'Date of birth must be a real date (YYYY-MM-DD), not in the future.' };
  }
  if (!PHONE_PATTERN.test(answers.mobileNumber ?? '')) {
    return { field: 'mobileNumber', message: 'Mobile number must be 7 to 15 digits.' };
  }
  if (!isBlank(answers.emergencyContactNumber) && !PHONE_PATTERN.test(answers.emergencyContactNumber)) {
    return { field: 'emergencyContactNumber', message: 'Emergency contact number must be 7 to 15 digits.' };
  }
  if (!isBlank(answers.email) && !(EMAIL_PATTERN.test(answers.email) && answers.email.length <= 100)) {
    return { field: 'email', message: 'Email address is not valid.' };
  }

  for (const [field, allowed] of Object.entries(CHOICES)) {
    if (!isBlank(answers[field]) && !allowed.includes(answers[field])) {
      return { field, message: `${field} must be one of: ${allowed.join(', ')}.` };
    }
  }
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (!isBlank(answers[field]) && (typeof answers[field] !== 'string' || answers[field].length > max)) {
      return { field, message: `${field} must be text of ${max} characters or fewer.` };
    }
  }
  for (const field of SCALES) {
    const value = answers[field];
    if (!isBlank(value) && !(Number.isInteger(Number(value)) && value >= 0 && value <= 10)) {
      return { field, message: `${field} must be a whole number from 0 to 10.` };
    }
  }
  for (const field of CONSENTS) {
    if (answers[field] !== true) return { field, message: 'All three consent boxes must be ticked.' };
  }
  return null;
}
