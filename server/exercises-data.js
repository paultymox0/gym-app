// Complete exercise data for both users
const EXERCISES = {
  upper_a: {
    name: 'Upper A',
    exercises: [
      {
        name: 'Press inclinado mancuernas',
        iker: { sets: 4, reps: '8-10', rest: 90, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 60, notes: 'Mancuernas ligeras, sin comprometer hombro' }
      },
      {
        name: 'Remo barra',
        iker: { sets: 4, reps: '8-10', rest: 90, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 60, notes: 'Máquina pecho apoyado - evitar lumbar', variant: 'Máquina pecho apoyado' }
      },
      {
        name: 'Press hombro mancuernas',
        iker: { sets: 3, reps: '10-12', rest: 75, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 60, notes: 'Versión segura lumbar', variant: 'Máquina press hombro' }
      },
      {
        name: 'Dominadas',
        iker: { sets: 4, reps: 'max', rest: 90, notes: '' },
        sara: { sets: 4, reps: '12-15', rest: 60, notes: '', variant: 'Jalón al pecho' }
      },
      {
        name: 'Curl bíceps barra',
        iker: { sets: 3, reps: '10-12', rest: 60, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 45, notes: '', variant: 'Curl mancuernas alterno' }
      },
      {
        name: 'Extensión tríceps polea',
        iker: { sets: 3, reps: '12-15', rest: 60, notes: '' },
        sara: { sets: 3, reps: '15', rest: 45, notes: '', variant: 'Extensión polea cuerda' }
      },
      {
        name: 'Face pull',
        iker: { sets: 3, reps: '15-20', rest: 45, notes: '' },
        sara: { sets: 3, reps: '15-20', rest: 45, notes: 'Esencial para hombros', variant: 'Face pull ligero' }
      }
    ]
  },
  lower_a: {
    name: 'Lower A',
    exercises: [
      {
        name: 'Sentadilla barra',
        iker: { sets: 4, reps: '6-8', rest: 120, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 60, notes: 'Segura para lumbar', variant: 'Goblet squat' }
      },
      {
        name: 'Hip thrust',
        iker: { sets: 4, reps: '10-12', rest: 90, notes: '' },
        sara: { sets: 4, reps: '15', rest: 75, notes: 'Principal ejercicio glúteo' }
      },
      {
        name: 'Peso muerto rumano barra',
        iker: { sets: 3, reps: '8-10', rest: 90, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 75, notes: 'Cuidado lumbar', variant: 'RDL mancuernas' }
      },
      {
        name: 'Prensa inclinada',
        iker: { sets: 3, reps: '12-15', rest: 75, notes: '' },
        sara: { sets: 3, reps: '15', rest: 60, notes: '', variant: 'Prensa 45º' }
      },
      {
        name: 'Curl femoral tumbado',
        iker: { sets: 3, reps: '12-15', rest: 60, notes: '' },
        sara: { sets: 3, reps: '15', rest: 60, notes: 'Menos lumbar', variant: 'Curl femoral sentado' }
      },
      {
        name: 'Elevación talones de pie',
        iker: { sets: 4, reps: '15-20', rest: 45, notes: '' },
        sara: { sets: 3, reps: '15-20', rest: 45, notes: '', variant: 'Elevación talones sentada' }
      },
      {
        name: 'Plancha',
        iker: { sets: 3, reps: '60s', rest: 60, notes: '', isTime: true },
        sara: { sets: 3, reps: '10 c/lado', rest: 60, notes: 'Rehabilitación lumbar', variant: 'Bird dog' }
      }
    ]
  },
  upper_b: {
    name: 'Upper B',
    exercises: [
      {
        name: 'Press banca barra',
        iker: { sets: 4, reps: '6-8', rest: 120, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 60, notes: 'Sin carga axial hombro', variant: 'Máquina press pecho' }
      },
      {
        name: 'Jalón al pecho',
        iker: { sets: 4, reps: '8-10', rest: 90, notes: '' },
        sara: { sets: 4, reps: '12-15', rest: 60, notes: '', variant: 'Jalón al pecho agarre neutro' }
      },
      {
        name: 'Aperturas máquina',
        iker: { sets: 3, reps: '12-15', rest: 60, notes: '' },
        sara: { sets: 3, reps: '15', rest: 45, notes: '', variant: 'Aperturas máquina pec deck' }
      },
      {
        name: 'Remo polea baja',
        iker: { sets: 4, reps: '10-12', rest: 75, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 60, notes: '', variant: 'Remo polea baja agarre neutro' }
      },
      {
        name: 'Pájaros mancuernas',
        iker: { sets: 3, reps: '15-20', rest: 45, notes: '' },
        sara: { sets: 3, reps: '15-20', rest: 45, notes: 'Carga mínima hombro', variant: 'Pájaros con band/polea' }
      },
      {
        name: 'Elevaciones laterales',
        iker: { sets: 3, reps: '12-15', rest: 60, notes: '' },
        sara: { sets: 3, reps: '15-20', rest: 45, notes: 'Más seguro', variant: 'Elevaciones laterales cable' }
      },
      {
        name: 'Curl martillo',
        iker: { sets: 3, reps: '10-12', rest: 60, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 45, notes: '', variant: 'Curl predicador máquina' }
      },
      {
        name: 'Press francés',
        iker: { sets: 3, reps: '10-12', rest: 60, notes: '' },
        sara: { sets: 3, reps: '12-15', rest: 45, notes: '', variant: 'Extensión tríceps sobre cabeza cable' }
      }
    ]
  },
  lower_b: {
    name: 'Lower B',
    exercises: [
      {
        name: 'Hip thrust hipertrofia',
        iker: { sets: 4, reps: '12-15', rest: 75, notes: '' },
        sara: { sets: 4, reps: '15', rest: 60, notes: '', variant: 'Hip thrust pie elevado' }
      },
      {
        name: 'Búlgara',
        iker: { sets: 3, reps: '8-10 c/pierna', rest: 90, notes: '' },
        sara: { sets: 3, reps: '12 c/pierna', rest: 75, notes: '', variant: 'Búlgara sin peso o mancuernas ligeras' }
      },
      {
        name: 'Zancadas',
        iker: { sets: 3, reps: '10-12 c/pierna', rest: 75, notes: '' },
        sara: { sets: 3, reps: '12 c/pierna', rest: 60, notes: 'Menos impacto rodilla', variant: 'Step-up banco' }
      },
      {
        name: 'Patada glúteo polea',
        iker: { sets: 3, reps: '15 c/pierna', rest: 45, notes: '' },
        sara: { sets: 4, reps: '20 c/pierna', rest: 45, notes: '' }
      },
      {
        name: 'Abducción cadera máquina',
        iker: { sets: 3, reps: '15-20', rest: 45, notes: '' },
        sara: { sets: 4, reps: '20', rest: 45, notes: '' }
      },
      {
        name: 'Elevación talones sentado',
        iker: { sets: 3, reps: '15-20', rest: 45, notes: '' },
        sara: { sets: 3, reps: '20', rest: 45, notes: '' }
      },
      {
        name: 'Rueda abdominal',
        iker: { sets: 3, reps: '10', rest: 60, notes: '' },
        sara: { sets: 3, reps: '10 c/lado', rest: 60, notes: 'Rehabilitación', variant: 'Dead bug' }
      }
    ]
  },
  abs_a: {
    name: 'Abs A (Casa)',
    exercises: [
      {
        name: 'Plancha',
        iker: { sets: 3, reps: '60s', rest: 60, notes: '', isTime: true },
        sara: { sets: 3, reps: '30-45s', rest: 60, notes: '', isTime: true }
      },
      {
        name: 'Plancha lateral',
        iker: { sets: 3, reps: '45s c/lado', rest: 60, notes: '', isTime: true },
        sara: { sets: 3, reps: '30s c/lado', rest: 60, notes: 'Versión rodillas si duele lumbar', isTime: true }
      },
      {
        name: 'Dead bug',
        iker: { sets: 3, reps: '10 c/lado', rest: 60, notes: '' },
        sara: { sets: 3, reps: '8 c/lado', rest: 60, notes: 'Lento y controlado' }
      },
      {
        name: 'Bird dog',
        iker: { sets: 3, reps: '12 c/lado', rest: 60, notes: '' },
        sara: { sets: 3, reps: '10 c/lado', rest: 60, notes: '' }
      },
      {
        name: 'Hollow body hold',
        iker: { sets: 3, reps: '30s', rest: 60, notes: '', isTime: true },
        sara: { sets: 3, reps: '20s', rest: 60, notes: '', variant: 'Hollow body modificado', isTime: true }
      },
      {
        name: 'Mountain climbers',
        iker: { sets: 3, reps: '30s', rest: 60, notes: '', isTime: true },
        sara: { sets: 3, reps: '20', rest: 60, notes: 'Sustituir si duele lumbar', variant: 'Glute bridge' }
      }
    ]
  },
  abs_b: {
    name: 'Abs B (Casa)',
    exercises: [
      {
        name: 'Bird dog dinámico',
        iker: { sets: 3, reps: '15 c/lado', rest: 60, notes: '' },
        sara: { sets: 3, reps: '12 c/lado', rest: 60, notes: '' }
      },
      {
        name: 'Plancha tap hombro',
        iker: { sets: 3, reps: '20 taps', rest: 60, notes: '' },
        sara: { sets: 3, reps: '16 taps', rest: 60, notes: 'Lento' }
      },
      {
        name: 'Crunch invertido',
        iker: { sets: 3, reps: '15', rest: 60, notes: '' },
        sara: { sets: 3, reps: '12', rest: 60, notes: 'Sin inercia' }
      },
      {
        name: 'Russian twist',
        iker: { sets: 3, reps: '20', rest: 60, notes: '' },
        sara: { sets: 3, reps: '15', rest: 60, notes: 'Sin peso, cuidado lumbar', variant: 'Russian twist sin peso' }
      },
      {
        name: 'Plancha con peso',
        iker: { sets: 3, reps: '45s', rest: 60, notes: '', isTime: true },
        sara: { sets: 3, reps: '30s c/lado', rest: 60, notes: '', variant: 'Side plank', isTime: true }
      },
      {
        name: 'Burpees',
        iker: { sets: 3, reps: '10', rest: 60, notes: '' },
        sara: { sets: 3, reps: '15 c/lado', rest: 60, notes: 'Sin impacto', variant: 'Glute bridge 1 pierna' }
      }
    ]
  }
};

// Weekly schedule: 0=Sunday, 1=Monday, ..., 6=Saturday
const WEEKLY_SCHEDULE = {
  1: 'upper_a',   // Monday
  2: 'lower_a',   // Tuesday
  3: 'abs_a',     // Wednesday
  4: 'upper_b',   // Thursday
  5: 'lower_b',   // Friday
  6: 'abs_b',     // Saturday
  0: null         // Sunday = Rest
};

function getDayType(date) {
  const d = new Date(date + 'T12:00:00');
  const dayOfWeek = d.getDay();
  return WEEKLY_SCHEDULE[dayOfWeek] || null;
}

function getExercisesForUser(dayType, userId) {
  const routine = EXERCISES[dayType];
  if (!routine) return [];

  const userKey = userId === 1 ? 'iker' : 'sara';

  return routine.exercises.map(ex => {
    const userConfig = ex[userKey];
    return {
      name: userConfig.variant || ex.name,
      originalName: ex.name,
      sets: userConfig.sets,
      reps: userConfig.reps,
      rest: userConfig.rest,
      notes: userConfig.notes,
      isTime: userConfig.isTime || false
    };
  });
}

module.exports = { EXERCISES, WEEKLY_SCHEDULE, getDayType, getExercisesForUser };
