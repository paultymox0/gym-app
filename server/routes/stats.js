const express = require('express');
const router = express.Router();
const db = require('../db/database');

function calcStreak(uid) {
  const allSessions = db.prepare(
    'SELECT DISTINCT date FROM sessions WHERE user_id = ? AND completed = 1 ORDER BY date DESC'
  ).all(uid);

  let streak = 0;
  if (allSessions.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = allSessions[0].date;
    if (lastDate === today || lastDate === yesterday) {
      streak = 1;
      let prevDate = new Date(lastDate + 'T12:00:00');
      for (let i = 1; i < allSessions.length; i++) {
        const currDate = new Date(allSessions[i].date + 'T12:00:00');
        const daysDiff = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) { streak++; prevDate = currDate; }
        else break;
      }
    }
  }
  return streak;
}

// GET /api/stats/competition - Timmy vs Andrea
router.get('/competition', (req, res) => {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  function getUserStats(uid) {
    const monthSessions = db.prepare(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND date >= ? AND completed = 1'
    ).get(uid, monthStart);

    const monthVolume = db.prepare(`
      SELECT SUM(sl.weight * sl.reps) as total
      FROM set_logs sl
      JOIN sessions s ON sl.session_id = s.id
      WHERE s.user_id = ? AND s.date >= ? AND sl.completed = 1
    `).get(uid, monthStart);

    return {
      monthSessions: monthSessions.count,
      monthVolume: Math.round(monthVolume.total || 0),
      streak: calcStreak(uid)
    };
  }

  res.json({ timmy: getUserStats(1), andrea: getUserStats(2) });
});

// GET /api/stats/:userId
router.get('/:userId', (req, res) => {
  const uid = parseInt(req.params.userId);

  const totalSessions = db.prepare(
    'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND completed = 1'
  ).get(uid);

  const streak = calcStreak(uid);

  const prs = db.prepare(`
    SELECT sl.exercise_name, MAX(sl.weight) as max_weight
    FROM set_logs sl
    JOIN sessions s ON sl.session_id = s.id
    WHERE s.user_id = ? AND sl.completed = 1 AND sl.weight > 0
    GROUP BY sl.exercise_name
    ORDER BY max_weight DESC
    LIMIT 10
  `).all(uid);

  const weeklyStats = db.prepare(`
    SELECT strftime('%Y-%W', date) as week, COUNT(*) as count
    FROM sessions
    WHERE user_id = ? AND completed = 1
    GROUP BY week
    ORDER BY week DESC
    LIMIT 8
  `).all(uid);

  const latestWeight = db.prepare(
    'SELECT * FROM body_weight WHERE user_id = ? ORDER BY date DESC LIMIT 1'
  ).get(uid);

  const totalVolume = db.prepare(`
    SELECT SUM(sl.weight * sl.reps) as total
    FROM set_logs sl
    JOIN sessions s ON sl.session_id = s.id
    WHERE s.user_id = ? AND sl.completed = 1
  `).get(uid);

  res.json({
    totalSessions: totalSessions.count,
    streak,
    prs,
    weeklyStats: weeklyStats.reverse(),
    latestWeight: latestWeight ? latestWeight.weight : null,
    totalVolume: totalVolume.total || 0
  });
});

module.exports = router;
