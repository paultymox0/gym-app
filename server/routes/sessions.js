const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { getDayType, getExercisesForUser } = require('../exercises-data');

// GET /api/sessions/today/:userId
router.get('/today/:userId', (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const dayType = getDayType(today);

  if (!dayType) {
    return res.json({ session: null, dayType: null, exercises: [], isRestDay: true });
  }

  // Check if session exists for today
  let session = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? AND date = ?'
  ).get(parseInt(userId), today);

  const exercises = getExercisesForUser(dayType, parseInt(userId));

  if (session) {
    const sets = db.prepare(
      'SELECT * FROM set_logs WHERE session_id = ? ORDER BY exercise_name, set_number'
    ).all(session.id);
    return res.json({ session, sets, dayType, exercises, isRestDay: false });
  }

  res.json({ session: null, dayType, exercises, isRestDay: false });
});

// POST /api/sessions - Create new session
router.post('/', (req, res) => {
  const { user_id, date, day_type, notes } = req.body;

  // Check if session already exists
  const existing = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? AND date = ?'
  ).get(user_id, date);

  if (existing) {
    const sets = db.prepare(
      'SELECT * FROM set_logs WHERE session_id = ? ORDER BY exercise_name, set_number'
    ).all(existing.id);
    return res.json({ session: existing, sets });
  }

  const result = db.prepare(
    'INSERT INTO sessions (user_id, date, day_type, completed, notes) VALUES (?, ?, ?, 0, ?)'
  ).run(user_id, date, day_type, notes || '');

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ session, sets: [] });
});

// GET /api/sessions/:id
router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(parseInt(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const sets = db.prepare(
    'SELECT * FROM set_logs WHERE session_id = ? ORDER BY exercise_name, set_number'
  ).all(session.id);

  const exercises = getExercisesForUser(session.day_type, session.user_id);

  res.json({ session, sets, exercises });
});

// PUT /api/sessions/:id
router.put('/:id', (req, res) => {
  const { completed, notes } = req.body;
  db.prepare(
    'UPDATE sessions SET completed = ?, notes = ? WHERE id = ?'
  ).run(completed ? 1 : 0, notes || '', parseInt(req.params.id));

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(parseInt(req.params.id));
  res.json({ session });
});

// POST /api/sets - Create or update a set log
router.post('/sets/log', (req, res) => {
  const { session_id, exercise_name, set_number, weight, reps, completed } = req.body;

  const existing = db.prepare(
    'SELECT * FROM set_logs WHERE session_id = ? AND exercise_name = ? AND set_number = ?'
  ).get(session_id, exercise_name, set_number);

  if (existing) {
    db.prepare(
      'UPDATE set_logs SET weight = ?, reps = ?, completed = ? WHERE id = ?'
    ).run(weight || 0, reps || 0, completed ? 1 : 0, existing.id);

    const updated = db.prepare('SELECT * FROM set_logs WHERE id = ?').get(existing.id);
    return res.json({ set: updated });
  }

  const result = db.prepare(
    'INSERT INTO set_logs (session_id, exercise_name, set_number, weight, reps, completed) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(session_id, exercise_name, set_number, weight || 0, reps || 0, completed ? 1 : 0);

  const set = db.prepare('SELECT * FROM set_logs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ set });
});

// PUT /api/sets/:id
router.put('/sets/:id', (req, res) => {
  const { weight, reps, completed } = req.body;
  db.prepare(
    'UPDATE set_logs SET weight = ?, reps = ?, completed = ? WHERE id = ?'
  ).run(weight || 0, reps || 0, completed ? 1 : 0, parseInt(req.params.id));

  const set = db.prepare('SELECT * FROM set_logs WHERE id = ?').get(parseInt(req.params.id));
  res.json({ set });
});

// GET /api/sessions/history/:userId - Get recent sessions
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit || 20;

  const sessions = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC LIMIT ?'
  ).all(parseInt(userId), parseInt(limit));

  res.json({ sessions });
});

module.exports = router;
