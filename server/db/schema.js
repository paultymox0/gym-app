const db = require('./database');
const bcrypt = require('bcryptjs');

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      gender TEXT,
      age INTEGER,
      height REAL,
      weight_start REAL,
      weight_goal REAL,
      calories_goal INTEGER,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      day_type TEXT,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS set_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      exercise_name TEXT,
      set_number INTEGER,
      weight REAL,
      reps INTEGER,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      meal_name TEXT,
      calories INTEGER,
      protein REAL,
      fat REAL,
      carbs REAL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS body_weight (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      weight REAL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS supplements_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      supplement_name TEXT,
      taken INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS supplement_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      time TEXT DEFAULT 'morning',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cycle_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      cycle_start_date TEXT,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      photo_data TEXT,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      completed INTEGER DEFAULT 0,
      project_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      color TEXT DEFAULT '#3B82F6',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      emoji TEXT DEFAULT '✅',
      type TEXT DEFAULT 'custom',
      color TEXT DEFAULT '#3B82F6',
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      habit_id INTEGER,
      date TEXT NOT NULL,
      UNIQUE(user_id, habit_id, date),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Seed users
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count === 0) {
    const timmyHash = bcrypt.hashSync('timmy123', 10);
    const andreaHash = bcrypt.hashSync('andrea123', 10);

    db.prepare(`
      INSERT INTO users (id, username, password, name, gender, age, height, weight_start, weight_goal, calories_goal, color)
      VALUES (1, 'timmy', ?, 'Timmy', 'male', 26, 1.75, 68, 71, 3000, '#00FF88')
    `).run(timmyHash);

    db.prepare(`
      INSERT INTO users (id, username, password, name, gender, age, height, weight_start, weight_goal, calories_goal, color)
      VALUES (2, 'andrea', ?, 'Andrea', 'female', 28, 1.45, 50, 47.5, 1400, '#BF5FFF')
    `).run(andreaHash);

    console.log('Users seeded: timmy (timmy123) and andrea (andrea123)');
  }

  // Seed gym habit for each user (idempotent)
  const allUsers = db.prepare('SELECT id, color FROM users').all();
  for (const u of allUsers) {
    const has = db.prepare('SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND type = ?').get(u.id, 'gym');
    if (has.count === 0) {
      db.prepare('INSERT INTO habits (user_id, name, emoji, type, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(u.id, 'Gym', '🏋️', 'gym', u.color, 0);
    }
  }
}

module.exports = { initializeSchema };
