import { api, request } from './axios'
import type { Answers, Assessment, AssessmentStatus } from '../types'

export function submitAssessment(answers: Answers) {
  return request(api.post<{ id: number }>('/assessments', { answers }), 'Could not send the form.')
}

export function getAssessments() {
  return request(api.get<Assessment[]>('/assessments'), 'Could not load the assessments.')
}

// Resolves to null when the assessment does not exist (404).
export function getAssessment(id: string) {
  const call = api
    .get<Assessment>(`/assessments/${id}`, { validateStatus: (status) => status === 200 || status === 404 })
    .then((response) => ({ data: response.status === 404 ? null : response.data }))
  return request(call, 'Could not load this assessment.')
}

export function setAssessmentStatus(id: number, status: AssessmentStatus) {
  return request(api.patch(`/assessments/${id}/status`, { status }), 'Could not update the status.')
}

export function deleteAssessment(id: number) {
  return request(api.delete(`/assessments/${id}`), 'Could not delete this record.')
}
