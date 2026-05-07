const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/bodyweight/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit || 90;

  const entries = db.prepare(
    'SELECT * FROM body_weight WHERE user_id = ? ORDER BY date DESC LIMIT ?'
  ).all(parseInt(userId), parseInt(limit));

  res.json({ entries: entries.reverse() });
});

// POST /api/bodyweight
router.post('/', (req, res) => {
  const { user_id, date, weight } = req.body;

  if (!user_id || !date || weight === undefined) {
    return res.status(400).json({ error: 'user_id, date, and weight are required' });
  }

  // Check if entry exists for this date
  const existing = db.prepare(
    'SELECT * FROM body_weight WHERE user_id = ? AND date = ?'
  ).get(user_id, date);

  if (existing) {
    db.prepare('UPDATE body_weight SET weight = ? WHERE id = ?').run(weight, existing.id);
    const updated = db.prepare('SELECT * FROM body_weight WHERE id = ?').get(existing.id);
    return res.json({ entry: updated });
  }

  const result = db.prepare(
    'INSERT INTO body_weight (user_id, date, weight) VALUES (?, ?, ?)'
  ).run(user_id, date, weight);

  const entry = db.prepare('SELECT * FROM body_weight WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ entry });
});

// DELETE /api/bodyweight/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM body_weight WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

module.exports = router;
