/*
 * Validation helpers for the questionnaire.
 * Each validator returns an error message, or '' when the value is valid.
 */

import { getTodayISO, parseISODate } from './dates'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\d{7,15}$/
const NAME_PATTERN = /^[A-Za-zÀ-ÿ' .-]+$/

export function isEmpty(value) {
  if (Array.isArray(value)) return value.length === 0
  return value === undefined || value === null || String(value).trim() === ''
}

export function validateEmail(email) {
  if (isEmpty(email)) return 'Email is required.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address (e.g. name@example.com).'
  return ''
}

// Validates one questionnaire answer based on the question's settings.
export function validateAnswer(question, value) {
  // Consent boxes must be ticked (their value is true or false).
  if (question.type === 'consent') {
    return question.required && value !== true ? 'Please tick this box to continue.' : ''
  }

  if (isEmpty(value)) {
    if (!question.required) return ''
    if (question.isOtherText) return 'Please specify.'
    const isChoice = ['select', 'radio', 'checkbox'].includes(question.type)
    return isChoice ? 'Please select an option.' : 'This field is required.'
  }

  switch (question.type) {
    case 'email':
      return validateEmail(value)
    case 'tel':
      return PHONE_PATTERN.test(value) ? '' : 'Enter numbers only (7 to 15 digits).'
    case 'name':
      if (!NAME_PATTERN.test(value.trim())) return 'Use letters, spaces, hyphens and apostrophes only.'
      return ''
    case 'date': {
      if (!parseISODate(value)) return 'Enter a valid date.'
      if (value > getTodayISO()) return 'Date cannot be in the future.'
      if (value < '1900-01-01') return 'Enter a realistic date.'
      return ''
    }
    case 'number': {
      if (!/^\d+$/.test(value)) return 'Enter a whole number.'
      const number = Number(value)
      if (question.min !== undefined && number < question.min) return `Must be at least ${question.min}.`
      if (question.max !== undefined && number > question.max) return `Must be ${question.max} or less.`
      return ''
    }
    case 'checkbox':
      // e.g. "None" cannot be ticked together with a medical condition.
      if (question.exclusiveOption && value.includes(question.exclusiveOption) && value.length > 1) {
        return `Choose "${question.exclusiveOption}" or specific options, not both.`
      }
      return ''
    default:
      if (question.maxLength && value.length > question.maxLength) {
        return `Must be ${question.maxLength} characters or fewer.`
      }
      return ''
  }
}
