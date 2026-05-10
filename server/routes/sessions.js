const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { getDayType, getExercisesForUser } = require('../exercises-data');

// GET /api/sessions/today/:userId
router.get('/today/:userId', (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  // Check existing session first — handles day-type overrides set from Home
  const session = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? AND date = ?'
  ).get(parseInt(userId), today);

  const dayType = session?.day_type || getDayType(today);

  if (!dayType) {
    return res.json({ session: null, dayType: null, exercises: [], isRestDay: true });
  }

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

// GET /api/sessions/:id/summary - Session summary for completion screen
router.get('/:id/summary', (req, res) => {
  const sessionId = parseInt(req.params.id);
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const stats = db.prepare(`
    SELECT
      SUM(CASE WHEN completed = 1 THEN weight * reps ELSE 0 END) as total_volume,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sets
    FROM set_logs WHERE session_id = ?
  `).get(sessionId);

  const prevSession = db.prepare(`
    SELECT * FROM sessions
    WHERE user_id = ? AND day_type = ? AND date < ? AND completed = 1
    ORDER BY date DESC LIMIT 1
  `).get(session.user_id, session.day_type, session.date);

  let prevVolume = 0;
  if (prevSession) {
    const prevStats = db.prepare(`
      SELECT SUM(CASE WHEN completed = 1 THEN weight * reps ELSE 0 END) as total_volume
      FROM set_logs WHERE session_id = ?
    `).get(prevSession.id);
    prevVolume = prevStats?.total_volume || 0;
  }

  res.json({
    totalVolume: stats?.total_volume || 0,
    completedSets: stats?.completed_sets || 0,
    prevSession: prevSession ? { date: prevSession.date, volume: prevVolume } : null
  });
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

// POST /api/sessions/sets/log - Create or update a set log (with PR detection)
router.post('/sets/log', (req, res) => {
  const { session_id, exercise_name, set_number, weight, reps, completed } = req.body;

  // Get the session's user for PR lookup
  const session = db.prepare('SELECT user_id FROM sessions WHERE id = ?').get(session_id);

  // Get previous max weight for this exercise (exclude the set being updated)
  let prevMax = 0;
  if (session && weight > 0 && completed) {
    const prResult = db.prepare(`
      SELECT MAX(sl.weight) as max_weight
      FROM set_logs sl
      JOIN sessions s ON sl.session_id = s.id
      WHERE s.user_id = ? AND sl.exercise_name = ? AND sl.completed = 1
      AND NOT (sl.session_id = ? AND sl.set_number = ?)
    `).get(session.user_id, exercise_name, session_id, set_number);
    prevMax = prResult?.max_weight || 0;
  }

  const existing = db.prepare(
    'SELECT * FROM set_logs WHERE session_id = ? AND exercise_name = ? AND set_number = ?'
  ).get(session_id, exercise_name, set_number);

  let savedSet;
  if (existing) {
    db.prepare(
      'UPDATE set_logs SET weight = ?, reps = ?, completed = ? WHERE id = ?'
    ).run(weight || 0, reps || 0, completed ? 1 : 0, existing.id);
    savedSet = db.prepare('SELECT * FROM set_logs WHERE id = ?').get(existing.id);
  } else {
    const result = db.prepare(
      'INSERT INTO set_logs (session_id, exercise_name, set_number, weight, reps, completed) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(session_id, exercise_name, set_number, weight || 0, reps || 0, completed ? 1 : 0);
    savedSet = db.prepare('SELECT * FROM set_logs WHERE id = ?').get(result.lastInsertRowid);
  }

  const isNewPR = !!(completed && weight > 0 && weight > prevMax);
  res.json({ set: savedSet, isNewPR, prWeight: weight, prExercise: exercise_name });
});

// PUT /api/sessions/sets/:id
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

// GET /api/sessions/calendar/:userId - Sessions for a specific month
router.get('/calendar/:userId', (req, res) => {
  const { userId } = req.params;
  const y = parseInt(req.query.year) || new Date().getFullYear();
  const m = parseInt(req.query.month) || (new Date().getMonth() + 1);
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const sessions = db.prepare(
    'SELECT id, date, day_type, completed, notes FROM sessions WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date'
  ).all(parseInt(userId), startDate, endDate);
  res.json({ sessions });
});

// GET /api/sessions/date/:userId/:date - Full session detail for a specific date
router.get('/date/:userId/:date', (req, res) => {
  const { userId, date } = req.params;
  const session = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? AND date = ?'
  ).get(parseInt(userId), date);
  if (!session) return res.json({ session: null });
  const sets = db.prepare(
    'SELECT * FROM set_logs WHERE session_id = ? ORDER BY exercise_name, set_number'
  ).all(session.id);
  const exercises = getExercisesForUser(session.day_type, parseInt(userId));
  res.json({ session, sets, exercises });
});

module.exports = router;
