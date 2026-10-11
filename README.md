# Dental Assessment Form

A full-stack health check questionnaire for a dental clinic. Patients fill in a multi-step form before their visit; the answers are validated, saved in MySQL, and reviewed by the clinic in a password-protected Dentist Panel.

- **Patient form** (`/`): 10 sections with follow-up questions that appear only when relevant (e.g. toothache details), a review screen, and a confirmation after sending.
- **Dentist Panel** (`/dentist`): log in, see a dashboard and the list of submitted assessments, open one, mark it reviewed, delete it, and edit the clinic settings shown on the patient form.

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend (`client/`) | React 19, TypeScript, Vite, Axios |
| Backend (`server/`) | Node.js, Express 5, mysql2/promise, bcryptjs, jsonwebtoken, dotenv, cors |
| Database | MySQL / MariaDB (tested with XAMPP's MariaDB 10.4) |

## Setup

You need Node.js 20+ and MySQL (for example XAMPP with MySQL started).

1. **Install**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. **Create the database.** In phpMyAdmin choose *Import* and select `server/schema.sql`, or run:
   ```bash
   mysql -u root < server/schema.sql
   ```
   This creates `dental_clinic_db` with three fictional sample assessments.
3. **Configure `.env`**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
   In `server/.env`, fill in your MySQL login and set `JWT_SECRET` to a long random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
4. **Set a Dentist Panel password** for the sample account (typing is hidden):
   ```bash
   cd server && npm run set-password -- dentist@example.com
   ```
5. **Run** the server and the client in two terminals:
   ```bash
   cd server && npm run dev     # API on http://localhost:3000
   cd client && npm run dev     # app on http://localhost:5173
   ```
   - Patient form: http://localhost:5173/
   - Dentist Panel: http://localhost:5173/dentist (log in with `dentist@example.com`)

## API endpoints

Base URL: `http://localhost:3000/api`. Routes marked 🔒 need the header `Authorization: Bearer <token>`, using the token returned by `POST /auth/login`.

| Method | Path | Purpose | Status codes |
| --- | --- | --- | --- |
| GET | `/assessments` 🔒 | List all assessments, newest first | 200, 401 |
| GET | `/assessments/:id` 🔒 | Get one assessment | 200, 400, 401, 404 |
| POST | `/assessments` | Save a new assessment (patient form) | 201, 400 |
| DELETE | `/assessments/:id` 🔒 | Delete an assessment (and its patient) | 200, 400, 401, 404 |
| PATCH | `/assessments/:id/status` 🔒 | Set status to `New` or `Reviewed` | 200, 400, 401, 404 |
| GET | `/settings` | Clinic name, dentist name, form title | 200 |
| PUT | `/settings` 🔒 | Update the settings | 200, 400, 401 |
| POST | `/auth/login` | Log in, returns `{ token, user }` | 200, 400, 401, 403, 429 |
| GET | `/auth/me` 🔒 | The logged-in user | 200, 401 |

Example body for `POST /assessments` (smallest valid form):

```json
{
  "answers": {
    "lastName": "Cruz", "firstName": "Ana", "dateOfBirth": "2000-01-15", "mobileNumber": "09171234567",
    "consentAccurate": true, "consentInformChanges": true, "consentPrivacy": true
  }
}
```

An invalid body returns `400` with a message and the field, e.g. `{ "error": "Mobile number must be 7 to 15 digits.", "field": "mobileNumber" }`.

## Screenshots

| Patient form with validation | Dentist dashboard |
| --- | --- |
| ![Patient form](docs/screenshots/patient-form.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Assessment details | Assessments list | Phone layout |
| --- | --- | --- |
| ![Assessment details](docs/screenshots/assessment-detail.png) | ![Assessments list](docs/screenshots/assessments.png) | ![Phone layout](docs/screenshots/assessments-phone.png) |

## Project structure

```
client/                     React + TypeScript (Vite)
  src/api/axios.ts          the shared Axios instance (baseURL, token and 401 interceptors)
  src/api/                  one file per resource: assessments, settings, auth
  src/context/              login state shared with useContext (AuthProvider, useAuth)
  src/hooks/useLoad.ts      custom hook: loading / data / error for a page
  src/components/           patient form (Questionnaire, QuestionField, AnswerSummary, ...)
  src/dentist/              Dentist Panel pages
  src/data/questions.ts     every question, its type, and when it is shown
  src/utils/                validation, branching, dates, navigation
server/                     Express API
  app.js                    middleware order and routes
  controllers/              named route handlers
  middleware/               logger, requireAuth, error handler
  validation.js             server-side checks for a submitted form
  db.js, config.js          connection pool and .env settings
  schema.sql                database, tables and sample data
  scripts/set-password.js   sets a Dentist Panel password
```

## Bonus features

- **Update records:** `PATCH /assessments/:id/status` and `PUT /settings` run `UPDATE` queries.
- **JWT login, protected routes and Axios interceptors:** the Dentist Panel routes need a token; the request interceptor attaches it and the response interceptor returns to the login screen on `401`. Passwords are stored as bcrypt hashes, and five wrong passwords lock an email for 15 minutes.
- **useContext:** the logged-in user is shared through `AuthContext` (`src/context/`).

## Known issues

- Dentist Panel endpoints need a login token. To test them in Thunder Client, call `POST /api/auth/login` first and add the returned token as a Bearer token.
- A login token stays valid for 12 hours, even after logging out or changing the password (JWTs are not stored on the server).
- The failed-login lockout is kept in memory, so restarting the server clears it.
- There is no page for creating Dentist Panel accounts: add a row to `user_profiles` (role `dentist`, `staff` or `admin`) and run `npm run set-password`.
- Each submission creates a new patient row, so a returning patient appears more than once.

## Use of AI tools

This project was built with help from Claude (Anthropic), an AI assistant. It was used to restructure the code into `client/` and `server/`, convert the frontend to TypeScript, add Axios, JWT login and server-side validation, write `schema.sql`, and draft this README. The changes were tested end to end against the database.
