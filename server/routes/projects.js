const express = require('express');
const router = express.Router();
const db = require('../db/database');

function withTaskCounts(project) {
  const total = db.prepare('SELECT COUNT(*) as c FROM tasks WHERE project_id = ?').get(project.id).c;
  const done = db.prepare('SELECT COUNT(*) as c FROM tasks WHERE project_id = ? AND completed = 1').get(project.id).c;
  return { ...project, task_count: total, completed_tasks: done };
}

// GET /api/projects/:userId
router.get('/:userId', (req, res) => {
  const projects = db.prepare(`
    SELECT * FROM projects WHERE user_id = ?
    ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'paused' THEN 1 ELSE 2 END, created_at DESC
  `).all(req.params.userId);
  res.json(projects.map(withTaskCounts));
});

// POST /api/projects
router.post('/', (req, res) => {
  const { user_id, title, description, status, color } = req.body;
  const result = db.prepare(
    'INSERT INTO projects (user_id, title, description, status, color) VALUES (?, ?, ?, ?, ?)'
  ).run(user_id, title, description || '', status || 'active', color || '#3B82F6');
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(withTaskCounts(project));
});

// PATCH /api/projects/:id
router.patch('/:id', (req, res) => {
  const { title, description, status, progress, color } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  db.prepare(`UPDATE projects SET title = ?, description = ?, status = ?, progress = ?, color = ? WHERE id = ?`).run(
    title !== undefined ? title : project.title,
    description !== undefined ? description : project.description,
    status !== undefined ? status : project.status,
    progress !== undefined ? progress : project.progress,
    color !== undefined ? color : project.color,
    req.params.id
  );

  res.json(withTaskCounts(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)));
});

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  db.prepare('UPDATE tasks SET project_id = NULL WHERE project_id = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
