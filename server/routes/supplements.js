const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/supplements/definitions/:userId
router.get('/definitions/:userId', (req, res) => {
  const uid = parseInt(req.params.userId);
  const defs = db.prepare(
    'SELECT * FROM supplement_definitions WHERE user_id = ? ORDER BY sort_order, id'
  ).all(uid);
  res.json({ definitions: defs });
});

// POST /api/supplements/definitions
router.post('/definitions', (req, res) => {
  const { user_id, name, time } = req.body;
  const uid = parseInt(user_id);

  const count = db.prepare(
    'SELECT COUNT(*) as c FROM supplement_definitions WHERE user_id = ?'
  ).get(uid);
  if (count.c >= 10) {
    return res.status(400).json({ error: 'Máximo 10 suplementos permitidos' });
  }

  const maxOrder = db.prepare(
    'SELECT MAX(sort_order) as m FROM supplement_definitions WHERE user_id = ?'
  ).get(uid);

  const result = db.prepare(
    'INSERT INTO supplement_definitions (user_id, name, time, sort_order) VALUES (?, ?, ?, ?)'
  ).run(uid, name.trim(), time || 'morning', (maxOrder.m || 0) + 1);

  const def = db.prepare('SELECT * FROM supplement_definitions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ definition: def });
});

// PUT /api/supplements/definitions/:id
router.put('/definitions/:id', (req, res) => {
  const { name, time } = req.body;
  const id = parseInt(req.params.id);
  db.prepare('UPDATE supplement_definitions SET name = ?, time = ? WHERE id = ?').run(name.trim(), time, id);
  const def = db.prepare('SELECT * FROM supplement_definitions WHERE id = ?').get(id);
  res.json({ definition: def });
});

// DELETE /api/supplements/definitions/:id
router.delete('/definitions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM supplement_definitions WHERE id = ?').run(id);
  res.json({ success: true });
});

// GET /api/supplements/:userId/:date
router.get('/:userId/:date', (req, res) => {
  const { userId, date } = req.params;
  const uid = parseInt(userId);

  const defs = db.prepare(
    'SELECT * FROM supplement_definitions WHERE user_id = ? ORDER BY sort_order, id'
  ).all(uid);

  const logs = db.prepare(
    'SELECT * FROM supplements_log WHERE user_id = ? AND date = ?'
  ).all(uid, date);

  const result = defs.map(def => {
    const log = logs.find(l => l.supplement_name === def.name);
    return {
      id: def.id,
      name: def.name,
      time: def.time,
      taken: log ? log.taken === 1 : false,
      log_id: log ? log.id : null
    };
  });

  res.json({ supplements: result });
});

// POST /api/supplements/toggle
router.post('/toggle', (req, res) => {
  const { user_id, date, supplement_name, taken } = req.body;

  const existing = db.prepare(
    'SELECT * FROM supplements_log WHERE user_id = ? AND date = ? AND supplement_name = ?'
  ).get(user_id, date, supplement_name);

  if (existing) {
    db.prepare('UPDATE supplements_log SET taken = ? WHERE id = ?').run(taken ? 1 : 0, existing.id);
    const updated = db.prepare('SELECT * FROM supplements_log WHERE id = ?').get(existing.id);
    return res.json({ supplement: updated });
  }

  const result = db.prepare(
    'INSERT INTO supplements_log (user_id, date, supplement_name, taken) VALUES (?, ?, ?, ?)'
  ).run(user_id, date, supplement_name, taken ? 1 : 0);

  const supplement = db.prepare('SELECT * FROM supplements_log WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ supplement });
});

module.exports = router;
