const express = require('express');
const router = express.Router();
const db = require('../db/database');

function rowToExercise(r) {
  return {
    id: r.id,
    name: r.name,
    sets: r.sets,
    reps: r.reps,
    rest: r.rest_seconds,
    notes: r.notes || '',
    isTime: r.is_time === 1,
    sort_order: r.sort_order,
  };
}

// GET /api/workouts/:userId/:dayKey — list exercises for a day
router.get('/:userId/:dayKey', (req, res) => {
  const { userId, dayKey } = req.params;
  const rows = db.prepare(
    'SELECT * FROM workout_exercises WHERE user_id = ? AND day_key = ? ORDER BY sort_order, id'
  ).all(parseInt(userId), dayKey);
  res.json(rows.map(rowToExercise));
});

// POST /api/workouts/:userId/:dayKey/exercise — add exercise
router.post('/:userId/:dayKey/exercise', (req, res) => {
  const { userId, dayKey } = req.params;
  const { name, sets, reps, rest_seconds, notes, is_time } = req.body;

  const maxOrder = db.prepare(
    'SELECT MAX(sort_order) as m FROM workout_exercises WHERE user_id = ? AND day_key = ?'
  ).get(parseInt(userId), dayKey);

  const result = db.prepare(`
    INSERT INTO workout_exercises (user_id, day_key, name, sets, reps, rest_seconds, notes, is_time, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(parseInt(userId), dayKey, name, sets || 3, reps || '10', rest_seconds || 90, notes || '', is_time ? 1 : 0, (maxOrder?.m || 0) + 1);

  const row = db.prepare('SELECT * FROM workout_exercises WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToExercise(row));
});

// PUT /api/workouts/exercise/:id — update exercise
router.put('/exercise/:id', (req, res) => {
  const { name, sets, reps, rest_seconds, notes, is_time } = req.body;
  db.prepare(`
    UPDATE workout_exercises SET name = ?, sets = ?, reps = ?, rest_seconds = ?, notes = ?, is_time = ?
    WHERE id = ?
  `).run(name, sets, reps, rest_seconds, notes || '', is_time ? 1 : 0, parseInt(req.params.id));

  const row = db.prepare('SELECT * FROM workout_exercises WHERE id = ?').get(parseInt(req.params.id));
  res.json(rowToExercise(row));
});

// DELETE /api/workouts/exercise/:id — delete exercise
router.delete('/exercise/:id', (req, res) => {
  db.prepare('DELETE FROM workout_exercises WHERE id = ?').run(parseInt(req.params.id));
  res.json({ success: true });
});

module.exports = router;
