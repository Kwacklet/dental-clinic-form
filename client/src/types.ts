export type AnswerValue = string | string[] | boolean | undefined
export type Answers = Record<string, AnswerValue>

export type QuestionType =
  | 'text'
  | 'name'
  | 'letters'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'scale'
  | 'consent'

export interface ShowIfRule {
  questionId: string
  value?: string | string[]
  anyExcept?: string
}

export interface Question {
  id: string
  label: string
  type: QuestionType
  required: boolean
  options?: string[]
  helpText?: string
  placeholder?: string
  min?: number
  max?: number
  maxLength?: number
  allowHyphens?: boolean
  minLabel?: string
  maxLabel?: string
  showIf?: ShowIfRule
  group?: string
  isGroupItem?: boolean
  otherId?: string
  isOtherText?: boolean
  exclusiveOption?: string
  calculateFrom?: string
  calculate?: (answers: Answers, previousAnswers: Answers) => AnswerValue
  lockedIf?: (answers: Answers) => boolean
  lockedText?: string
}

export interface Section {
  id: string
  title: string
  isPatientInfo?: boolean
  questions: Question[]
}

export interface Settings {
  dentistName: string
  clinicName: string
  formTitle: string
}

export type AssessmentStatus = 'New' | 'Reviewed' | 'Archived'

export interface Assessment {
  id: number
  code: string
  patientCode: string
  status: AssessmentStatus
  submittedAt: string
  answers: Answers & { fullName: string }
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}
