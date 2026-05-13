const express = require('express');
const router = express.Router();
const db = require('../db/database');

function computeStreak(dates, today) {
  if (!dates.length) return 0;
  let streak = 0;
  let check = new Date(today);
  for (const { date } of dates) {
    const d = new Date(date);
    const diff = Math.round((check - d) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      check = d;
    } else {
      break;
    }
  }
  return streak;
}

// GET /api/habits/:userId — list with streak + today status
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const today = new Date().toISOString().split('T')[0];
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? AND active = 1 ORDER BY sort_order, created_at').all(userId);

  const result = habits.map(habit => {
    let streak = 0;
    let todayCompleted = false;

    if (habit.type === 'gym') {
      const sessions = db.prepare(
        'SELECT date FROM sessions WHERE user_id = ? AND completed = 1 AND date <= ? ORDER BY date DESC LIMIT 90'
      ).all(userId, today);
      streak = computeStreak(sessions, today);
      todayCompleted = sessions.some(s => s.date === today);
    } else {
      const logs = db.prepare(
        'SELECT date FROM habit_logs WHERE user_id = ? AND habit_id = ? AND date <= ? ORDER BY date DESC LIMIT 90'
      ).all(userId, habit.id, today);
      streak = computeStreak(logs, today);
      todayCompleted = logs.some(l => l.date === today);
    }

    return { ...habit, streak, today_completed: todayCompleted ? 1 : 0 };
  });

  res.json(result);
});

// POST /api/habits
router.post('/', (req, res) => {
  const { user_id, name, emoji, color, sort_order } = req.body;
  const result = db.prepare(
    'INSERT INTO habits (user_id, name, emoji, type, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(user_id, name, emoji || '✅', 'custom', color || '#3B82F6', sort_order || 0);
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...habit, streak: 0, today_completed: 0 });
});

// PATCH /api/habits/:id
router.patch('/:id', (req, res) => {
  const { name, emoji, color, active } = req.body;
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  if (!habit) return res.status(404).json({ error: 'Not found' });

  db.prepare('UPDATE habits SET name = ?, emoji = ?, color = ?, active = ? WHERE id = ?').run(
    name !== undefined ? name : habit.name,
    emoji !== undefined ? emoji : habit.emoji,
    color !== undefined ? color : habit.color,
    active !== undefined ? (active ? 1 : 0) : habit.active,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id));
});

// DELETE /api/habits/:id
router.delete('/:id', (req, res) => {
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  if (habit?.type === 'gym') return res.status(400).json({ error: 'Cannot delete gym habit' });
  db.prepare('DELETE FROM habit_logs WHERE habit_id = ?').run(req.params.id);
  db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// POST /api/habits/log — toggle for a date
router.post('/log', (req, res) => {
  const { user_id, habit_id, date } = req.body;
  const existing = db.prepare('SELECT id FROM habit_logs WHERE user_id = ? AND habit_id = ? AND date = ?').get(user_id, habit_id, date);
  if (existing) {
    db.prepare('DELETE FROM habit_logs WHERE id = ?').run(existing.id);
    res.json({ completed: false });
  } else {
    db.prepare('INSERT OR IGNORE INTO habit_logs (user_id, habit_id, date) VALUES (?, ?, ?)').run(user_id, habit_id, date);
    res.json({ completed: true });
  }
});

module.exports = router;
