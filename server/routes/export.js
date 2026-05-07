const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/export/:userId - Export all user data as CSV
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const uid = parseInt(userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const sessions = db.prepare(
    'SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC'
  ).all(uid);

  const sets = db.prepare(`
    SELECT sl.*, s.date, s.day_type
    FROM set_logs sl
    JOIN sessions s ON sl.session_id = s.id
    WHERE s.user_id = ?
    ORDER BY s.date DESC, sl.exercise_name, sl.set_number
  `).all(uid);

  const meals = db.prepare(
    'SELECT * FROM meals WHERE user_id = ? ORDER BY date DESC'
  ).all(uid);

  const bodyweight = db.prepare(
    'SELECT * FROM body_weight WHERE user_id = ? ORDER BY date DESC'
  ).all(uid);

  let csv = '';

  // User info section
  csv += '# INFORMACIÓN DE USUARIO\n';
  csv += 'Campo,Valor\n';
  csv += `Nombre,${user.name}\n`;
  csv += `Género,${user.gender}\n`;
  csv += `Edad,${user.age}\n`;
  csv += `Altura,${user.height}m\n`;
  csv += `Peso inicial,${user.weight_start}kg\n`;
  csv += `Objetivo peso,${user.weight_goal}kg\n`;
  csv += `Calorías objetivo,${user.calories_goal}kcal\n\n`;

  // Body weight section
  csv += '# REGISTRO DE PESO CORPORAL\n';
  csv += 'Fecha,Peso (kg)\n';
  bodyweight.forEach(bw => {
    csv += `${bw.date},${bw.weight}\n`;
  });
  csv += '\n';

  // Sessions section
  csv += '# SESIONES DE ENTRENAMIENTO\n';
  csv += 'Fecha,Tipo,Completada,Notas\n';
  sessions.forEach(s => {
    const notes = (s.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
    csv += `${s.date},${s.day_type},${s.completed ? 'Sí' : 'No'},"${notes}"\n`;
  });
  csv += '\n';

  // Sets section
  csv += '# REGISTRO DE SERIES\n';
  csv += 'Fecha,Tipo,Ejercicio,Serie,Peso (kg),Reps,Completada\n';
  sets.forEach(s => {
    csv += `${s.date},${s.day_type},"${s.exercise_name}",${s.set_number},${s.weight},${s.reps},${s.completed ? 'Sí' : 'No'}\n`;
  });
  csv += '\n';

  // Meals section
  csv += '# REGISTRO DE NUTRICIÓN\n';
  csv += 'Fecha,Comida,Calorías,Proteína (g),Grasas (g),Carbos (g)\n';
  meals.forEach(m => {
    const name = (m.meal_name || '').replace(/,/g, ';');
    csv += `${m.date},"${name}",${m.calories},${m.protein},${m.fat},${m.carbs}\n`;
  });

  const filename = `gym-data-${user.username}-${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('﻿' + csv); // BOM for Excel UTF-8
});

module.exports = router;
