const express = require('express');
const router = express.Router();
const db = require('../db/database');

function getCyclePhase(dayNumber) {
  if (dayNumber >= 1 && dayNumber <= 5) {
    return {
      phase: 'menstruation',
      name: 'Menstruación',
      days: `Días 1-5`,
      color: '#EF4444',
      nutrition: [
        'Aumenta el hierro: lentejas, espinacas, carne roja',
        'Vitamina C para absorber el hierro',
        'Mantén hidratación extra',
        'Reduce el sodio para menos retención'
      ],
      training: [
        'Intensidad reducida es normal y recomendable',
        'Yoga o estiramientos ligeros son ideales',
        'Escucha a tu cuerpo - descansa si lo necesitas',
        'El dolor lumbar puede aumentar - cuidado con pesos'
      ],
      alert: null
    };
  } else if (dayNumber >= 6 && dayNumber <= 13) {
    return {
      phase: 'follicular',
      name: 'Folicular',
      days: `Días 6-13`,
      color: '#10B981',
      nutrition: [
        'Proteína moderada-alta para recuperación',
        'Carbohidratos complejos para energía',
        'Hierro y zinc para hormonal balance',
        'Mayor tolerancia a carbohidratos'
      ],
      training: [
        'Mejor momento para entrenar fuerte',
        'Progresa en pesos - mejor fuerza',
        'Alta energía y recuperación rápida',
        'Ideal para nuevos retos de entrenamiento'
      ],
      alert: null
    };
  } else if (dayNumber >= 14 && dayNumber <= 16) {
    return {
      phase: 'ovulation',
      name: 'Ovulación',
      days: `Días 14-16`,
      color: '#F59E0B',
      nutrition: [
        'Antioxidantes: frutas del bosque, verduras coloridas',
        'Omega-3 antiinflamatorio',
        'Fibra para equilibrio hormonal',
        'Energía en su punto máximo'
      ],
      training: [
        'Pico de fuerza y resistencia',
        'Aprovecha para batir marcas personales',
        'Alta coordinación y motivación',
        'Cuidado con esguinces - ligamentos más laxos'
      ],
      alert: null
    };
  } else if (dayNumber >= 17 && dayNumber <= 21) {
    return {
      phase: 'luteal',
      name: 'Lútea',
      days: `Días 17-21`,
      color: '#8B5CF6',
      nutrition: [
        'Más calorías: +100-200 kcal es normal',
        'Magnesio para reducir síntomas SPM',
        'Reduce el azúcar refinado',
        'Calcio para estado de ánimo'
      ],
      training: [
        'Puede bajar la energía - es normal',
        'Reduce volumen o intensidad si necesitas',
        'Yoga y pilates muy beneficiosos',
        'Mantén consistencia aunque sea más suave'
      ],
      alert: null
    };
  } else {
    return {
      phase: 'luteal_late',
      name: 'Lútea tardía',
      days: `Días 22-28`,
      color: '#F97316',
      nutrition: [
        'No te peses ahora - retención de líquidos normal',
        'Aumenta el magnesio: nueces, semillas',
        'Reduce cafeína y alcohol',
        'Prioriza alimentos antiinflamatorios'
      ],
      training: [
        'Reduce la intensidad del entrenamiento',
        'Evita progresar en pesos esta semana',
        'Movimiento suave reduce síntomas',
        'Especial cuidado con lumbar y hombros'
      ],
      alert: '⚠️ No te peses esta semana - la retención de líquidos puede dar lecturas erróneas. Baja la intensidad del entrenamiento.'
    };
  }
}

// GET /api/cycle/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const cycles = db.prepare(
    'SELECT * FROM cycle_days WHERE user_id = ? ORDER BY cycle_start_date DESC LIMIT 6'
  ).all(parseInt(userId));

  let currentPhase = null;
  if (cycles.length > 0) {
    const lastCycle = cycles[0];
    const startDate = new Date(lastCycle.cycle_start_date + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffTime = today - startDate;
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (dayNumber >= 1 && dayNumber <= 35) {
      currentPhase = {
        ...getCyclePhase(dayNumber),
        dayNumber,
        cycleStart: lastCycle.cycle_start_date
      };
    }
  }

  res.json({ cycles, currentPhase });
});

// POST /api/cycle
router.post('/', (req, res) => {
  const { user_id, cycle_start_date, notes } = req.body;

  if (!user_id || !cycle_start_date) {
    return res.status(400).json({ error: 'user_id and cycle_start_date are required' });
  }

  // Check if entry already exists for this date
  const existing = db.prepare(
    'SELECT * FROM cycle_days WHERE user_id = ? AND cycle_start_date = ?'
  ).get(user_id, cycle_start_date);

  if (existing) {
    return res.json({ cycle: existing });
  }

  const result = db.prepare(
    'INSERT INTO cycle_days (user_id, cycle_start_date, notes) VALUES (?, ?, ?)'
  ).run(user_id, cycle_start_date, notes || '');

  const cycle = db.prepare('SELECT * FROM cycle_days WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ cycle });
});

// DELETE /api/cycle/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM cycle_days WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

module.exports = router;
