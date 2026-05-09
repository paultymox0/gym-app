import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RestTimer from '../components/RestTimer';
import {
  Check, ChevronDown, ChevronUp, Timer, Moon, Dumbbell,
  Save, Info, Play, RefreshCw, Clock, FileText, Flame
} from 'lucide-react';

const DAY_NAMES = {
  upper_a: 'Upper A - Empuje/Tirón',
  lower_a: 'Lower A - Pierna',
  abs_a: 'Abs A (Casa)',
  upper_b: 'Upper B - Empuje/Tirón',
  lower_b: 'Lower B - Pierna',
  abs_b: 'Abs B (Casa)'
};

const WARMUP = {
  upper: [
    { name: 'Rotaciones de hombro', detail: '10 círculos hacia adelante y atrás' },
    { name: 'Band pull-aparts / Face pull ligero', detail: '15 repeticiones lentas' },
    { name: 'Círculos de brazo', detail: '10 hacia adelante + 10 hacia atrás' },
    { name: 'Press ligero (calentamiento)', detail: '15 reps con barra o poco peso' },
  ],
  lower: [
    { name: 'Círculos de cadera', detail: '10 cada lado, lento' },
    { name: 'Swing de pierna', detail: '10 cada pierna hacia adelante/atrás' },
    { name: 'Puente de glúteo', detail: '15 repeticiones, aprieta arriba' },
    { name: 'Sentadilla sin peso', detail: '10 repeticiones, foco en profundidad' },
  ],
  abs: [
    { name: 'Cat-cow (columna)', detail: '10 repeticiones lentas y controladas' },
    { name: 'Bird dog', detail: '10 repeticiones cada lado' },
    { name: 'Dead bug', detail: '8 repeticiones cada lado' },
    { name: 'Plank isométrico', detail: '20-30 segundos, activa el core' },
  ]
};

function getWarmupType(dayType) {
  if (!dayType) return null;
  if (dayType.startsWith('upper')) return 'upper';
  if (dayType.startsWith('lower')) return 'lower';
  if (dayType.startsWith('abs')) return 'abs';
  return null;
}

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}

