const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize DB and schema
const { initializeSchema } = require('./db/schema');
initializeSchema();

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Middleware
if (!IS_PROD) {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
    credentials: true
  }));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const exerciseRoutes = require('./routes/exercises');
const nutritionRoutes = require('./routes/nutrition');
const bodyweightRoutes = require('./routes/bodyweight');
const supplementRoutes = require('./routes/supplements');
const cycleRoutes = require('./routes/cycle');
const exportRoutes = require('./routes/export');
const statsRoutes = require('./routes/stats');
const photosRoutes = require('./routes/photos');
const tasksRoutes = require('./routes/tasks');
const projectsRoutes = require('./routes/projects');
const habitsRoutes = require('./routes/habits');
const notesRoutes = require('./routes/notes');

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/bodyweight', bodyweightRoutes);
app.use('/api/supplements', supplementRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/notes', notesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React client in production
if (IS_PROD) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  // Static assets (JS/CSS) get long cache — they're content-hashed by Vite
  app.use(express.static(clientDist, { maxAge: '1y', immutable: true }));
  // HTML must never be cached so the browser always gets the latest bundle hashes
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${IS_PROD ? 'production' : 'development'}]`);
});

module.exports = app;
