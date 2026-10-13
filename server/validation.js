import { z } from 'zod';

const NAME_PATTERN = /^[\p{L}' .-]+$/u;
const PHONE_PATTERN = /^09\d{9}$/;
const LETTERS_PATTERN = /^[\p{L} ]+$/u;
const LETTERS_HYPHEN_PATTERN = /^[\p{L} -]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const YES_NO_NOT_SURE = ['No', 'Yes', 'Not sure'];
const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say', 'Other'];
const PREGNANCY_OPTIONS = ['No', 'Yes', 'Not sure', 'Not applicable', 'Prefer not to say'];

const isBlank = (value) => value === undefined || value === null || value === '';

function isRealPastDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isReal = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isReal && year >= 1900 && date <= new Date();
}

function requiredText(label) {
  return z
    .string({ error: (issue) => (issue.input == null ? `${label} is required.` : `${label} must be text.`) })
    .refine((value) => value.trim() !== '', `${label} is required.`);
}

function requiredChoice(field, label, options) {
  return z.enum(options, {
    error: (issue) => (isBlank(issue.input) ? `${label} is required.` : `${field} must be one of: ${options.join(', ')}.`)
  });
}

const optional = (schema) => z.preprocess((value) => (isBlank(value) ? undefined : value), schema.optional());

const name = (label) =>
  requiredText(label)
    .max(60, `${label} must be 60 characters or fewer.`)
    .regex(NAME_PATTERN, `${label} can only use letters, spaces, hyphens and apostrophes.`);

const text = (field, label, max) =>
  requiredText(label).max(max, `${field} must be text of ${max} characters or fewer.`);

const letters = (field, label, max, { allowHyphens = false } = {}) =>
  allowHyphens
    ? text(field, label, max).regex(LETTERS_HYPHEN_PATTERN, `${label} can only use letters, spaces and hyphens.`)
    : text(field, label, max).regex(LETTERS_PATTERN, `${label} can only use letters and spaces.`);

const phone = (label) =>
  requiredText(label).regex(PHONE_PATTERN, `${label} must be 11 digits starting with 09 (e.g. 09171234567).`);

const choice = (field, options) => optional(z.enum(options, { error: `${field} must be one of: ${options.join(', ')}.` }));

const scale = (field) => {
  const message = `${field} must be a whole number from 0 to 10.`;
  return optional(
    z.union([z.string(), z.number()], { error: message })
      .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 10, message)
  );
};

const consent = z.literal(true, { error: 'All three consent boxes must be ticked.' });

export const assessmentSchema = z.looseObject(
  {
    lastName: name('Last name'),
    firstName: name('First name'),
    dateOfBirth: requiredText('Date of birth')
      .refine(isRealPastDate, 'Date of birth must be a real date (YYYY-MM-DD), not in the future.'),
    age: z
      .union([z.string(), z.number()], { error: 'Age is required.' })
      .refine((value) => String(value).trim() !== '', 'Age is required.')
      .refine((value) => /^\d+$/.test(String(value).trim()) && Number(value) <= 120, 'Age must be a whole number from 0 to 120.'),
    sex: requiredChoice('sex', 'Sex', SEX_OPTIONS),
    mobileNumber: phone('Mobile number'),
    email: requiredText('Email address')
      .max(100, 'Email address is not valid.')
      .regex(EMAIL_PATTERN, 'Email address is not valid.'),
    address: text('address', 'Address', 200),
    occupation: letters('occupation', 'Occupation', 100),
    emergencyContactName: name('Emergency contact name'),
    emergencyContactNumber: phone('Emergency contact number'),
    emergencyContactRelationship: letters('emergencyContactRelationship', 'Relationship to patient', 60, { allowHyphens: true }),
    preferredName: optional(z.string({ error: 'preferredName must be text.' }).max(60, 'preferredName must be text of 60 characters or fewer.')),
    takingMedications: choice('takingMedications', YES_NO_NOT_SURE),
    hasAllergies: choice('hasAllergies', YES_NO_NOT_SURE),
    pregnancy: choice('pregnancy', PREGNANCY_OPTIONS),
    visitReasonsOther: optional(z.string({ error: 'visitReasonsOther must be text.' }).max(150, 'visitReasonsOther must be text of 150 characters or fewer.')),
    toothachePain: scale('toothachePain'),
    anxietyLevel: scale('anxietyLevel'),
    consentAccurate: consent,
    consentInformChanges: consent,
    consentPrivacy: consent
  },
  { error: 'The request must include an "answers" object.' }
);

export function validateAssessment(answers) {
  const result = assessmentSchema.safeParse(answers);
  if (result.success) return null;
  const issue = result.error.issues[0];
  return { field: issue.path[0] ?? 'answers', message: issue.message };
}
