# Dental Assessment Form

A full-stack health check questionnaire for a dental clinic. Patients fill in a multi-step form before their visit; the answers are validated, saved in MySQL, and reviewed by the clinic in a password-protected Dentist Panel.

- **Patient form** (`/`): 10 sections with follow-up questions that appear only when relevant (e.g. toothache details), a review screen, and a confirmation after sending.
- **Dentist Panel** (`/dentist`): log in, see a dashboard and the list of submitted assessments, open one, mark it reviewed, delete it, and edit the clinic settings shown on the patient form.

## Contents

1. [Tech stack](#tech-stack)
2. [Setting up on a new computer](#setting-up-on-a-new-computer)
3. [Everyday use](#everyday-use)
4. [Troubleshooting](#troubleshooting)
5. [API endpoints](#api-endpoints)
6. [Testing the API with Thunder Client](#testing-the-api-with-thunder-client)
7. [Screenshots](#screenshots)
8. [Project structure](#project-structure)
9. [Bonus features](#bonus-features)
10. [Known issues](#known-issues)
11. [Use of AI tools](#use-of-ai-tools)

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend (`client/`) | React 19, TypeScript, Vite, Axios |
| Backend (`server/`) | Node.js, Express 5, mysql2/promise, bcryptjs, jsonwebtoken, dotenv, cors |
| Database | MySQL / MariaDB (tested with XAMPP's MariaDB 10.4) |

## Setting up on a new computer

These steps assume Windows and the VS Code terminal (PowerShell). Mac and Linux commands are given where they differ. The whole setup takes about 15 minutes.

### Step 0: Install the tools

| Tool | Why | Download |
| --- | --- | --- |
| **Node.js 22 LTS** (or 20.19+) | Runs the server and the React dev server | https://nodejs.org (choose "LTS") |
| **XAMPP** | Provides MySQL and phpMyAdmin | https://www.apachefriends.org |
| **Git** | Downloads the project | https://git-scm.com |
| **VS Code** | Editor and terminal | https://code.visualstudio.com |
| **Thunder Client** (VS Code extension) | Tests the API (optional) | VS Code → Extensions → search "Thunder Client" |

When installing XAMPP you only need the **MySQL** and **phpMyAdmin** components (Apache is needed only to open phpMyAdmin).

Check that Node.js and Git are installed. Open a new terminal (in VS Code: **Terminal → New Terminal**) and run:

```powershell
node -v    # should print v22.x.x (or v20.19 or newer)
npm -v     # should print a version number
git --version
```

If a command is "not recognized", restart VS Code (or the computer) after installing, so the terminal picks up the new program.

### Step 1: Get the code

In the terminal, go to the folder where you keep projects and clone the repository:

```powershell
cd $HOME\Documents
git clone https://github.com/Kwacklet/dental-clinic-form.git
cd dental-clinic-form
code .
```

`code .` opens the project in VS Code. The folder must contain `client`, `server`, `docs` and this `README.md`. (No Git? On GitHub, click **Code → Download ZIP**, extract it, and open the extracted folder in VS Code with **File → Open Folder**.)

All commands below are run in VS Code's terminal, starting from this project folder.

### Step 2: Install the dependencies

The server and the client each have their own libraries. Install both:

```powershell
cd server
npm install
cd ..\client
npm install
cd ..
```

(On Mac/Linux use `cd ../client`.) Each `npm install` creates a `node_modules` folder and should end with `found 0 vulnerabilities` or a short summary. Warnings are fine; lines starting with `npm ERR!` are not (see [Troubleshooting](#troubleshooting)).

### Step 3: Start MySQL

1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL**. The module name turns green and shows a port, normally **3306**.
3. Click **Start** next to **Apache** too, if you want to use phpMyAdmin in the next step.

### Step 4: Create the database

`server/schema.sql` creates the `dental_clinic_db` database, its four tables, and three fictional sample assessments. Use **one** of the two options.

**Option A: phpMyAdmin**

1. Open http://localhost/phpmyadmin in your browser.
2. Do **not** click on any database in the left panel. Stay on the home page (click the phpMyAdmin logo if needed), because the file creates the database itself.
3. Click the **Import** tab at the top.
4. Under **File to import**, click **Choose File** and select `server/schema.sql` from the project folder.
5. Scroll down and click **Import** (or **Go**).
6. You should see "Import has been successfully finished". In the left panel, `dental_clinic_db` appears with 4 tables: `clinic_settings`, `dental_assessments`, `patients`, `user_profiles`.

**Option B: command line** (no Apache needed). From the project folder:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "source server/schema.sql"
```

If your MySQL `root` user has a password, add `-p` after `root` and type the password when asked. On Mac/Linux, use `mysql` instead of the full path.

Check the result:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root -e "SHOW TABLES FROM dental_clinic_db"
```

It should list the 4 tables.

> **"Table already exists" error?** The database was created before. To start over, delete it first (this erases all its data): `C:\xampp\mysql\bin\mysql.exe -u root -e "DROP DATABASE dental_clinic_db"`, then import again.

### Step 5: Create the `.env` files

The `.env` files hold settings and secrets. They are not in the repository; each computer makes its own from the `.env.example` templates.

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

(Mac/Linux: `cp server/.env.example server/.env` and `cp client/.env.example client/.env`.)

Now create a secret key for logins:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the long line it prints. Open `server/.env` in VS Code and paste it after `JWT_SECRET=`. The file should look like this (your secret will be different):

```ini
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dental_clinic_db
JWT_SECRET=3f9a1c...a very long random string...7b2e
```

| Variable | Meaning | Change it when |
| --- | --- | --- |
| `PORT` | Port the API runs on | Port 3000 is used by another program |
| `CORS_ORIGIN` | Address of the React app that may call the API | The app runs on another port (separate several with commas) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL login and database | Your MySQL `root` has a password, or you use another user or database name |
| `JWT_SECRET` | Key used to sign login tokens | Never share it; every computer should have its own |

`client/.env` contains one line and normally needs no change:

```ini
VITE_API_URL=http://localhost:3000/api
```

If you changed `PORT` in `server/.env`, change `3000` here too.

Save both files. **Never commit `.env` files**; `.gitignore` already excludes them.

### Step 6: Create a Dentist Panel login

The sample data includes an account `dentist@example.com` without a password. Give it one:

```powershell
cd server
npm run set-password -- dentist@example.com
cd ..
```

Type a password (at least 8 characters; nothing appears on screen while you type, that is normal), press Enter, type it again, and press Enter. You should see `Password saved.`

**Your own account instead:** in phpMyAdmin open `dental_clinic_db` → **SQL** tab, and run (with your own details):

```sql
INSERT INTO user_profiles (first_name, last_name, email, role, status)
VALUES ('Juan', 'Dela Cruz', 'you@example.com', 'dentist', 'active');
```

Then run `npm run set-password -- you@example.com` in the `server` folder as above. Roles `dentist`, `staff` and `admin` can log in. Use the same command later to reset a forgotten password.

### Step 7: Start the server (API)

```powershell
cd server
npm run dev
```

Wait for both lines:

```
API running on http://localhost:3000
Connected to MySQL database: dental_clinic_db
```

Leave this terminal open; it shows a line for every request (e.g. `POST /api/assessments 201 34ms`). To check it in the browser, open http://localhost:3000/api/settings; you should see the clinic name as JSON.

### Step 8: Start the client (React app)

Open a **second** terminal (the **+** button in VS Code's terminal panel) and run:

```powershell
cd client
npm run dev
```

Wait for `Local: http://localhost:5173/`. Leave this terminal open too.

### Step 9: Check that everything works

Open http://localhost:5173 and go through this list:

1. **Patient form loads** with the title "Dental Assessment Form" and "Section 1 of 10".
2. Click **Next** without filling anything in: red error messages appear under the required fields.
3. Fill in Last Name, First Name, Date of Birth and Mobile Number; Age fills in by itself. Click **Next** through the sections, tick the three consent boxes, click **Review answers**, then **Send to clinic**. A green "Thank you" message appears.
4. Open http://localhost:5173/dentist and log in with the account from Step 6. The dashboard shows the sample assessments and the one you just sent.
5. Open your assessment, click **Mark as reviewed**, then go back and **Delete** it. It disappears from the list.
6. Stop the server (`Ctrl+C` in its terminal), start it again with `npm run dev`, and refresh the page: the data is still there.

If all six work, the setup is complete.

## Everyday use

1. XAMPP Control Panel → **Start** MySQL.
2. Terminal 1: `cd server` → `npm run dev`
3. Terminal 2: `cd client` → `npm run dev`
4. Open http://localhost:5173 (patient form) or http://localhost:5173/dentist (Dentist Panel).

To stop: press `Ctrl+C` in both terminals, then **Stop** MySQL in XAMPP.

## Troubleshooting

| What you see | Cause | Fix |
| --- | --- | --- |
| `Database connection error: MySQL is not running` | MySQL is stopped | Start MySQL in XAMPP, then restart the server |
| `Database connection error: Access denied for user 'root'` | Wrong MySQL password | Set `DB_PASSWORD` in `server/.env` |
| `Database connection error: Unknown database 'dental_clinic_db'` | Database not created | Do Step 4 |
| `JWT_SECRET is missing` when starting the server | No `server/.env`, or the secret is empty | Do Step 5 |
| `Error: listen EADDRINUSE ... :3000` | The server is already running in another terminal | Close the other terminal, or press `Ctrl+C` in it |
| Vite starts on **5174** instead of 5173 | The client is already running elsewhere | Close the other one; the API only accepts 5173 (`CORS_ORIGIN`) |
| Page says "Could not reach the server" | The server is not running | Do Step 7 |
| Browser console shows a **CORS** error | The app's address is not in `CORS_ORIGIN` | Use http://localhost:5173, or add the address to `CORS_ORIGIN` and restart the server |
| "Incorrect email or password" for the right password | No password set yet, or a typo in the email | Run `npm run set-password -- your@email.com` again |
| "Too many failed attempts" | 5 wrong passwords for that email | Wait 15 minutes, or restart the server |
| `'node' is not recognized` / `'npm' is not recognized` | Node.js not installed, or terminal opened before installing | Install Node.js, then restart VS Code |
| XAMPP MySQL turns red or stops at once | Port 3306 used by another MySQL | Stop the other MySQL service, or check XAMPP's log panel |
| `npm ERR!` during `npm install` | Network problem or old Node.js | Check `node -v`, then run `npm install` again |

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

An invalid request returns `400` with a message and the field, e.g. `{ "error": "Mobile number must be 7 to 15 digits.", "field": "mobileNumber" }`.

## Testing the API with Thunder Client

Thunder Client sends requests straight to the API, without the React app. This tutorial checks every endpoint, every status code, and the server-side validation. Before starting, MySQL and the server must be running (Steps 3 and 7), and you need a Dentist Panel login (Step 6).

### 1. Install and open Thunder Client

1. In VS Code, open **Extensions** (`Ctrl+Shift+X`), search **Thunder Client**, click **Install**.
2. Click the lightning-bolt icon in the left sidebar. You will see **New Request**, and the tabs **Activity**, **Collections** and **Env**.

### 2. Create an environment for the login token

1. Click **Env** → the menu (☰) or **+** → **New Environment**, name it `Dental local`.
2. Add one variable named `token` (leave the value empty for now) and click **Save**.
3. Make it the active environment (star icon or "Set Active").

You can now write `{{token}}` instead of pasting the long login token into every request. All URLs below are complete, so you can copy and paste them as they are.

### 3. Create a collection

Click **Collections** → **New Collection** and name it `Dental API`. Save every request below into it (**Save** button next to **Send**), so you can rerun them in one click during a demo.

### 4. Log in and save the token

Create a request:

- Method **POST**, URL `http://localhost:3000/api/auth/login`
- **Body** tab → **JSON**:
  ```json
  { "email": "dentist@example.com", "password": "the password from Step 6" }
  ```
- **Send**. Expected: **200 OK** and a response like `{ "token": "eyJhbGciOi...", "user": { ... } }`.

**Save the token automatically:** open this request's **Tests** tab, add a row, choose **Set Env Variable**, type `json.token` in the first box and `{{token}}` in the second, then send again. The token is now stored in the environment.

**Or save it by hand:** copy the token text (between the quotes, without the quotes), open **Env** → `Dental local`, paste it as the value of `token`, and **Save**.

For every request marked 🔒 below, open its **Auth** tab → **Bearer** and type `{{token}}` (or paste the token itself). Tip: set this once on the collection (**Dental API** → ⋯ → **Settings** → **Auth** → Bearer `{{token}}`) and choose **Inherit** in each request's Auth tab. A token lasts 12 hours; after that, send the login request again.

### 5. Normal requests (happy path)

Send these in order. The server terminal logs each one.

| # | Request | Body (JSON) | Expected |
| --- | --- | --- | --- |
| H1 | GET `http://localhost:3000/api/settings` | none | **200**, clinic name, dentist name, form title |
| H2 | GET `http://localhost:3000/api/assessments` 🔒 | none | **200**, a list of assessments |
| H3 | POST `http://localhost:3000/api/assessments` | the valid body below | **201**, e.g. `{ "id": 4, "patientId": 4, "message": "Assessment saved." }` (your numbers may differ) |
| H4 | GET `http://localhost:3000/api/assessments/ID` 🔒 | none | **200**, the record you just created |
| H5 | PATCH `http://localhost:3000/api/assessments/ID/status` 🔒 | `{ "status": "Reviewed" }` | **200**, `{ "id": ..., "status": "Reviewed" }` |
| H6 | DELETE `http://localhost:3000/api/assessments/ID` 🔒 | none | **200**, `{ "id": ..., "message": "Assessment deleted." }` |
| H7 | GET `http://localhost:3000/api/auth/me` 🔒 | none | **200**, the logged-in user |

Replace `ID` with the `id` returned by H3, so you only change your own test record. Open the Dentist Panel after H3 and after H6 to see the record appear and disappear.

**Valid body** (the smallest form the server accepts) for H3:

```json
{
  "answers": {
    "lastName": "Cruz",
    "firstName": "Ana",
    "dateOfBirth": "2000-01-15",
    "mobileNumber": "09171234567",
    "consentAccurate": true,
    "consentInformChanges": true,
    "consentPrivacy": true
  }
}
```

### 6. Validation tests (400 Bad Request)

Each test sends invalid data to `POST http://localhost:3000/api/assessments`. Start from the valid body above and change **only** what the table says. Every one must return **400** with the message shown, and **nothing is saved** (check with H2 that the list did not grow).

| # | What to change in the valid body | Expected message (`error`) | `field` |
| --- | --- | --- | --- |
| V1 | Send `{}` as the whole body | `The request must include an "answers" object.` | `answers` |
| V2 | Send only `{ "answers": { "lastName": "Cruz" } }` | `First name is required.` | `firstName` |
| V3 | `"lastName": "Cruz123"` | `Last name can only use letters, spaces, hyphens and apostrophes.` | `lastName` |
| V4 | `"dateOfBirth": "2999-01-01"` (future) | `Date of birth must be a real date (YYYY-MM-DD), not in the future.` | `dateOfBirth` |
| V5 | `"dateOfBirth": "2000-02-30"` (no such day) | same as V4 | `dateOfBirth` |
| V6 | `"mobileNumber": "12345"` | `Mobile number must be 7 to 15 digits.` | `mobileNumber` |
| V7 | add `"email": "not-an-email"` | `Email address is not valid.` | `email` |
| V8 | add `"sex": "Unknown"` | `sex must be one of: Male, Female, Prefer not to say, Other.` | `sex` |
| V9 | add `"anxietyLevel": 15` | `anxietyLevel must be a whole number from 0 to 10.` | `anxietyLevel` |
| V10 | remove `"consentPrivacy": true` | `All three consent boxes must be ticked.` | `consentPrivacy` |
| V11 | Type broken JSON, e.g. `{ "answers": ` | `The request body is not valid JSON.` | (none) |

Other 400 responses:

| # | Request | Body | Expected message |
| --- | --- | --- | --- |
| V12 | PATCH `http://localhost:3000/api/assessments/1/status` 🔒 | `{ "status": "Done" }` | `Status must be "New" or "Reviewed".` |
| V13 | GET `http://localhost:3000/api/assessments/abc` 🔒 | none | `The id must be a positive whole number.` |
| V14 | PUT `http://localhost:3000/api/settings` 🔒 | `{}` | `All settings fields are required.` |
| V15 | POST `http://localhost:3000/api/auth/login` | `{}` | `Email and password are required.` |

### 7. Not found (404)

| # | Request | Expected |
| --- | --- | --- |
| N1 | GET `http://localhost:3000/api/assessments/99999` 🔒 | **404** `Assessment 99999 was not found.` |
| N2 | DELETE the record from H6 again 🔒 | **404** `Assessment ID was not found.` |
| N3 | PATCH `http://localhost:3000/api/assessments/99999/status` 🔒 with `{ "status": "New" }` | **404** |
| N4 | GET `http://localhost:3000/api/nothing` | **404** `No route for GET /api/nothing.` |

### 8. Login and protection (401, 429)

| # | Request | Expected |
| --- | --- | --- |
| P1 | GET `http://localhost:3000/api/assessments` with **Auth → None** | **401** `Please log in.` |
| P2 | Same, with Bearer token `abc.def.ghi` | **401** `Your session has ended. Please log in again.` |
| P3 | POST `http://localhost:3000/api/auth/login` with a wrong password | **401** `Incorrect email or password.` |
| P4 | POST `http://localhost:3000/api/auth/login` with `{ "email": "test@example.com", "password": "x" }`, sent 6 times | first 5: **401**; 6th: **429** `Too many failed attempts. Try again in 15 minutes.` |

Use a made-up email for P4, because the lockout blocks that email for 15 minutes (restarting the server clears it).

### 9. Data survives a restart

1. Send H3 to create a record and note its `id`.
2. Stop the server (`Ctrl+C`) and start it again (`npm run dev`).
3. Send H4 with that `id`: **200**, the record is still there. Delete it with H6 when you are done.

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

- Dentist Panel endpoints need a login token. To test them in Thunder Client, call `POST /api/auth/login` first and add the returned token as a Bearer token (see [the tutorial](#4-log-in-and-save-the-token)).
- A login token stays valid for 12 hours, even after logging out or changing the password (JWTs are not stored on the server).
- The failed-login lockout is kept in memory, so restarting the server clears it.
- There is no page for creating Dentist Panel accounts: add a row to `user_profiles` (role `dentist`, `staff` or `admin`) and run `npm run set-password`.
- Each submission creates a new patient row, so a returning patient appears more than once.

## Use of AI tools

This project was built with help from Claude (Anthropic), an AI assistant. It was used to restructure the code into `client/` and `server/`, convert the frontend to TypeScript, add Axios, JWT login and server-side validation, write `schema.sql`, and draft this README. The changes were tested end to end against the database.
