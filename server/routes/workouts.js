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

  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100)
    return res.status(400).json({ error: 'Nombre de ejercicio inválido' });
  if (sets !== undefined && (isNaN(sets) || sets < 1 || sets > 20))
    return res.status(400).json({ error: 'Series debe ser entre 1 y 20' });
  if (reps !== undefined && String(reps).length > 20)
    return res.status(400).json({ error: 'Repeticiones inválidas' });
  if (rest_seconds !== undefined && (isNaN(rest_seconds) || rest_seconds < 0 || rest_seconds > 600))
    return res.status(400).json({ error: 'Descanso debe ser entre 0 y 600 segundos' });

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
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100)
    return res.status(400).json({ error: 'Nombre de ejercicio inválido' });
  if (sets !== undefined && (isNaN(sets) || sets < 1 || sets > 20))
    return res.status(400).json({ error: 'Series debe ser entre 1 y 20' });
  if (rest_seconds !== undefined && (isNaN(rest_seconds) || rest_seconds < 0 || rest_seconds > 600))
    return res.status(400).json({ error: 'Descanso debe ser entre 0 y 600 segundos' });
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
