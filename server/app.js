import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db.js';
import { logger } from './middleware/logger.js';
import { requireAuth } from './middleware/requireAuth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { getCurrentUser, login } from './controllers/authController.js';
import { getSettings, updateSettings } from './controllers/settingsController.js';
import {
  createAssessment,
  deleteAssessment,
  getAssessment,
  listAssessments,
  updateAssessmentStatus
} from './controllers/assessmentController.js';

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());
app.use(logger);

app.post('/api/auth/login', login);
app.get('/api/auth/me', requireAuth, getCurrentUser);

app.get('/api/settings', getSettings);
app.post('/api/assessments', createAssessment);

app.put('/api/settings', requireAuth, updateSettings);
app.get('/api/assessments', requireAuth, listAssessments);
app.get('/api/assessments/:id', requireAuth, getAssessment);
app.patch('/api/assessments/:id/status', requireAuth, updateAssessmentStatus);
app.delete('/api/assessments/:id', requireAuth, deleteAssessment);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
  pool.query('SELECT 1')
    .then(() => console.log(`Connected to MySQL database: ${config.db.database}`))
    .catch((error) => console.error('Database connection error:', error.message));
});
