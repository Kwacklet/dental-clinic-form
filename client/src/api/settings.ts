import { api, request } from './axios'
import type { Settings } from '../types'

export function getSettings() {
  return request(api.get<Settings>('/settings'), 'Could not load the clinic settings.')
}

export function saveSettings(settings: Settings) {
  return request(api.put<Settings>('/settings', settings), 'Could not save the settings.')
}
