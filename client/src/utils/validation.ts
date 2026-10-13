import { z } from 'zod'
import { getTodayISO, parseISODate } from './dates'
import type { AnswerValue, Question } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\d{7,15}$/
const NAME_PATTERN = /^[A-Za-zÀ-ÿ' .-]+$/

const REQUIRED = 'This field is required.'

export function isEmpty(value: AnswerValue | null) {
  if (Array.isArray(value)) return value.length === 0
  return value === undefined || value === null || String(value).trim() === ''
}

const notBlank = (message: string) => z.string({ error: message }).refine((value) => value.trim() !== '', message)

const emailSchema = notBlank('Email is required.')
  .trim()
  .regex(EMAIL_PATTERN, 'Enter a valid email address (e.g. name@example.com).')

export const loginSchema = z.object({
  email: emailSchema,
  password: notBlank('Password is required.'),
})

export const settingsSchema = z.object({
  dentistName: notBlank(REQUIRED),
  clinicName: notBlank(REQUIRED),
  formTitle: notBlank(REQUIRED),
})

export function getFieldErrors<T extends z.ZodType>(schema: T, values: unknown) {
  const result = schema.safeParse(values)
  const errors: Record<string, string> = {}
  if (result.success) return errors
  for (const issue of result.error.issues) {
    const field = String(issue.path[0])
    errors[field] ??= issue.message
  }
  return errors
}

function emptyMessage(question: Question) {
  if (question.isOtherText) return 'Please specify.'
  return ['select', 'radio', 'checkbox'].includes(question.type) ? 'Please select an option.' : REQUIRED
}

function filledSchema(question: Question): z.ZodType {
  const required = {
    error: (issue: { input?: unknown }) => (issue.input === undefined ? emptyMessage(question) : 'This answer is not valid.'),
  }
  const { min, max, maxLength, exclusiveOption } = question

  switch (question.type) {
    case 'checkbox':
      return z
        .array(z.string(), required)
        .refine(
          (value) => !(exclusiveOption && value.includes(exclusiveOption) && value.length > 1),
          `Choose "${exclusiveOption}" or specific options, not both.`,
        )
    case 'email':
      return z.string(required).trim().regex(EMAIL_PATTERN, 'Enter a valid email address (e.g. name@example.com).')
    case 'tel':
      return z.string(required).regex(PHONE_PATTERN, 'Enter numbers only (7 to 15 digits).')
    case 'name':
      return z.string(required).trim().regex(NAME_PATTERN, 'Use letters, spaces, hyphens and apostrophes only.')
    case 'date':
      return z
        .string(required)
        .refine((value) => parseISODate(value) !== null, { message: 'Enter a valid date.', abort: true })
        .refine((value) => value <= getTodayISO(), { message: 'Date cannot be in the future.', abort: true })
        .refine((value) => value >= '1900-01-01', 'Enter a realistic date.')
    case 'number':
      return z
        .string(required)
        .regex(/^\d+$/, { message: 'Enter a whole number.', abort: true })
        .refine((value) => min === undefined || Number(value) >= min, `Must be at least ${min}.`)
        .refine((value) => max === undefined || Number(value) <= max, `Must be ${max} or less.`)
    default: {
      const text = z.string(required)
      return maxLength ? text.max(maxLength, `Must be ${maxLength} characters or fewer.`) : text
    }
  }
}

function buildAnswerSchema(question: Question): z.ZodType {
  if (question.type === 'consent') {
    return question.required ? z.literal(true, { error: 'Please tick this box to continue.' }) : z.unknown()
  }
  const filled = filledSchema(question)
  return z.preprocess((value) => (isEmpty(value as AnswerValue) ? undefined : value), question.required ? filled : filled.optional())
}

const answerSchemas = new WeakMap<Question, z.ZodType>()

export function answerSchema(question: Question) {
  let schema = answerSchemas.get(question)
  if (!schema) {
    schema = buildAnswerSchema(question)
    answerSchemas.set(question, schema)
  }
  return schema
}

export function validateAnswer(question: Question, value: AnswerValue): string {
  const result = answerSchema(question).safeParse(value)
  return result.success ? '' : result.error.issues[0].message
}
