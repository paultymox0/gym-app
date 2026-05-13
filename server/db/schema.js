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

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_key TEXT NOT NULL,
      name TEXT NOT NULL,
      sets INTEGER NOT NULL DEFAULT 3,
      reps TEXT NOT NULL DEFAULT '10',
      rest_seconds INTEGER DEFAULT 90,
      notes TEXT DEFAULT '',
      is_time INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
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

  // Seed 5-day workout plan for each user (idempotent)
  const DEFAULT_EXERCISES = [
    // Día 1: Espalda y Bíceps
    { day_key: 'back_biceps', name: 'Peso muerto', sets: 4, reps: '4-6', rest_seconds: 180, notes: '', is_time: 0, sort_order: 1 },
    { day_key: 'back_biceps', name: 'Remo con barra', sets: 4, reps: '8-10', rest_seconds: 90, notes: '', is_time: 0, sort_order: 2 },
    { day_key: 'back_biceps', name: 'Jalón al pecho', sets: 4, reps: '8-12', rest_seconds: 90, notes: '', is_time: 0, sort_order: 3 },
    { day_key: 'back_biceps', name: 'Remo en máquina', sets: 3, reps: '12-15', rest_seconds: 75, notes: '', is_time: 0, sort_order: 4 },
    { day_key: 'back_biceps', name: 'Curl bíceps barra', sets: 3, reps: '10-12', rest_seconds: 60, notes: '', is_time: 0, sort_order: 5 },
    { day_key: 'back_biceps', name: 'Curl martillo', sets: 3, reps: '12', rest_seconds: 60, notes: '', is_time: 0, sort_order: 6 },
    { day_key: 'back_biceps', name: 'Face pull', sets: 3, reps: '15-20', rest_seconds: 45, notes: '', is_time: 0, sort_order: 7 },
    // Día 2: Pecho y Tríceps
    { day_key: 'chest_triceps', name: 'Press banca barra', sets: 4, reps: '6-8', rest_seconds: 120, notes: '', is_time: 0, sort_order: 1 },
    { day_key: 'chest_triceps', name: 'Press inclinado mancuernas', sets: 4, reps: '8-10', rest_seconds: 90, notes: '', is_time: 0, sort_order: 2 },
    { day_key: 'chest_triceps', name: 'Aperturas en máquina', sets: 3, reps: '12-15', rest_seconds: 60, notes: '', is_time: 0, sort_order: 3 },
    { day_key: 'chest_triceps', name: 'Press hombro mancuernas', sets: 3, reps: '10-12', rest_seconds: 75, notes: '', is_time: 0, sort_order: 4 },
    { day_key: 'chest_triceps', name: 'Elevaciones laterales', sets: 3, reps: '15-20', rest_seconds: 45, notes: '', is_time: 0, sort_order: 5 },
    { day_key: 'chest_triceps', name: 'Extensión tríceps polea', sets: 3, reps: '12-15', rest_seconds: 60, notes: '', is_time: 0, sort_order: 6 },
    { day_key: 'chest_triceps', name: 'Press francés', sets: 3, reps: '10-12', rest_seconds: 60, notes: '', is_time: 0, sort_order: 7 },
    // Día 3: Glúteo y Femoral
    { day_key: 'glute_hamstring', name: 'Hip thrust barra', sets: 4, reps: '10-12', rest_seconds: 90, notes: '', is_time: 0, sort_order: 1 },
    { day_key: 'glute_hamstring', name: 'Peso muerto rumano', sets: 4, reps: '10-12', rest_seconds: 90, notes: '', is_time: 0, sort_order: 2 },
    { day_key: 'glute_hamstring', name: 'Curl femoral tumbado', sets: 3, reps: '12-15', rest_seconds: 75, notes: '', is_time: 0, sort_order: 3 },
    { day_key: 'glute_hamstring', name: 'Patada glúteo polea', sets: 3, reps: '15 c/pierna', rest_seconds: 45, notes: '', is_time: 0, sort_order: 4 },
    { day_key: 'glute_hamstring', name: 'Abducción cadera máquina', sets: 3, reps: '20', rest_seconds: 45, notes: '', is_time: 0, sort_order: 5 },
    { day_key: 'glute_hamstring', name: 'Hip thrust pie elevado', sets: 3, reps: '15', rest_seconds: 60, notes: '', is_time: 0, sort_order: 6 },
    { day_key: 'glute_hamstring', name: 'Puente glúteo una pierna', sets: 3, reps: '15 c/pierna', rest_seconds: 45, notes: '', is_time: 0, sort_order: 7 },
    // Día 4: Cuádriceps y Hombro
    { day_key: 'quad_shoulder', name: 'Sentadilla barra', sets: 4, reps: '6-8', rest_seconds: 120, notes: '', is_time: 0, sort_order: 1 },
    { day_key: 'quad_shoulder', name: 'Prensa inclinada', sets: 4, reps: '10-12', rest_seconds: 90, notes: '', is_time: 0, sort_order: 2 },
    { day_key: 'quad_shoulder', name: 'Extensión cuádriceps máquina', sets: 3, reps: '12-15', rest_seconds: 75, notes: '', is_time: 0, sort_order: 3 },
    { day_key: 'quad_shoulder', name: 'Zancadas', sets: 3, reps: '10-12 c/pierna', rest_seconds: 75, notes: '', is_time: 0, sort_order: 4 },
    { day_key: 'quad_shoulder', name: 'Press hombro barra', sets: 3, reps: '8-10', rest_seconds: 90, notes: '', is_time: 0, sort_order: 5 },
    { day_key: 'quad_shoulder', name: 'Elevaciones laterales cable', sets: 4, reps: '15-20', rest_seconds: 45, notes: '', is_time: 0, sort_order: 6 },
    { day_key: 'quad_shoulder', name: 'Press Arnold', sets: 3, reps: '10-12', rest_seconds: 60, notes: '', is_time: 0, sort_order: 7 },
    { day_key: 'quad_shoulder', name: 'Elevación de talones', sets: 3, reps: '15-20', rest_seconds: 45, notes: '', is_time: 0, sort_order: 8 },
    // Día 5: Abdomen (Casa)
    { day_key: 'abs', name: 'Plancha', sets: 3, reps: '60s', rest_seconds: 60, notes: '', is_time: 1, sort_order: 1 },
    { day_key: 'abs', name: 'Plancha lateral', sets: 3, reps: '45s c/lado', rest_seconds: 60, notes: '', is_time: 1, sort_order: 2 },
    { day_key: 'abs', name: 'Dead bug', sets: 3, reps: '10 c/lado', rest_seconds: 60, notes: '', is_time: 0, sort_order: 3 },
    { day_key: 'abs', name: 'Bird dog', sets: 3, reps: '12 c/lado', rest_seconds: 60, notes: '', is_time: 0, sort_order: 4 },
    { day_key: 'abs', name: 'Hollow body hold', sets: 3, reps: '30s', rest_seconds: 60, notes: '', is_time: 1, sort_order: 5 },
    { day_key: 'abs', name: 'Mountain climbers', sets: 3, reps: '30s', rest_seconds: 60, notes: '', is_time: 1, sort_order: 6 },
    { day_key: 'abs', name: 'Crunch en polea', sets: 3, reps: '15', rest_seconds: 45, notes: '', is_time: 0, sort_order: 7 },
  ];

  const insertExercise = db.prepare(`
    INSERT INTO workout_exercises (user_id, day_key, name, sets, reps, rest_seconds, notes, is_time, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of allUsers) {
    const hasExercises = db.prepare('SELECT COUNT(*) as count FROM workout_exercises WHERE user_id = ?').get(u.id);
    if (hasExercises.count === 0) {
      for (const ex of DEFAULT_EXERCISES) {
        insertExercise.run(u.id, ex.day_key, ex.name, ex.sets, ex.reps, ex.rest_seconds, ex.notes, ex.is_time, ex.sort_order);
      }
    }
  }
}

module.exports = { initializeSchema };
