import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RestTimer from '../components/RestTimer';
import {
  Check, ChevronDown, ChevronUp, Timer, Moon, Dumbbell,
  Save, Info, Play, RefreshCw, Clock
} from 'lucide-react';

const DAY_NAMES = {
  upper_a: 'Upper A - Empuje/Tirón',
  lower_a: 'Lower A - Pierna',
  abs_a: 'Abs A (Casa)',
  upper_b: 'Upper B - Empuje/Tirón',
  lower_b: 'Lower B - Pierna',
  abs_b: 'Abs B (Casa)'
};

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
      set.completed ? 'bg-green-500/10' : 'bg-[#0F172A]'
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

    // Auto-show rest timer when completing a set (not un-completing)
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
          {/* Sets header */}
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

          {/* Rest timer button */}
          <button
            onClick={() => setShowTimer(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0F172A] text-slate-400 text-sm active:scale-95 transition-all mt-2"
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
        />
      )}
    </div>
  );
}

export default function Session() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState({});

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#3B82F6';

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
        } else if (!data.isRestDay && data.dayType) {
          // Create session
          const createRes = await apiCall('/sessions', {
            method: 'POST',
            body: JSON.stringify({
              user_id: user.id,
              date: today,
              day_type: data.dayType
            })
          });
          if (createRes.ok) {
            const created = await createRes.json();
            setSession(created.session);
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
    setPendingUpdates(prev => ({
      ...prev,
      [key]: { exerciseName, setNumber, ...updates }
    }));
  }, []);

  async function saveSession() {
    if (!session) return;
    setSaving(true);

    try {
      // Save all pending set updates
      const savePromises = Object.values(pendingUpdates).map(update =>
        apiCall('/sessions/sets/log', {
          method: 'POST',
          body: JSON.stringify({
            session_id: session.id,
            exercise_name: update.exerciseName,
            set_number: update.setNumber,
            weight: update.weight || 0,
            reps: update.reps || 0,
            completed: update.completed || false
          })
        })
      );

      await Promise.all(savePromises);
      setPendingUpdates({});

      // Check if all sets are completed
      const res = await apiCall(`/sessions/${session.id}`);
      if (res.ok) {
        const data = await res.json();
        const allSetsCompleted = data.sets.every(s => s.completed === 1);

        if (allSetsCompleted && data.sets.length > 0) {
          await apiCall(`/sessions/${session.id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: 1, notes: '' })
          });
          setSession(prev => ({ ...prev, completed: 1 }));
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving session:', err);
    }

    setSaving(false);
  }

  async function completeSession() {
    if (!session) return;
    await saveSession();
    await apiCall(`/sessions/${session.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: 1, notes: '' })
    });
    setSession(prev => ({ ...prev, completed: 1 }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (todayData?.isRestDay) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 fade-in">
        <Moon size={64} className="text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Día de Descanso</h2>
        <p className="text-slate-400 text-center max-w-xs">
          Hoy es domingo. Descansa, recupera y prepárate para la semana.
        </p>
        <p className="text-slate-500 text-sm mt-4">
          El descanso es parte del entrenamiento.
        </p>
      </div>
    );
  }

  const exercises = todayData?.exercises || [];
  const savedSets = todayData?.sets || [];
  const dayName = DAY_NAMES[todayData?.dayType] || 'Entrenamiento';

  return (
    <div className="min-h-screen bg-[#0F172A] pb-32 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 sticky top-0 bg-[#0F172A]/95 backdrop-blur z-10"
           style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{dayName}</h1>
            <p className="text-slate-400 text-sm">{today}</p>
          </div>
          <div className="flex items-center gap-2">
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
        {exercises.map((exercise, index) => (
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
      </div>

      {/* Save/Complete buttons */}
      {exercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 space-y-2"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={saveSession}
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
    </div>
  );
}
