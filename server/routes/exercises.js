const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/exercises/history/:userId/:exerciseName
router.get('/history/:userId/:exerciseName', (req, res) => {
  const { userId, exerciseName } = req.params;

  const history = db.prepare(`
    SELECT sl.*, s.date, s.day_type
    FROM set_logs sl
    JOIN sessions s ON sl.session_id = s.id
    WHERE s.user_id = ? AND sl.exercise_name = ?
    ORDER BY s.date DESC, sl.set_number ASC
    LIMIT 100
  `).all(parseInt(userId), exerciseName);

  // Group by date
  const grouped = {};
  history.forEach(row => {
    if (!grouped[row.date]) {
      grouped[row.date] = { date: row.date, sets: [] };
    }
    grouped[row.date].sets.push(row);
  });

  res.json({ history: Object.values(grouped) });
});

// GET /api/exercises/list/:userId - All distinct exercises the user has logged
router.get('/list/:userId', (req, res) => {
  const { userId } = req.params;

  const exercises = db.prepare(`
    SELECT sl.exercise_name, COUNT(DISTINCT s.id) as session_count, MAX(s.date) as last_date
    FROM set_logs sl
    JOIN sessions s ON sl.session_id = s.id
    WHERE s.user_id = ? AND sl.completed = 1
    GROUP BY sl.exercise_name
    ORDER BY sl.exercise_name ASC
  `).all(parseInt(userId));

  res.json({ exercises });
});

// GET /api/exercises/pr/:userId - Personal records
router.get('/pr/:userId', (req, res) => {
  const { userId } = req.params;

  const prs = db.prepare(`
    SELECT sl.exercise_name, MAX(sl.weight) as max_weight, sl.reps
    FROM set_logs sl
    JOIN sessions s ON sl.session_id = s.id
    WHERE s.user_id = ? AND sl.completed = 1 AND sl.weight > 0
    GROUP BY sl.exercise_name
    ORDER BY sl.exercise_name
  `).all(parseInt(userId));

  res.json({ prs });
});

// GET /api/exercises/volume/:userId - Training volume over time
router.get('/volume/:userId', (req, res) => {
  const { userId } = req.params;
  const days = req.query.days || 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(days));
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const volume = db.prepare(`
    SELECT s.date, s.day_type, SUM(sl.weight * sl.reps) as total_volume, COUNT(sl.id) as total_sets
    FROM sessions s
    JOIN set_logs sl ON sl.session_id = s.id
    WHERE s.user_id = ? AND s.date >= ? AND sl.completed = 1
    GROUP BY s.date
    ORDER BY s.date ASC
  `).all(parseInt(userId), cutoffStr);

  res.json({ volume });
});

module.exports = router;
