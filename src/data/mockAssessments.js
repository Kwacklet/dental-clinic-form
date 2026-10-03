/*
 * MOCK ASSESSMENTS (demo data only)
 * ---------------------------------
 * Fake submissions used to demonstrate the Dentist Panel.
 * Delete this file once real submissions come from the database
 * (see src/services/assessmentService.js).
 *
 * `answers` uses the same shape the patient form produces, keyed by the
 * question ids in src/data/questions.js. Only answers to questions that
 * applied to the patient are included.
 */
import { calculateAge } from '../utils/dates'

// Dates are relative to today so the dashboard always has recent examples.
function daysAgo(days, hour) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 15, 0, 0)
  return date
}

function mockAssessment({ id, patientId, submitted, status, answers }) {
  return {
    id,
    patientId, // assigned automatically on submission, not typed by the patient
    status, // 'New' | 'Reviewed'
    submittedAt: submitted.toISOString(),
    answers: {
      ...answers,
      age: calculateAge(answers.dateOfBirth),
      consentAccurate: true,
      consentInformChanges: true,
      consentPrivacy: true,
    },
  }
}

export const mockAssessments = [
  // Two reasons at once (Toothache + Dental cleaning), with an "Other" answer.
  mockAssessment({
    id: 'MOCK-005',
    patientId: 'P-0005',
    submitted: daysAgo(0, 9),
    status: 'New',
    answers: {
      fullName: 'Juan Dela Cruz',
      dateOfBirth: '1988-03-12',
      sex: 'Male',
      mobileNumber: '09170000005',
      email: 'juan.delacruz@example.com',
      occupation: 'Driver',
      emergencyContactName: 'Maria Dela Cruz',
      emergencyContactNumber: '09170000105',
      emergencyContactRelationship: 'Wife',
      visitReasons: ['Dental cleaning', 'Toothache'],
      concernDescription: 'Lower left molar has been hurting for a few days, worse at night.',
      cleaningLastCleaning: 'More than 2 years ago',
      cleaningGumsBleed: 'Occasionally',
      cleaningBadBreath: 'No',
      cleaningTartar: 'Yes',
      cleaningBrushing: 'Once a day',
      cleaningFlossing: 'Never',
      toothacheLocation: 'Lower left',
      toothacheStart: '1–3 days ago',
      toothachePain: '7',
      toothacheWorse: ['Cold food or drinks', 'Biting/chewing', 'Other'],
      toothacheWorseOther: 'Grinding teeth at night',
      toothacheSpontaneous: 'Yes',
      medicalConditions: ['High blood pressure'],
      medicalConditionDetails: 'Diagnosed 2019, controlled with medication.',
      takingMedications: 'Yes',
      medicationList: 'Amlodipine 5 mg once daily',
      bloodThinners: 'No',
      boneMedication: 'No',
      hasAllergies: 'No',
      anesthesiaReaction: 'No',
      excessiveBleeding: 'No',
      fainting: 'No',
      antibioticPremedication: 'No',
      pregnancy: 'Not applicable',
      anxietyLevel: '4',
      negativeExperience: 'No',
    },
  }),
  // Allergies with details; bleeding gums.
  mockAssessment({
    id: 'MOCK-004',
    patientId: 'P-0004',
    submitted: daysAgo(0, 8),
    status: 'New',
    answers: {
      fullName: 'Angela Reyes',
      preferredName: 'Angie',
      dateOfBirth: '2004-11-02',
      sex: 'Female',
      mobileNumber: '09170000004',
      address: 'Quezon City',
      occupation: 'Student',
      visitReasons: ['Bleeding gums'],
      bleedingFrequency: 'Frequently',
      bleedingStart: '1–4 weeks ago',
      bleedingSwollen: 'Yes',
      medicalConditions: ['None'],
      takingMedications: 'No',
      bloodThinners: 'No',
      boneMedication: 'No',
      hasAllergies: 'Yes',
      allergens: ['Antibiotics', 'Latex'],
      allergyReaction: 'Penicillin causes a skin rash; latex gloves cause itching.',
      anesthesiaReaction: 'No',
      excessiveBleeding: 'Not sure',
      fainting: 'No',
      antibioticPremedication: 'No',
      pregnancy: 'No',
      anxietyLevel: '8',
      negativeExperience: 'Yes',
      comfortRequests: 'Please explain each step before starting.',
    },
  }),
  // Routine check-up and cosmetic dentistry.
  mockAssessment({
    id: 'MOCK-003',
    patientId: 'P-0003',
    submitted: daysAgo(2, 14),
    status: 'Reviewed',
    answers: {
      fullName: 'Mark Villanueva',
      dateOfBirth: '1995-07-21',
      sex: 'Male',
      mobileNumber: '09170000003',
      email: 'mark.v@example.com',
      visitReasons: ['Routine dental check-up', 'Cosmetic dentistry'],
      checkupLastVisit: '1–2 years ago',
      checkupProblemsSince: 'No',
      cosmeticTreatments: ['Teeth whitening', 'Composite bonding'],
      cosmeticGoals: 'Whiter teeth and fix a small chip on the front tooth.',
      medicalConditions: ['Asthma', 'Other'],
      medicalConditionsOther: 'Migraine',
      medicalConditionDetails: 'Uses an inhaler as needed.',
      takingMedications: 'Not sure',
      medicationList: 'Salbutamol inhaler',
      bloodThinners: 'No',
      boneMedication: 'No',
      hasAllergies: 'No',
      anesthesiaReaction: 'No',
      excessiveBleeding: 'No',
      fainting: 'No',
      antibioticPremedication: 'No',
      pregnancy: 'Not applicable',
      anxietyLevel: '2',
      negativeExperience: 'No',
    },
  }),
  // Dentures; blood thinners; older patient.
  mockAssessment({
    id: 'MOCK-002',
    patientId: 'P-0002',
    submitted: daysAgo(5, 10),
    status: 'Reviewed',
    answers: {
      fullName: 'Liza Mendoza',
      dateOfBirth: '1954-01-30',
      sex: 'Female',
      mobileNumber: '09170000002',
      emergencyContactName: 'Paolo Mendoza',
      emergencyContactNumber: '09170000102',
      emergencyContactRelationship: 'Son',
      visitReasons: ['Dentures'],
      denturesReason: 'Loose dentures',
      denturesSores: 'Yes',
      medicalConditions: ['Diabetes', 'Heart disease'],
      medicalConditionDetails: 'Type 2 diabetes; had a heart stent placed in 2021.',
      takingMedications: 'Yes',
      medicationList: 'Metformin 500 mg twice daily; Clopidogrel 75 mg daily',
      bloodThinners: 'Yes',
      boneMedication: 'No',
      hasAllergies: 'No',
      anesthesiaReaction: 'No',
      excessiveBleeding: 'Yes',
      fainting: 'No',
      antibioticPremedication: 'Not sure',
      pregnancy: 'Not applicable',
      anxietyLevel: '3',
      negativeExperience: 'No',
      additionalInfo: 'Please call my son before any extraction.',
    },
  }),
  // Minor patient with oral pain and a wisdom tooth concern.
  mockAssessment({
    id: 'MOCK-001',
    patientId: 'P-0001',
    submitted: daysAgo(9, 16),
    status: 'New',
    answers: {
      fullName: 'Carlo Santos',
      dateOfBirth: '2008-05-09',
      sex: 'Male',
      mobileNumber: '09170000001',
      emergencyContactName: 'Rhea Santos',
      emergencyContactNumber: '09170000101',
      emergencyContactRelationship: 'Mother',
      visitReasons: ['Wisdom tooth concern', 'Oral pain'],
      wisdomProblems: ['Pain', 'Swelling', 'Tooth partially erupted'],
      wisdomDuration: 'A few days',
      wisdomFever: 'No',
      oralPainLocation: 'Lower right',
      oralPainStart: '1–3 days ago',
      oralPainSeverity: '6',
      medicalConditions: ['None'],
      takingMedications: 'No',
      bloodThinners: 'No',
      boneMedication: 'No',
      hasAllergies: 'Not sure',
      anesthesiaReaction: 'Not sure',
      excessiveBleeding: 'No',
      fainting: 'Yes',
      antibioticPremedication: 'No',
      pregnancy: 'Not applicable',
      anxietyLevel: '9',
      negativeExperience: 'Prefer not to say',
    },
  }),
]
