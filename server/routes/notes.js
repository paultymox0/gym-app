const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/notes/:userId?search=&tag=
router.get('/:userId', (req, res) => {
  const { search, tag } = req.query;
  let query = 'SELECT * FROM notes WHERE user_id = ?';
  const params = [req.params.userId];

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (tag) {
    query += ' AND ("," || tags || "," LIKE ?)';
    params.push(`%,${tag},%`);
  }
  query += ' ORDER BY updated_at DESC';

  res.json(db.prepare(query).all(...params));
});

// POST /api/notes
router.post('/', (req, res) => {
  const { user_id, title, content, tags } = req.body;
  const result = db.prepare(
    'INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)'
  ).run(user_id, title, content || '', tags || '');
  res.status(201).json(db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid));
});

// PATCH /api/notes/:id
router.patch('/:id', (req, res) => {
  const { title, content, tags } = req.body;
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Not found' });

  db.prepare(`UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = datetime('now') WHERE id = ?`).run(
    title !== undefined ? title : note.title,
    content !== undefined ? content : note.content,
    tags !== undefined ? tags : note.tags,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id));
});

// DELETE /api/notes/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
