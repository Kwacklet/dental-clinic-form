export function toLocalISODate(value: string | Date) {
  const date = new Date(value)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function getTodayISO() {
  return toLocalISODate(new Date())
}

export function parseISODate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function calculateAge(dateOfBirth: unknown) {
  const birth = parseISODate(dateOfBirth)
  if (!birth) return ''

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hadBirthdayThisYear) age -= 1

  return age >= 0 && age <= 120 ? String(age) : ''
}

export function formatDate(value: string) {
  const date = parseISODate(value)
  if (!date) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateTime(isoString: string) {
  return new Date(isoString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
