const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/nutrition/:userId/:date
router.get('/:userId/:date', (req, res) => {
  const { userId, date } = req.params;

  const meals = db.prepare(
    'SELECT * FROM meals WHERE user_id = ? AND date = ? ORDER BY created_at ASC'
  ).all(parseInt(userId), date);

  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    fat: acc.fat + (meal.fat || 0),
    carbs: acc.carbs + (meal.carbs || 0)
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  const user = db.prepare('SELECT calories_goal FROM users WHERE id = ?').get(parseInt(userId));

  res.json({
    meals,
    totals,
    goal: user ? user.calories_goal : 2000
  });
});

// POST /api/nutrition
router.post('/', (req, res) => {
  const { user_id, date, meal_name, calories, protein, fat, carbs } = req.body;

  if (!user_id || !date || !meal_name) {
    return res.status(400).json({ error: 'user_id, date, and meal_name are required' });
  }

  const result = db.prepare(
    'INSERT INTO meals (user_id, date, meal_name, calories, protein, fat, carbs) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    user_id, date, meal_name,
    calories || 0, protein || 0, fat || 0, carbs || 0
  );

  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ meal });
});

// DELETE /api/nutrition/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
  if (!meal) return res.status(404).json({ error: 'Meal not found' });

  db.prepare('DELETE FROM meals WHERE id = ?').run(id);
  res.json({ message: 'Deleted successfully' });
});

// GET /api/nutrition/:userId - History (last 30 days)
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const days = req.query.days || 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(days));
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const dailyTotals = db.prepare(`
    SELECT date,
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(fat) as fat,
      SUM(carbs) as carbs
    FROM meals
    WHERE user_id = ? AND date >= ?
    GROUP BY date
    ORDER BY date DESC
  `).all(parseInt(userId), cutoffStr);

  res.json({ dailyTotals });
});

module.exports = router;
