const express = require('express');
const router = express.Router();
const db = require('../db/database');

const SUPPLEMENTS = {
  1: [ // Timmy
    { name: 'Vitamina D3 2000UI', time: 'morning' },
    { name: 'Creatina 5g', time: 'post-workout' },
    { name: 'Omega-3 2g', time: 'lunch' }
  ],
  2: [ // Andrea
    { name: 'Vitamina D3 2000UI', time: 'morning' },
    { name: 'Magnesio 250mg', time: 'before-sleep' },
    { name: 'Omega-3 2g', time: 'lunch' }
  ]
};

// GET /api/supplements/:userId/:date
router.get('/:userId/:date', (req, res) => {
  const { userId, date } = req.params;
  const uid = parseInt(userId);

  const userSupplements = SUPPLEMENTS[uid] || [];

  // Get existing logs for this date
  const logs = db.prepare(
    'SELECT * FROM supplements_log WHERE user_id = ? AND date = ?'
  ).all(uid, date);

  // Merge supplement list with logs
  const result = userSupplements.map(sup => {
    const log = logs.find(l => l.supplement_name === sup.name);
    return {
      name: sup.name,
      time: sup.time,
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
