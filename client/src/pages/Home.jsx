import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Flame, Moon, ChevronRight, Check, Calendar, Trophy, Edit2, X } from 'lucide-react';
import SupplementsSection from '../components/SupplementsSection';
import { MonthlyCalendarModal } from '../components/MonthlyCalendarModal';

const DAY_NAMES = {
  upper_a: 'Upper A',
  lower_a: 'Lower A',
  abs_a: 'Abs A (Casa)',
  upper_b: 'Upper B',
  lower_b: 'Lower B',
  abs_b: 'Abs B (Casa)'
};

const DAY_COLORS = {
  upper_a: '#3B82F6',
  lower_a: '#10B981',
  abs_a: '#F59E0B',
  upper_b: '#8B5CF6',
  lower_b: '#EC4899',
  abs_b: '#F97316'
};

function StreakBadge({ streak, accentColor }) {
  if (streak >= 30) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <span className="fire-animated text-xl">🔥</span>
        <span className="font-bold text-2xl epic-glow" style={{ color: '#F59E0B' }}>{streak}</span>
        <span className="text-slate-400 text-sm">días</span>
      </div>
    );
  }
  if (streak >= 7) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <span className="fire-animated">🔥</span>
        <span className="font-bold text-white">{streak}</span>
        <span className="text-slate-400 text-sm">días</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 justify-end">
      <Flame size={16} style={{ color: accentColor }} />
      <span className="font-bold text-white">{streak}</span>
      <span className="text-slate-400 text-sm">días</span>
    </div>
  );
}

function StreakAlert({ streak, accentColor }) {
  if (streak >= 30) {
    return (
      <div
        className="card text-center py-5"
        style={{ borderColor: '#F59E0B50', backgroundColor: '#F59E0B08' }}
      >
        <div className="flex justify-center gap-1 text-4xl mb-2">
          <span className="fire-animated">🔥</span>
          <span>🏆</span>
          <span className="fire-animated" style={{ animationDelay: '0.3s' }}>🔥</span>
        </div>
        <div className="text-lg font-bold shimmer-gold">¡LEYENDA DEL GYM!</div>
        <div className="text-sm text-slate-300 mt-1">
          {streak} días seguidos. Eres completamente imparable. 🙌
        </div>
      </div>
    );
  }
  if (streak >= 7) {
    return (
      <div
        className="card text-center py-4"
        style={{ borderColor: '#F9731640', backgroundColor: '#F9731608' }}
      >
        <div className="text-3xl mb-1 fire-animated inline-block">🔥</div>
        <div className="font-bold text-orange-400">¡{streak} días en racha!</div>
        <div className="text-xs text-slate-400 mt-0.5">Estás en llamas. ¡Sigue así!</div>
      </div>
    );
  }
  return null;
}