// ─── Warmup Screen ────────────────────────────────────────────────────────────
function WarmupScreen({ dayType, dayName, onStart, accentColor }) {
  const warmupType = getWarmupType(dayType);
  const exercises = warmupType ? WARMUP[warmupType] : [];

  return (
    <div className="min-h-screen bg-[#07070F] flex flex-col fade-in"
         style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="px-4 pt-8 pb-4">
        <div className="text-center mb-2">
          <div className="text-4xl mb-3">🏃</div>
          <h1 className="text-2xl font-bold text-white">Calentamiento</h1>
          <p className="text-slate-400 text-sm mt-1">{dayName}</p>
        </div>
      </div>

      <div className="px-4 flex-1 space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className="card flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {i + 1}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{ex.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{ex.detail}</div>
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-slate-500 pt-2">
          5-7 minutos · Cuerpo listo para rendir al máximo
        </p>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white active:scale-95 transition-all"
          style={{ backgroundColor: accentColor }}
        >
          ¡Listo, empezar sesión!
        </button>
        <button
          onClick={onStart}
          className="w-full py-2 text-slate-500 text-sm active:scale-95"
        >
          Saltar calentamiento
        </button>
      </div>
    </div>
  );
}

// ─── PR Celebration ───────────────────────────────────────────────────────────
function PRCelebration({ exerciseName, weight, accentColor, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6">
      <div className="relative">
        {/* Confetti */}
        {colors.map((c, i) => (
          <div
            key={i}
            className="confetti-particle"
            style={{
              backgroundColor: c,
              left: `${20 + i * 15}%`,
              top: '-10px',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        <div
          className="bounce-in bg-[#0D1422] border rounded-3xl p-8 text-center"
          style={{ borderColor: `${accentColor}60` }}
        >
          <div className="text-6xl mb-3">🏆</div>
          <div className="text-xl font-bold text-amber-400 shimmer-gold">¡Nuevo récord!</div>
          <div className="text-white font-semibold mt-2 text-sm leading-tight">{exerciseName}</div>
          <div className="text-4xl font-bold mt-2" style={{ color: accentColor }}>{weight}kg</div>
          <div className="text-xs text-slate-500 mt-2">Personal Best ✨</div>
        </div>
      </div>
    </div>
  );
}

// ─── Session Summary Modal ────────────────────────────────────────────────────
function SessionSummary({ summaryData, elapsedSeconds, dayName, accentColor, onClose }) {
  const prevVolume = summaryData.prevSession?.volume || 0;
  const currVolume = summaryData.totalVolume || 0;
  const volumeChangePct = prevVolume > 0
    ? Math.round(((currVolume - prevVolume) / prevVolume) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-6 slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white">¡Sesión completada!</h2>
          <p className="text-slate-400 text-sm mt-1">{dayName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#07070F] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{formatDuration(elapsedSeconds)}</div>
            <div className="text-xs text-slate-400 mt-1">⏱ Duración</div>
          </div>
          <div className="bg-[#07070F] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {Math.round(currVolume).toLocaleString()}kg
            </div>
            <div className="text-xs text-slate-400 mt-1">💪 Volumen total</div>
          </div>
        </div>

        {summaryData.prevSession && (
          <div className="bg-[#07070F] rounded-2xl p-4 mb-4">
            <div className="text-xs text-slate-400 mb-2">
              Comparado con la sesión anterior ({summaryData.prevSession.date})
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Volumen</span>
              <span
                className="font-bold text-lg"
                style={{ color: volumeChangePct >= 0 ? '#10B981' : '#EF4444' }}
              >
                {volumeChangePct >= 0 ? '+' : ''}{volumeChangePct}%
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Antes: {Math.round(prevVolume).toLocaleString()}kg → Ahora: {Math.round(currVolume).toLocaleString()}kg
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg active:scale-95 transition-all"
          style={{ backgroundColor: accentColor }}
        >
          ¡Genial! 💪
        </button>
      </div>
    </div>
  );
}

// ─── SetRow ───────────────────────────────────────────────────────────────────
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
    <div className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
      set.completed ? 'bg-green-500/10' : 'bg-[#07070F]'
    }`}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
      >
        {setNumber}
      </div>

      {!isTime ? (
        <>
          <div className="flex-1">
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              onBlur={handleBlur}
              placeholder="kg"
              className="w-full bg-transparent text-white text-center text-sm font-semibold focus:outline-none placeholder-slate-600"
              inputMode="decimal"
            />
            <div className="text-xs text-slate-500 text-center">kg</div>
          </div>

          <div className="w-px h-8 bg-[#334155]" />

          <div className="flex-1">
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              onBlur={handleBlur}
              placeholder="reps"
              className="w-full bg-transparent text-white text-center text-sm font-semibold focus:outline-none placeholder-slate-600"
              inputMode="numeric"
            />
            <div className="text-xs text-slate-500 text-center">reps</div>
          </div>
        </>
      ) : (
        <div className="flex-1 text-center">
          <span className="text-slate-300 text-sm">{set.repsTarget || '—'}</span>
        </div>
      )}

      <button
        onClick={handleComplete}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${
          set.completed ? 'bg-green-500 text-white' : 'bg-[#334155] text-slate-400'
        }`}
      >
        <Check size={16} />
      </button>
    </div>
  );
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, sessionId, userId, savedSets, onSetUpdate, accentColor }) {
  const [expanded, setExpanded] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [localSets, setLocalSets] = useState(() => {
    return Array.from({ length: exercise.sets }, (_, i) => {
      const saved = savedSets?.find(s => s.set_number === i + 1);
      return {
        set_number: i + 1,
        weight: saved?.weight || 0,
        reps: saved?.reps || 0,
        completed: saved?.completed === 1 || false,
        repsTarget: exercise.reps
      };
    });
  });

  const completedSets = localSets.filter(s => s.completed).length;
  const allDone = completedSets === exercise.sets;

  const handleSetUpdate = async (setNumber, updates) => {
    const newSets = localSets.map(s =>
      s.set_number === setNumber ? { ...s, ...updates } : s
    );
    setLocalSets(newSets);
    onSetUpdate(exercise.name, setNumber, updates);

    if (updates.completed && !localSets.find(s => s.set_number === setNumber)?.completed) {
      setShowTimer(true);
    }
  };

  return (
    <div className={`card border ${allDone ? 'border-green-500/30' : 'border-[#334155]'} transition-all`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
            allDone ? 'bg-green-500/20 text-green-400' : ''
          }`}
          style={!allDone ? { backgroundColor: `${accentColor}15`, color: accentColor } : undefined}
        >
          {allDone ? <Check size={18} /> : <Dumbbell size={18} />}
        </div>

        <div className="flex-1 text-left">
          <div className="font-semibold text-white text-sm leading-tight">{exercise.name}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {exercise.sets} series × {exercise.reps}
            {exercise.rest && ` • ${exercise.rest}s descanso`}
          </div>
          {exercise.notes && (
            <div className="text-xs text-amber-400/80 mt-0.5 flex items-start gap-1">
              <Info size={10} className="shrink-0 mt-0.5" />
              {exercise.notes}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold" style={{ color: completedSets === exercise.sets ? '#10B981' : accentColor }}>
            {completedSets}/{exercise.sets}
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 fade-in">
          <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
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

          {localSets.map((set) => (
            <SetRow
              key={set.set_number}
              set={set}
              setNumber={set.set_number}
              onUpdate={handleSetUpdate}
              accentColor={accentColor}
              isTime={exercise.isTime}
            />
          ))}

          <button
            onClick={() => setShowTimer(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#07070F] text-slate-400 text-sm active:scale-95 transition-all mt-2"
          >
            <Clock size={15} />
            Iniciar descanso {exercise.rest && `(${exercise.rest}s)`}
          </button>
        </div>
      )}

      {showTimer && (
        <RestTimer
          defaultTime={exercise.rest || 60}
          onClose={() => setShowTimer(false)}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}

// ─── Main Session Page ────────────────────────────────────────────────────────
export default function Session() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [session, setSession] = useState(null);
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

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#3B82F6';
  const timerKey = `session_start_${user?.id}_${today}`;

  // Timer
  useEffect(() => {
    if (!user || loading || session?.completed === 1) return;

    let start = parseInt(localStorage.getItem(timerKey) || '0');
    if (!start) {
      start = Date.now();
      localStorage.setItem(timerKey, String(start));
    }
    setElapsedSeconds(Math.floor((Date.now() - start) / 1000));

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [user, loading, session?.completed, timerKey]);

  useEffect(() => {
    if (!user) return;
    loadSession();
  }, [user]);

  async function loadSession() {
    setLoading(true);
    try {
      const res = await apiCall(`/sessions/today/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTodayData(data);

        if (data.session) {
          setSession(data.session);
          setSessionNotes(data.session.notes || '');
          // Only show warmup if no sets logged yet and not completed
          if (!data.isRestDay && data.session.completed !== 1 && (!data.sets || data.sets.length === 0)) {
            setShowWarmup(true);
          }
        } else if (!data.isRestDay && data.dayType) {
          const createRes = await apiCall('/sessions', {
            method: 'POST',
            body: JSON.stringify({ user_id: user.id, date: today, day_type: data.dayType })
          });
          if (createRes.ok) {
            const created = await createRes.json();
            setSession(created.session);
            setSessionNotes('');
            setShowWarmup(true);
          }
        }
      }
    } catch (err) {
      console.error('Error loading session:', err);
    }
    setLoading(false);
  }

  const handleSetUpdate = useCallback((exerciseName, setNumber, updates) => {
    const key = `${exerciseName}-${setNumber}`;
    setPendingUpdates(prev => ({ ...prev, [key]: { exerciseName, setNumber, ...updates } }));
  }, []);

  async function saveSession(markComplete = false) {
    if (!session) return;
    setSaving(true);

    try {
      // Save all pending set updates and collect PR results
      const saveResults = await Promise.all(
        Object.values(pendingUpdates).map(async update => {
          const res = await apiCall('/sessions/sets/log', {
            method: 'POST',
            body: JSON.stringify({
              session_id: session.id,
              exercise_name: update.exerciseName,
              set_number: update.setNumber,
              weight: update.weight || 0,
              reps: update.reps || 0,
              completed: update.completed || false
            })
          });
          return res.ok ? await res.json() : null;
        })
      );

      setPendingUpdates({});

      // Check for new PRs
      const newPR = saveResults.find(r => r?.isNewPR && r.prWeight > 0);
      if (newPR) {
        setPrCelebration({ exerciseName: newPR.prExercise, weight: newPR.prWeight });
      }

      // Save notes
      await apiCall(`/sessions/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: markComplete ? 1 : (session.completed || 0), notes: sessionNotes })
      });

      if (markComplete) {
        setSession(prev => ({ ...prev, completed: 1 }));
        localStorage.removeItem(timerKey);

        // Fetch summary
        const summaryRes = await apiCall(`/sessions/${session.id}/summary`);
        if (summaryRes.ok) {
          setSummaryData(await summaryRes.json());
          setShowSummary(true);
        }
      } else {
        // Auto-mark complete if all sets done
        const res = await apiCall(`/sessions/${session.id}`);
        if (res.ok) {
          const data = await res.json();
          const allDone = data.sets.length > 0 && data.sets.every(s => s.completed === 1);
          if (allDone) {
            await apiCall(`/sessions/${session.id}`, {
              method: 'PUT',
              body: JSON.stringify({ completed: 1, notes: sessionNotes })
            });
            setSession(prev => ({ ...prev, completed: 1 }));
          }
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }

    setSaving(false);
  }

  async function completeSession() {
    await saveSession(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (todayData?.isRestDay) {
    return (
      <div className="min-h-screen bg-[#07070F] flex flex-col items-center justify-center p-6 fade-in">
        <Moon size={64} className="text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Día de Descanso</h2>
        <p className="text-slate-400 text-center max-w-xs">
          Hoy es domingo. Descansa, recupera y prepárate para la semana.
        </p>
        <p className="text-slate-500 text-sm mt-4">El descanso es parte del entrenamiento.</p>
      </div>
    );
  }

  if (showWarmup) {
    return (
      <WarmupScreen
        dayType={todayData?.dayType}
        dayName={DAY_NAMES[todayData?.dayType] || 'Entrenamiento'}
        onStart={() => setShowWarmup(false)}
        accentColor={accentColor}
      />
    );
  }

  const exercises = todayData?.exercises || [];
  const savedSets = todayData?.sets || [];
  const dayName = DAY_NAMES[todayData?.dayType] || 'Entrenamiento';

  return (
    <div className="min-h-screen bg-[#07070F] pb-36 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 sticky top-0 bg-[#07070F]/95 backdrop-blur z-10"
           style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{dayName}</h1>
            <p className="text-slate-400 text-sm">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            {session?.completed !== 1 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-semibold"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                <Clock size={13} />
                {formatElapsed(elapsedSeconds)}
              </div>
            )}
            {session?.completed === 1 && (
              <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl text-sm font-semibold">
                <Check size={14} />
                ¡Completado!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="px-4 space-y-3">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            sessionId={session?.id}
            userId={user?.id}
            savedSets={savedSets.filter(s => s.exercise_name === exercise.name)}
            onSetUpdate={handleSetUpdate}
            accentColor={accentColor}
          />
        ))}

        {exercises.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Dumbbell size={48} className="mx-auto mb-4 opacity-30" />
            <p>No hay ejercicios para hoy</p>
          </div>
        )}

        {/* Session notes */}
        {exercises.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-300">Notas de sesión</span>
            </div>
            <textarea
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              placeholder="Ej: Hoy me dolía el hombro, subí peso en press banca, muy buen día…"
              className="w-full bg-[#07070F] border border-white/8 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-white/20 placeholder-slate-600"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Save/Complete buttons */}
      {exercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={() => saveSession(false)}
              disabled={saving || Object.keys(pendingUpdates).length === 0}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
              style={{ backgroundColor: '#1E293B', border: `1px solid ${accentColor}40` }}
            >
              {saving ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : saved ? (
                <Check size={18} />
              ) : (
                <Save size={18} />
              )}
              {saved ? 'Guardado' : 'Guardar'}
            </button>

            <button
              onClick={completeSession}
              disabled={saving}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <Check size={18} />
              Completar
            </button>
          </div>
        </div>
      )}

      {/* PR Celebration overlay */}
      {prCelebration && (
        <PRCelebration
          exerciseName={prCelebration.exerciseName}
          weight={prCelebration.weight}
          accentColor={accentColor}
          onDismiss={() => setPrCelebration(null)}
        />
      )}

      {/* Session Summary modal */}
      {showSummary && summaryData && (
        <SessionSummary
          summaryData={summaryData}
          elapsedSeconds={elapsedSeconds}
          dayName={dayName}
          accentColor={accentColor}
          onClose={() => { setShowSummary(false); navigate('/'); }}
        />
      )}
    </div>
  );
}
