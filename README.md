# Dental Assessment Form

A React + Vite app for Meg's Clinic with two sides:

- **Patient form** (`/`): patients fill in the questionnaire, review their answers and send them to the clinic.
- **Dentist Panel** (`/dentist`): the clinic sees, reviews and deletes submitted assessments, and changes the clinic settings.

**There is no database yet.** Everything is saved in the browser (localStorage), and there is no login. The patient form and the Dentist Panel must be opened in the same browser on the same computer, and clearing the browser's site data deletes the records.

## Run it

1. `npm install`
2. `npm run dev`

- Patient form: http://localhost:5173/
- Dentist Panel: http://localhost:5173/dentist

## Adding a database

All saving and loading goes through two files, which currently point to the browser-only version in `src/services/local/`:

- `src/services/assessmentService.js`
- `src/services/authService.js`

To use a database, make a new folder (for example `src/services/database/`) with the same functions as `src/services/local/`, then change the `from` line in both files to point to it. Nothing else in the app has to change.

| Function | What it must do |
| --- | --- |
| `submitAssessment(answers)` | Save a new form. The database assigns the Assessment ID, the Patient ID (`P-0001`…, never reused), status `New` and the date. |
| `getAssessments()` | All assessments, newest first. |
| `getAssessmentById(id)` | One assessment, or `null` if it doesn't exist. |
| `setAssessmentStatus(id, status)` | Set `'New'` or `'Reviewed'`. |
| `deleteAssessment(id)` | Delete one assessment. |
| `getSettings()` / `saveSettings(settings)` | Read / save `{ dentistName, clinicName, formTitle }`. |
| `LOGIN_REQUIRED`, `signIn`, `signOut`, `watchSession`, `isDentist` | Dentist login (see `src/services/local/authService.js`). Set `LOGIN_REQUIRED = true` to show the login screen and Log out button. |

Every function returns a Promise and throws an `Error` with a message that is safe to show on screen when something fails. An assessment has this shape:

```js
{
  id: 1,                  // number, used in the page address
  code: 'A-0001',         // Assessment ID shown on screen
  patientId: 'P-0001',
  status: 'New',          // or 'Reviewed'
  submittedAt: '2026-09-28T10:15:00Z', // ISO date
  answers: { fullName: 'Juan Dela Cruz', ... }, // keyed by the question ids in src/data/questions.js
}
```

The answers are health information, so a real database must only let logged-in clinic staff read, review or delete them. A browser must never hold a database password.

## Where things are

| What | File |
| --- | --- |
| Questions, branching rules (`showIf`) | `src/data/questions.js` |
| Validation | `src/utils/validation.js` |
| Branching logic | `src/utils/branching.js` |
| Patient side | `src/PatientApp.jsx`, `src/components/` |
| Dentist side (incl. login screen) | `src/dentist/` |
| Where data is saved (the switch) | `src/services/assessmentService.js`, `src/services/authService.js` |
| Browser-only saving | `src/services/local/` |
| Default dentist / clinic / form title | `src/data/formSettings.js` |

## Deploying

`npm run build` creates `dist/`. Upload `dist/` to a static host such as Netlify. `public/_redirects` makes `/dentist/...` links work on Netlify; other hosts must also serve `index.html` for those URLs.

With browser-only saving, each visitor's submissions stay in their own browser, so the dentist can only see forms filled in on the same device.

## Not built yet

- A database and dentist login (see [Adding a database](#adding-a-database))
- Managing questions from the Dentist Panel (the Questionnaire page, `src/dentist/QuestionnairePage.jsx`, is set aside; see `src/dentist/DentistPanel.jsx` to bring it back)
