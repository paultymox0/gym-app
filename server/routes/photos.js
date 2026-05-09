const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/photos/:userId - List photos (metadata only)
router.get('/:userId', (req, res) => {
  const photos = db.prepare(
    'SELECT id, date, notes FROM progress_photos WHERE user_id = ? ORDER BY date DESC'
  ).all(parseInt(req.params.userId));
  res.json({ photos });
});

// GET /api/photos/:userId/:id/data - Get photo binary data
router.get('/:userId/:id/data', (req, res) => {
  const photo = db.prepare(
    'SELECT photo_data, date FROM progress_photos WHERE id = ? AND user_id = ?'
  ).get(parseInt(req.params.id), parseInt(req.params.userId));
  if (!photo) return res.status(404).json({ error: 'Not found' });
  res.json({ photo_data: photo.photo_data, date: photo.date });
});

// POST /api/photos - Upload photo
router.post('/', (req, res) => {
  const { user_id, photo_data, notes } = req.body;
  if (!user_id || !photo_data) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const date = new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO progress_photos (user_id, date, photo_data, notes) VALUES (?, ?, ?, ?)'
  ).run(parseInt(user_id), date, photo_data, notes || '');
  res.status(201).json({ id: result.lastInsertRowid, date });
});

// DELETE /api/photos/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM progress_photos WHERE id = ?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