function CompetitionCard({ competition, currentUserId, accentColor }) {
  if (!competition) return null;
  const { timmy, andrea } = competition;

  function StatRow({ label, timmyNum, andreaNum, fmt }) {
    const tWins = timmyNum > andreaNum;
    const aWins = andreaNum > timmyNum;
    const display = fmt || (v => v);
    return (
      <div className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
        <div className={`flex-1 text-right text-sm font-bold ${tWins ? 'text-[#00FF88]' : 'text-slate-400'}`}>
          {tWins && '👑 '}{display(timmyNum)}
        </div>
        <div className="text-xs text-slate-500 w-24 text-center shrink-0">{label}</div>
        <div className={`flex-1 text-left text-sm font-bold ${aWins ? 'text-[#BF5FFF]' : 'text-slate-400'}`}>
          {display(andreaNum)}{aWins && ' 👑'}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-amber-400" />
        <h3 className="font-semibold text-white">Timmy vs Andrea</h3>
        <span className="text-xs text-slate-500 ml-auto">Este mes</span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 text-center">
          <span className="text-sm font-bold" style={{ color: '#00FF88' }}>Timmy</span>
        </div>
        <div className="w-24" />
        <div className="flex-1 text-center">
          <span className="text-sm font-bold" style={{ color: '#BF5FFF' }}>Andrea</span>
        </div>
      </div>

      <StatRow label="Sesiones 💪" timmyNum={timmy.monthSessions} andreaNum={andrea.monthSessions} />
      <StatRow label="Volumen 🏋️" timmyNum={timmy.monthVolume} andreaNum={andrea.monthVolume} fmt={v => `${Math.round(v / 1000)}t`} />
      <StatRow label="Racha 🔥" timmyNum={timmy.streak} andreaNum={andrea.streak} fmt={v => `${v} días`} />
    </div>
  );
}

function DayTypeSelectorSheet({ onClose, onSelect, accentColor }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const options = [
    { value: 'upper_a', label: 'Upper A', color: '#3B82F6' },
    { value: 'lower_a', label: 'Lower A', color: '#10B981' },
    { value: 'abs_a', label: 'Abs A (Casa)', color: '#F59E0B' },
    { value: 'upper_b', label: 'Upper B', color: '#8B5CF6' },
    { value: 'lower_b', label: 'Lower B', color: '#EC4899' },
    { value: 'abs_b', label: 'Abs B (Casa)', color: '#F97316' },
    { value: null, label: 'Descanso', color: '#475569' },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-4 slide-up"
           style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Elegir entreno de hoy</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {options.map(opt => (
            <button
              key={opt.value ?? 'rest'}
              onClick={() => onSelect(opt.value)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#07070F] active:scale-[0.98] transition-all text-left"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${opt.color}20` }}
              >
                {opt.value === null
                  ? <Moon size={20} style={{ color: opt.color }} />
                  : <Dumbbell size={20} style={{ color: opt.color }} />
                }
              </div>
              <span className="font-semibold text-white">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Home() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [stats, setStats] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayDisplay = today.split('-').reverse().join('/');
  const accentColor = user?.color || '#3B82F6';

  // Read day-type override from localStorage (stored per date)
  const overrideKey = `gym_day_override_${today}`;
  const storedOverride = localStorage.getItem(overrideKey);

  // Compute effective display values
  const effectiveIsRest = storedOverride === 'rest' || (!storedOverride && (todayData?.isRestDay ?? true));
  const effectiveDayType = (storedOverride && storedOverride !== 'rest') ? storedOverride : todayData?.dayType;
  const effectiveExercises = (effectiveDayType === todayData?.dayType) ? todayData?.exercises : null;
  const canChangeWorkout = !todayData?.session;

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [sessionRes, statsRes, compRes] = await Promise.all([
        apiCall(`/sessions/today/${user.id}`),
        apiCall(`/stats/${user.id}`),
        apiCall('/stats/competition')
      ]);

      if (sessionRes.ok) setTodayData(await sessionRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (compRes.ok) setCompetition(await compRes.json());
    } catch (err) {
      console.error('Error fetching home data:', err);
    }
    setLoading(false);
  }

  async function handleDaySelect(dayType) {
    setShowDaySelector(false);
    if (dayType === null) {
      localStorage.setItem(overrideKey, 'rest');
    } else {
      localStorage.setItem(overrideKey, dayType);
      try {
        await apiCall('/sessions', {
          method: 'POST',
          body: JSON.stringify({ user_id: user.id, date: today, day_type: dayType })
        });
      } catch (err) {
        console.error('Error pre-creating session:', err);
      }
    }
    fetchData();
  }

  const dayOfWeek = new Date().getDay();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{dayNames[dayOfWeek]}, {todayDisplay}</p>
            <h1 className="text-2xl font-bold text-white">
              Hola, <span style={{ color: accentColor }}>{user?.name}</span> 👋
            </h1>
          </div>
          <div className="text-right">
            {stats && <StreakBadge streak={stats.streak} accentColor={accentColor} />}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Streak special alert */}
        {stats && <StreakAlert streak={stats.streak} accentColor={accentColor} />}

        {/* Today's workout card + change button */}
        <div>
          {effectiveIsRest ? (
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center">
                  <Moon size={24} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-white text-lg">Día de Descanso</h2>
                  <p className="text-slate-400 text-sm">Recuperación activa - descansa bien</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/session')}
              className="card w-full text-left active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${DAY_COLORS[effectiveDayType] || accentColor}20` }}
                  >
                    <Dumbbell size={24} style={{ color: DAY_COLORS[effectiveDayType] || accentColor }} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">
                      {DAY_NAMES[effectiveDayType] || 'Entrenamiento'}
                    </h2>
                    {todayData?.session?.completed ? (
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-green-400" />
                        <span className="text-green-400 text-sm">Completado</span>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        {effectiveExercises?.length || todayData?.exercises?.length || 0} ejercicios
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-500" />
              </div>

              {effectiveExercises && effectiveExercises.length > 0 && (
                <div className="mt-3 space-y-1">
                  {effectiveExercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <span className="text-slate-400 text-sm">{ex.name}</span>
                      <span className="text-slate-600 text-xs ml-auto">{ex.sets}x{ex.reps}</span>
                    </div>
                  ))}
                  {effectiveExercises.length > 3 && (
                    <p className="text-slate-600 text-xs pl-3.5">
                      +{effectiveExercises.length - 3} más...
                    </p>
                  )}
                </div>
              )}
            </button>
          )}

          {/* Change workout type button — only before session is started */}
          {canChangeWorkout && (
            <button
              onClick={() => setShowDaySelector(true)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-sm text-slate-500 active:text-slate-300 active:scale-95 transition-all"
            >
              <Edit2 size={13} />
              Cambiar entreno de hoy
            </button>
          )}
        </div>

        {/* Supplements */}
        <SupplementsSection accentColor={accentColor} />

        {/* Competition section */}
        <CompetitionCard
          competition={competition}
          currentUserId={user?.id}
          accentColor={accentColor}
        />

        {/* Monthly calendar button */}
        <button
          onClick={() => setShowCalendar(true)}
          className="card w-full flex items-center gap-3 active:scale-[0.98] transition-all"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Calendar size={20} style={{ color: accentColor }} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-white">Ver calendario</div>
            <div className="text-xs text-slate-400">Historial de entrenamientos</div>
          </div>
          <ChevronRight size={18} className="text-slate-500" />
        </button>
      </div>

      {showDaySelector && (
        <DayTypeSelectorSheet
          onClose={() => setShowDaySelector(false)}
          onSelect={handleDaySelect}
          accentColor={accentColor}
        />
      )}

      {showCalendar && (
        <MonthlyCalendarModal
          onClose={() => setShowCalendar(false)}
          accentColor={accentColor}
          userId={user?.id}
          apiCall={apiCall}
        />
      )}
    </div>
  );
}
