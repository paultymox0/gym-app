import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RestTimer from '../components/RestTimer';
import {
  Check, ChevronDown, ChevronUp, Moon, Dumbbell,
  Save, Info, RefreshCw, Clock, FileText, X,
  Pencil, Trash2, Plus, ToggleLeft, ToggleRight,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = {
  back_biceps:     'Espalda y Bíceps',
  chest_triceps:   'Pecho y Tríceps',
  glute_hamstring: 'Glúteo y Femoral',
  quad_shoulder:   'Cuádriceps y Hombro',
  abs:             'Abdomen (Casa)',
  // backward compat
  upper_a: 'Upper A', lower_a: 'Lower A', abs_a: 'Abs A',
  upper_b: 'Upper B', lower_b: 'Lower B', abs_b: 'Abs B',
};

const DAY_EMOJIS = {
  back_biceps: '🏋️', chest_triceps: '💪',
  glute_hamstring: '🍑', quad_shoulder: '🦵', abs: '🏠',
};

const ALL_DAYS = [
  { key: 'back_biceps',     name: 'Espalda y Bíceps',      emoji: '🏋️' },
  { key: 'chest_triceps',   name: 'Pecho y Tríceps',        emoji: '💪' },
  { key: 'glute_hamstring', name: 'Glúteo y Femoral',       emoji: '🍑' },
  { key: 'quad_shoulder',   name: 'Cuádriceps y Hombro',    emoji: '🦵' },
  { key: 'abs',             name: 'Abdomen (Casa)',          emoji: '🏠' },
];

const NEW_DAY_KEYS = new Set(['back_biceps', 'chest_triceps', 'glute_hamstring', 'quad_shoulder', 'abs']);

const WARMUP = {
  upper: [
    { name: 'Rotaciones de hombro', detail: '10 círculos hacia adelante y atrás' },
    { name: 'Band pull-aparts', detail: '15 repeticiones lentas' },
    { name: 'Círculos de brazo', detail: '10 hacia adelante + 10 hacia atrás' },
    { name: 'Press ligero', detail: '15 reps con barra o poco peso' },
  ],
  lower: [
    { name: 'Círculos de cadera', detail: '10 cada lado, lento' },
    { name: 'Swing de pierna', detail: '10 cada pierna hacia adelante/atrás' },
    { name: 'Puente de glúteo', detail: '15 repeticiones, aprieta arriba' },
    { name: 'Sentadilla sin peso', detail: '10 repeticiones, foco en profundidad' },
  ],
  abs: [
    { name: 'Cat-cow', detail: '10 repeticiones lentas y controladas' },
    { name: 'Bird dog', detail: '10 repeticiones cada lado' },
    { name: 'Dead bug', detail: '8 repeticiones cada lado' },
    { name: 'Plank isométrico', detail: '20-30 segundos, activa el core' },
  ],
};

function getWarmupType(dayKey) {
  if (!dayKey) return null;
  if (['back_biceps', 'chest_triceps', 'upper_a', 'upper_b'].includes(dayKey)) return 'upper';
  if (['glute_hamstring', 'quad_shoulder', 'lower_a', 'lower_b'].includes(dayKey)) return 'lower';
  if (['abs', 'abs_a', 'abs_b'].includes(dayKey)) return 'abs';
  return null;
}

function formatElapsed(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function formatDuration(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}

const glass = {
  background: 'rgba(34, 30, 40, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};
const sheetBg = { background: '#1d1a24' };
const inputStyle = { background: '#100d16', border: '1px solid #4a4455' };

// ─── Day Picker Sheet ──────────────────────────────────────────────────────────
function DayPickerSheet({ currentDayKey, onSelect, onClose, accentColor }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-3xl p-5 slide-up"
           style={{ ...sheetBg, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#e8dfee]">Cambiar entrenamiento</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}>
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {ALL_DAYS.map(d => (
            <button
              key={d.key}
              onClick={() => { onSelect(d.key); onClose(); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98]"
              style={{
                background: d.key === currentDayKey ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${d.key === currentDayKey ? accentColor + '60' : '#4a4455'}`,
              }}
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="font-medium text-[#e8dfee]">{d.name}</span>
              {d.key === currentDayKey && <Check size={16} className="ml-auto" style={{ color: accentColor }} />}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Exercise Edit Sheet ───────────────────────────────────────────────────────
function ExerciseEditSheet({ exercise, onSave, onClose, accentColor }) {
  const isNew = !exercise;
  const [name, setName] = useState(exercise?.name || '');
  const [sets, setSets] = useState(String(exercise?.sets || 3));
  const [reps, setReps] = useState(exercise?.reps || '10');
  const [rest, setRest] = useState(String(exercise?.rest || 90));
  const [notes, setNotes] = useState(exercise?.notes || '');
  const [isTime, setIsTime] = useState(exercise?.isTime || false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      sets: parseInt(sets) || 3,
      reps: reps.trim() || '10',
      rest_seconds: parseInt(rest) || 90,
      notes: notes.trim(),
      is_time: isTime,
    });
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-t-3xl p-5 slide-up"
            style={{ ...sheetBg, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#e8dfee]">{isNew ? 'Añadir ejercicio' : 'Editar ejercicio'}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="Nombre del ejercicio"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-1">Series</p>
              <input type="number" value={sets} onChange={e => setSets(e.target.value)} min="1" max="10"
                     className="w-full rounded-xl px-3 py-2.5 text-sm text-[#e8dfee] outline-none text-center"
                     style={inputStyle} inputMode="numeric" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-1">Reps</p>
              <input value={reps} onChange={e => setReps(e.target.value)} placeholder="8-10"
                     className="w-full rounded-xl px-3 py-2.5 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none text-center"
                     style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-1">Descanso</p>
              <input type="number" value={rest} onChange={e => setRest(e.target.value)} min="0"
                     className="w-full rounded-xl px-3 py-2.5 text-sm text-[#e8dfee] outline-none text-center"
                     style={inputStyle} inputMode="numeric" />
            </div>
          </div>

          {/* Rest presets */}
          <div className="flex gap-1.5 flex-wrap">
            {[30, 45, 60, 75, 90, 120, 180].map(s => (
              <button key={s} type="button" onClick={() => setRest(String(s))}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95"
                      style={parseInt(rest) === s
                        ? { background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}60` }
                        : { background: 'rgba(255,255,255,0.04)', color: '#958da1', border: '1px solid #4a4455' }
                      }>
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>

          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas (opcional)"
                 className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
                 style={inputStyle} />

          {/* IsTime toggle */}
          <button type="button" onClick={() => setIsTime(p => !p)}
                  className="flex items-center gap-3 w-full py-2 active:opacity-70 transition-opacity">
            {isTime
              ? <ToggleRight size={24} style={{ color: accentColor }} />
              : <ToggleLeft size={24} style={{ color: '#4a4455' }} />}
            <span className="text-sm text-[#e8dfee]">Ejercicio por tiempo (no reps)</span>
          </button>

          <button type="submit" disabled={!name.trim()}
                  className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{ background: accentColor, color: '#15121b', opacity: name.trim() ? 1 : 0.4 }}>
            {isNew ? 'Añadir' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

// ─── Warmup Screen ─────────────────────────────────────────────────────────────
function WarmupScreen({ dayKey, dayName, onStart, accentColor }) {
  const warmupType = getWarmupType(dayKey);
  const exercises = warmupType ? WARMUP[warmupType] : [];

  return (
    <div className="min-h-screen flex flex-col fade-in" style={{ background: '#15121b', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="px-4 pt-8 pb-4 text-center">
        <div className="text-4xl mb-3">🏃</div>
        <h1 className="text-2xl font-bold text-[#e8dfee]">Calentamiento</h1>
        <p className="text-sm mt-1" style={{ color: '#958da1' }}>{dayName}</p>
      </div>

      <div className="px-4 flex-1 space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={glass}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                 style={{ background: `${accentColor}20`, color: accentColor }}>
              {i + 1}
            </div>
            <div>
              <div className="font-semibold text-[#e8dfee] text-sm">{ex.name}</div>
              <div className="text-xs mt-0.5" style={{ color: '#958da1' }}>{ex.detail}</div>
            </div>
          </div>
        ))}
        <p className="text-center text-xs pt-2" style={{ color: '#4a4455' }}>
          5-7 minutos · Cuerpo listo para rendir al máximo
        </p>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        <button onClick={onStart} className="w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-all"
                style={{ background: accentColor, color: '#15121b' }}>
          ¡Listo, empezar sesión!
        </button>
        <button onClick={onStart} className="w-full py-2 text-sm active:scale-95"
                style={{ color: '#958da1' }}>
          Saltar calentamiento
        </button>
      </div>
    </div>
  );
}

// ─── PR Celebration ────────────────────────────────────────────────────────────
function PRCelebration({ exerciseName, weight, accentColor, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3000); return () => clearTimeout(t); }, [onDismiss]);
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none px-6">
      <div className="relative">
        {colors.map((c, i) => (
          <div key={i} className="confetti-particle" style={{ backgroundColor: c, left: `${20 + i * 15}%`, top: '-10px', animationDelay: `${i * 0.1}s` }} />
        ))}
        <div className="bounce-in rounded-3xl p-8 text-center" style={{ background: '#1d1a24', border: `1px solid ${accentColor}60` }}>
          <div className="text-6xl mb-3">🏆</div>
          <div className="text-xl font-bold text-amber-400 shimmer-gold">¡Nuevo récord!</div>
          <div className="text-[#e8dfee] font-semibold mt-2 text-sm">{exerciseName}</div>
          <div className="text-4xl font-bold mt-2" style={{ color: accentColor }}>{weight}kg</div>
          <div className="text-xs mt-2" style={{ color: '#958da1' }}>Personal Best ✨</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Session Summary ───────────────────────────────────────────────────────────
function SessionSummary({ summaryData, elapsedSeconds, dayName, accentColor, onClose }) {
  const prevVolume = summaryData.prevSession?.volume || 0;
  const currVolume = summaryData.totalVolume || 0;
  const pct = prevVolume > 0 ? Math.round(((currVolume - prevVolume) / prevVolume) * 100) : null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-t-3xl p-6 slide-up" style={sheetBg}>
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}>
            <X size={18} />
          </button>
        </div>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-[#e8dfee]">¡Sesión completada!</h2>
          <p className="text-sm mt-1" style={{ color: '#958da1' }}>{dayName}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-2xl text-center" style={glass}>
            <div className="text-2xl font-bold text-[#e8dfee]">{formatDuration(elapsedSeconds)}</div>
            <div className="text-xs mt-1" style={{ color: '#958da1' }}>⏱ Duración</div>
          </div>
          <div className="p-4 rounded-2xl text-center" style={glass}>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>{Math.round(currVolume).toLocaleString()}kg</div>
            <div className="text-xs mt-1" style={{ color: '#958da1' }}>💪 Volumen total</div>
          </div>
        </div>
        {summaryData.prevSession && (
          <div className="p-4 rounded-2xl mb-4" style={glass}>
            <div className="text-xs mb-2" style={{ color: '#958da1' }}>
              Vs. sesión anterior ({summaryData.prevSession.date})
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#e8dfee]">Volumen</span>
              <span className="font-bold text-lg" style={{ color: pct >= 0 ? '#4ade80' : '#f87171' }}>
                {pct >= 0 ? '+' : ''}{pct}%
              </span>
            </div>
          </div>
        )}
        <button onClick={onClose} className="w-full py-4 rounded-full font-bold text-lg active:scale-95 transition-all"
                style={{ background: accentColor, color: '#15121b' }}>
          ¡Genial! 💪
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── SetRow ────────────────────────────────────────────────────────────────────
function SetRow({ set, setNumber, onUpdate, accentColor, isTime }) {
  const [weight, setWeight] = useState(set.weight || '');
  const [reps, setReps] = useState(set.reps || '');

  const handleComplete = () => {
    onUpdate(setNumber, { weight: parseFloat(weight) || 0, reps: parseInt(reps) || 0, completed: !set.completed });
  };
  const handleBlur = () => {
    onUpdate(setNumber, { weight: parseFloat(weight) || 0, reps: parseInt(reps) || 0, completed: set.completed });
  };

  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${set.completed ? 'bg-green-500/10' : ''}`}
         style={!set.completed ? { background: 'rgba(255,255,255,0.03)' } : {}}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
           style={{ background: `${accentColor}20`, color: accentColor }}>
        {setNumber}
      </div>
      {!isTime ? (
        <>
          <div className="flex-1">
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} onBlur={handleBlur}
                   placeholder="kg" inputMode="decimal"
                   className="w-full bg-transparent text-center text-sm font-semibold focus:outline-none placeholder-[#4a4455]"
                   style={{ color: '#e8dfee' }} />
            <div className="text-xs text-center" style={{ color: '#4a4455' }}>kg</div>
          </div>
          <div className="w-px h-8" style={{ background: '#4a4455' }} />
          <div className="flex-1">
            <input type="number" value={reps} onChange={e => setReps(e.target.value)} onBlur={handleBlur}
                   placeholder="reps" inputMode="numeric"
                   className="w-full bg-transparent text-center text-sm font-semibold focus:outline-none placeholder-[#4a4455]"
                   style={{ color: '#e8dfee' }} />
            <div className="text-xs text-center" style={{ color: '#4a4455' }}>reps</div>
          </div>
        </>
      ) : (
        <div className="flex-1 text-center text-sm" style={{ color: '#958da1' }}>{set.repsTarget || '—'}</div>
      )}
      <button onClick={handleComplete}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${set.completed ? 'bg-green-500 text-white' : ''}`}
              style={!set.completed ? { background: 'rgba(255,255,255,0.06)', color: '#958da1' } : {}}>
        <Check size={16} />
      </button>
    </div>
  );
}

// ─── ExerciseCard ──────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, sessionId, savedSets, onSetUpdate, accentColor, editMode, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [localSets, setLocalSets] = useState(() =>
    Array.from({ length: exercise.sets }, (_, i) => {
      const saved = savedSets?.find(s => s.set_number === i + 1);
      return { set_number: i + 1, weight: saved?.weight || 0, reps: saved?.reps || 0, completed: saved?.completed === 1 || false, repsTarget: exercise.reps };
    })
  );

  const completedSets = localSets.filter(s => s.completed).length;
  const allDone = completedSets === exercise.sets;

  const handleSetUpdate = async (setNumber, updates) => {
    const newSets = localSets.map(s => s.set_number === setNumber ? { ...s, ...updates } : s);
    setLocalSets(newSets);
    onSetUpdate(exercise.name, setNumber, updates);
    if (updates.completed && !localSets.find(s => s.set_number === setNumber)?.completed) {
      setShowTimer(true);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
         style={{ ...glass, border: allDone ? '1px solid rgba(74, 222, 128, 0.3)' : 'inherit' }}>
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => !editMode && setExpanded(p => !p)} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
               style={allDone ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' } : { background: `${accentColor}15`, color: accentColor }}>
            {allDone ? <Check size={18} /> : <Dumbbell size={18} />}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold text-sm leading-tight truncate" style={{ color: '#e8dfee' }}>{exercise.name}</div>
            <div className="text-xs mt-0.5" style={{ color: '#958da1' }}>
              {exercise.sets} series × {exercise.reps}
              {exercise.rest ? ` · ${exercise.rest}s` : ''}
            </div>
            {exercise.notes && (
              <div className="text-xs mt-0.5 flex items-start gap-1" style={{ color: '#ffb784' }}>
                <Info size={10} className="shrink-0 mt-0.5" />
                {exercise.notes}
              </div>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {editMode ? (
            <>
              <button onClick={() => onEdit(exercise)} className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}>
                <Pencil size={14} />
              </button>
              <button onClick={() => onDelete(exercise.id)} className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold" style={{ color: allDone ? '#4ade80' : accentColor }}>
                {completedSets}/{exercise.sets}
              </span>
              <button onClick={() => setExpanded(p => !p)} className="active:scale-90" style={{ color: '#958da1' }}>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && !editMode && (
        <div className="px-4 pb-4 space-y-2 fade-in" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 pt-3 pb-1 text-xs" style={{ color: '#4a4455' }}>
            <div className="w-7" />
            {!exercise.isTime ? (
              <>
                <div className="flex-1 text-center">Peso</div>
                <div className="w-px" />
                <div className="flex-1 text-center">Reps</div>
              </>
            ) : (
              <div className="flex-1 text-center">Objetivo</div>
            )}
            <div className="w-8" />
          </div>

          {localSets.map(set => (
            <SetRow key={set.set_number} set={set} setNumber={set.set_number}
                    onUpdate={handleSetUpdate} accentColor={accentColor} isTime={exercise.isTime} />
          ))}

          <button onClick={() => setShowTimer(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm active:scale-95 transition-all mt-1"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#958da1', border: '1px solid #4a4455' }}>
            <Clock size={15} />
            Descanso {exercise.rest ? `(${exercise.rest}s)` : ''}
          </button>
        </div>
      )}

      {showTimer && (
        <RestTimer
          defaultTime={exercise.rest || 60}
          onClose={() => setShowTimer(false)}
          accentColor={accentColor}
          exerciseName={exercise.name}
        />
      )}
    </div>
  );
}

// ─── Main Session Page ─────────────────────────────────────────────────────────
export default function Session() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [session, setSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentDayKey, setCurrentDayKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [showWarmup, setShowWarmup] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [prCelebration, setPrCelebration] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showExerciseEdit, setShowExerciseEdit] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#d2bbff';
  const timerKey = `session_start_${user?.id}_${today}`;
  const canEdit = NEW_DAY_KEYS.has(currentDayKey);

  // Session elapsed timer (timestamp-based)
  useEffect(() => {
    if (!user || loading || session?.completed === 1) return;
    let start = parseInt(localStorage.getItem(timerKey) || '0');
    if (!start) { start = Date.now(); localStorage.setItem(timerKey, String(start)); }
    setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    const iv = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [user, loading, session?.completed, timerKey]);

  useEffect(() => { if (user) loadSession(); }, [user]);

  async function loadSession() {
    setLoading(true);
    try {
      const res = await apiCall(`/sessions/today/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTodayData(data);
        setExercises(data.exercises || []);
        setCurrentDayKey(data.dayType);
        if (data.session) {
          setSession(data.session);
          setSessionNotes(data.session.notes || '');
          if (!data.isRestDay && data.session.completed !== 1 && (!data.sets || data.sets.length === 0)) {
            setShowWarmup(true);
          }
        } else if (!data.isRestDay && data.dayType) {
          const createRes = await apiCall('/sessions', {
            method: 'POST',
            body: JSON.stringify({ user_id: user.id, date: today, day_type: data.dayType }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            setSession(created.session);
            setSessionNotes('');
            setShowWarmup(true);
          }
        }
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  // Request notification permission when workout actually starts
  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  async function handleChangeDayType(newKey) {
    setShowDayPicker(false);
    let currentSession = session;
    if (currentSession) {
      await apiCall(`/sessions/${currentSession.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: currentSession.completed || 0, notes: sessionNotes, day_type: newKey }),
      });
      setSession(prev => ({ ...prev, day_type: newKey }));
    } else {
      const res = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, date: today, day_type: newKey }),
      });
      if (res.ok) {
        const data = await res.json();
        currentSession = data.session;
        setSession(currentSession);
      }
    }
    setCurrentDayKey(newKey);
    const exRes = await apiCall(`/workouts/${user.id}/${newKey}`);
    if (exRes.ok) setExercises(await exRes.json());
    if (todayData?.isRestDay) {
      setTodayData(prev => ({ ...prev, isRestDay: false }));
      setShowWarmup(true);
    }
  }

  async function handleAddExercise(data) {
    const res = await apiCall(`/workouts/${user.id}/${currentDayKey}/exercise`, {
      method: 'POST', body: JSON.stringify(data),
    });
    if (res.ok) {
      const ex = await res.json();
      setExercises(prev => [...prev, ex]);
    }
  }

  async function handleEditExercise(id, data) {
    const res = await apiCall(`/workouts/exercise/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setExercises(prev => prev.map(e => e.id === id ? updated : e));
    }
  }

  async function handleDeleteExercise(id) {
    await apiCall(`/workouts/exercise/${id}`, { method: 'DELETE' });
    setExercises(prev => prev.filter(e => e.id !== id));
  }

  const handleSetUpdate = useCallback((exerciseName, setNumber, updates) => {
    const key = `${exerciseName}-${setNumber}`;
    setPendingUpdates(prev => ({ ...prev, [key]: { exerciseName, setNumber, ...updates } }));
  }, []);

  async function saveSession(markComplete = false) {
    if (!session) return;
    setSaving(true);
    try {
      const saveResults = await Promise.all(
        Object.values(pendingUpdates).map(async u => {
          const res = await apiCall('/sessions/sets/log', {
            method: 'POST',
            body: JSON.stringify({ session_id: session.id, exercise_name: u.exerciseName, set_number: u.setNumber, weight: u.weight || 0, reps: u.reps || 0, completed: u.completed || false }),
          });
          return res.ok ? await res.json() : null;
        })
      );
      setPendingUpdates({});
      const newPR = saveResults.find(r => r?.isNewPR && r.prWeight > 0);
      if (newPR) setPrCelebration({ exerciseName: newPR.prExercise, weight: newPR.prWeight });

      await apiCall(`/sessions/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: markComplete ? 1 : (session.completed || 0), notes: sessionNotes }),
      });

      if (markComplete) {
        setSession(prev => ({ ...prev, completed: 1 }));
        localStorage.removeItem(timerKey);
        const sumRes = await apiCall(`/sessions/${session.id}/summary`);
        if (sumRes.ok) { setSummaryData(await sumRes.json()); setShowSummary(true); }
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#15121b' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${accentColor}30`, borderTopColor: accentColor }} />
    </div>
  );

  // Rest day screen
  if (todayData?.isRestDay && !session) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in" style={{ background: '#15121b' }}>
      <Moon size={64} className="mb-4" style={{ color: '#4a4455' }} />
      <h2 className="text-2xl font-bold text-[#e8dfee] mb-2">Día de Descanso</h2>
      <p className="text-center text-sm max-w-xs mb-6" style={{ color: '#958da1' }}>
        Hoy toca descanso. Recupera y prepárate para la siguiente sesión.
      </p>
      <button onClick={() => setShowDayPicker(true)} className="px-6 py-3 rounded-full text-sm font-semibold active:scale-95 transition-all"
              style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
        Entrenar de todas formas
      </button>
      {showDayPicker && (
        <DayPickerSheet currentDayKey={currentDayKey} onSelect={handleChangeDayType}
                        onClose={() => setShowDayPicker(false)} accentColor={accentColor} />
      )}
    </div>
  );

  if (showWarmup) return (
    <WarmupScreen
      dayKey={currentDayKey}
      dayName={DAY_NAMES[currentDayKey] || 'Entrenamiento'}
      onStart={() => { setShowWarmup(false); requestNotificationPermission(); }}
      accentColor={accentColor}
    />
  );

  const savedSets = todayData?.sets || [];
  const dayName = DAY_NAMES[currentDayKey] || 'Entrenamiento';

  return (
    <div className="min-h-screen pb-36 fade-in" style={{ background: '#15121b', color: '#e8dfee' }}>

      {/* Header */}
      <header
        className="flex justify-between items-center px-4 w-full sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(21, 18, 27, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: '#4a4455',
          paddingTop: 'max(env(safe-area-inset-top), 0px)',
          height: 'calc(64px + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold truncate" style={{ color: accentColor }}>{dayName}</h1>
            <button
              onClick={() => setShowDayPicker(true)}
              className="text-[10px] px-2 py-0.5 rounded-full shrink-0 active:opacity-70"
              style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
            >
              cambiar
            </button>
          </div>
          <p className="text-[11px]" style={{ color: '#4a4455' }}>{today}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {session?.completed !== 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-mono font-semibold"
                 style={{ background: `${accentColor}15`, color: accentColor }}>
              <Clock size={12} />
              {formatElapsed(elapsedSeconds)}
            </div>
          )}
          {session?.completed === 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-semibold"
                 style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
              <Check size={13} />Completado
            </div>
          )}
          {canEdit && session?.completed !== 1 && (
            <button
              onClick={() => setEditMode(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-all"
              style={editMode
                ? { background: `${accentColor}25`, color: accentColor }
                : { background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
            >
              <Pencil size={15} />
            </button>
          )}
        </div>
      </header>

      {/* Edit mode banner */}
      {editMode && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: `${accentColor}10`, borderBottom: `1px solid ${accentColor}20` }}>
          <span className="text-xs font-medium" style={{ color: accentColor }}>Modo edición — toca ✏️ o 🗑️ en cada ejercicio</span>
          <button onClick={() => setEditMode(false)} className="text-xs font-semibold active:opacity-70" style={{ color: accentColor }}>Listo</button>
        </div>
      )}

      {/* Exercises */}
      <div className="px-4 pt-4 space-y-3">
        {exercises.map(exercise => (
          <ExerciseCard
            key={`${exercise.id || exercise.name}-${exercise.sets}`}
            exercise={exercise}
            sessionId={session?.id}
            savedSets={savedSets.filter(s => s.exercise_name === exercise.name)}
            onSetUpdate={handleSetUpdate}
            accentColor={accentColor}
            editMode={editMode}
            onEdit={ex => { setEditingExercise(ex); setShowExerciseEdit(true); }}
            onDelete={id => handleDeleteExercise(id)}
          />
        ))}

        {exercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell size={48} className="mx-auto mb-4 opacity-20" style={{ color: '#958da1' }} />
            <p style={{ color: '#958da1' }}>No hay ejercicios para hoy</p>
          </div>
        )}

        {/* Add exercise button in edit mode */}
        {editMode && (
          <button
            onClick={() => { setEditingExercise(null); setShowExerciseEdit(true); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold active:scale-[0.98] transition-all"
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px dashed ${accentColor}40` }}
          >
            <Plus size={16} />
            Añadir ejercicio
          </button>
        )}

        {/* Session notes */}
        {exercises.length > 0 && !editMode && (
          <div className="p-4 rounded-2xl" style={glass}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={15} style={{ color: '#958da1' }} />
              <span className="text-sm font-semibold" style={{ color: '#958da1' }}>Notas de sesión</span>
            </div>
            <textarea
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              placeholder="Ej: Hoy subí peso en press banca, muy buen día…"
              className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder-[#4a4455]"
              style={{ color: '#ccc3d8' }}
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Save/Complete buttons */}
      {exercises.length > 0 && !editMode && (
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-md mx-auto"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex gap-3">
            <button
              onClick={() => saveSession(false)}
              disabled={saving || Object.keys(pendingUpdates).length === 0}
              className="flex-1 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#e8dfee', border: `1px solid ${accentColor}40` }}
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Guardado' : 'Guardar'}
            </button>
            <button
              onClick={() => saveSession(true)}
              disabled={saving}
              className="flex-1 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: accentColor, color: '#15121b' }}
            >
              <Check size={18} />Completar
            </button>
          </div>
        </div>
      )}

      {/* Overlays */}
      {showDayPicker && (
        <DayPickerSheet currentDayKey={currentDayKey} onSelect={handleChangeDayType}
                        onClose={() => setShowDayPicker(false)} accentColor={accentColor} />
      )}
      {showExerciseEdit && (
        <ExerciseEditSheet
          exercise={editingExercise}
          accentColor={accentColor}
          onClose={() => { setShowExerciseEdit(false); setEditingExercise(null); }}
          onSave={data => editingExercise
            ? handleEditExercise(editingExercise.id, data)
            : handleAddExercise(data)
          }
        />
      )}
      {prCelebration && (
        <PRCelebration exerciseName={prCelebration.exerciseName} weight={prCelebration.weight}
                       accentColor={accentColor} onDismiss={() => setPrCelebration(null)} />
      )}
      {showSummary && summaryData && (
        <SessionSummary summaryData={summaryData} elapsedSeconds={elapsedSeconds} dayName={dayName}
                        accentColor={accentColor} onClose={() => { setShowSummary(false); navigate('/'); }} />
      )}
    </div>
  );
}
