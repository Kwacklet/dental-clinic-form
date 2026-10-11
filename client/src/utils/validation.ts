import { getTodayISO, parseISODate } from './dates'
import type { AnswerValue, Question } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\d{7,15}$/
const NAME_PATTERN = /^[A-Za-zÀ-ÿ' .-]+$/

export function isEmpty(value: AnswerValue | null) {
  if (Array.isArray(value)) return value.length === 0
  return value === undefined || value === null || String(value).trim() === ''
}

export function validateEmail(email: string) {
  if (isEmpty(email)) return 'Email is required.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address (e.g. name@example.com).'
  return ''
}

export function validateAnswer(question: Question, value: AnswerValue): string {
  if (question.type === 'consent') {
    return question.required && value !== true ? 'Please tick this box to continue.' : ''
  }

  if (isEmpty(value)) {
    if (!question.required) return ''
    if (question.isOtherText) return 'Please specify.'
    const isChoice = ['select', 'radio', 'checkbox'].includes(question.type)
    return isChoice ? 'Please select an option.' : 'This field is required.'
  }

  if (Array.isArray(value)) {
    const { exclusiveOption } = question
    if (exclusiveOption && value.includes(exclusiveOption) && value.length > 1) {
      return `Choose "${exclusiveOption}" or specific options, not both.`
    }
    return ''
  }

  const text = String(value)
  switch (question.type) {
    case 'email':
      return validateEmail(text)
    case 'tel':
      return PHONE_PATTERN.test(text) ? '' : 'Enter numbers only (7 to 15 digits).'
    case 'name':
      return NAME_PATTERN.test(text.trim()) ? '' : 'Use letters, spaces, hyphens and apostrophes only.'
    case 'date':
      if (!parseISODate(text)) return 'Enter a valid date.'
      if (text > getTodayISO()) return 'Date cannot be in the future.'
      if (text < '1900-01-01') return 'Enter a realistic date.'
      return ''
    case 'number': {
      if (!/^\d+$/.test(text)) return 'Enter a whole number.'
      const number = Number(text)
      if (question.min !== undefined && number < question.min) return `Must be at least ${question.min}.`
      if (question.max !== undefined && number > question.max) return `Must be ${question.max} or less.`
      return ''
    }
    default:
      if (question.maxLength && text.length > question.maxLength) {
        return `Must be ${question.maxLength} characters or fewer.`
      }
      return ''
  }
}
