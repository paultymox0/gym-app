const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/tasks/:userId
router.get('/:userId', (req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, p.title as project_title
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.user_id = ?
    ORDER BY t.completed ASC,
      CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      t.created_at DESC
  `).all(req.params.userId);
  res.json(tasks);
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { user_id, title, description, priority, project_id } = req.body;
  const result = db.prepare(
    'INSERT INTO tasks (user_id, title, description, priority, project_id) VALUES (?, ?, ?, ?, ?)'
  ).run(user_id, title, description || '', priority || 'medium', project_id || null);
  const task = db.prepare(`
    SELECT t.*, p.title as project_title
    FROM tasks t LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const { title, description, priority, completed, project_id } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });

  const newCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed;
  const completedAt = newCompleted && !task.completed ? new Date().toISOString() : (newCompleted ? task.completed_at : null);

  db.prepare(`UPDATE tasks SET
    title = ?, description = ?, priority = ?, completed = ?, project_id = ?, completed_at = ?
    WHERE id = ?`
  ).run(
    title !== undefined ? title : task.title,
    description !== undefined ? description : task.description,
    priority !== undefined ? priority : task.priority,
    newCompleted,
    project_id !== undefined ? project_id : task.project_id,
    completedAt,
    req.params.id
  );

  res.json(db.prepare(`
    SELECT t.*, p.title as project_title
    FROM tasks t LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `).get(req.params.id));
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
