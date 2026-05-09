import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Apple, Pill, Flame, TrendingUp, Moon, ChevronRight, Check, Calendar } from 'lucide-react';

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

function CalorieRing({ current, goal, color }) {
  const percentage = Math.min((current / goal) * 100, 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{current}</span>
        <span className="text-xs text-slate-400">/ {goal}</span>
        <span className="text-xs text-slate-500">kcal</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#3B82F6';

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [sessionRes, nutritionRes, suppRes, statsRes] = await Promise.all([
        apiCall(`/sessions/today/${user.id}`),
        apiCall(`/nutrition/${user.id}/${today}`),
        apiCall(`/supplements/${user.id}/${today}`),
        apiCall(`/stats/${user.id}`)
      ]);

      if (sessionRes.ok) setTodayData(await sessionRes.json());
      if (nutritionRes.ok) setNutrition(await nutritionRes.json());
      if (suppRes.ok) setSupplements((await suppRes.json()).supplements || []);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Error fetching home data:', err);
    }
    setLoading(false);
  }

  async function toggleSupplement(suppName, currentTaken) {
    try {
      const res = await apiCall('/supplements/toggle', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          date: today,
          supplement_name: suppName,
          taken: !currentTaken
        })
      });
      if (res.ok) {
        setSupplements(prev =>
          prev.map(s => s.name === suppName ? { ...s, taken: !currentTaken } : s)
        );
      }
    } catch (err) {
      console.error('Error toggling supplement:', err);
    }
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

  const caloriesConsumed = nutrition?.totals?.calories || 0;
  const caloriesGoal = user?.calories_goal || 2000;
  const supplementsTaken = supplements.filter(s => s.taken).length;
  const supplementsTotal = supplements.length;

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{dayNames[dayOfWeek]}, {today}</p>
            <h1 className="text-2xl font-bold text-white">
              Hola, <span style={{ color: accentColor }}>{user?.name}</span> 👋
            </h1>
          </div>
          <div className="text-right">
            {stats && (
              <div className="flex items-center gap-1 justify-end">
                <Flame size={16} style={{ color: accentColor }} />
                <span className="font-bold text-white">{stats.streak}</span>
                <span className="text-slate-400 text-sm">días</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Today's workout card */}
        {todayData?.isRestDay ? (
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center">
                <Moon size={24} className="text-slate-400" />
              </div>
              <div>
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
                  style={{ backgroundColor: `${DAY_COLORS[todayData?.dayType] || accentColor}20` }}
                >
                  <Dumbbell size={24} style={{ color: DAY_COLORS[todayData?.dayType] || accentColor }} />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">
                    {DAY_NAMES[todayData?.dayType] || 'Entrenamiento'}
                  </h2>
                  {todayData?.session?.completed ? (
                    <div className="flex items-center gap-1">
                      <Check size={14} className="text-green-400" />
                      <span className="text-green-400 text-sm">Completado</span>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      {todayData?.exercises?.length || 0} ejercicios
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-500" />
            </div>

            {/* Exercise preview */}
            {todayData?.exercises && todayData.exercises.length > 0 && (
              <div className="mt-3 space-y-1">
                {todayData.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="text-slate-400 text-sm">{ex.name}</span>
                    <span className="text-slate-600 text-xs ml-auto">{ex.sets}x{ex.reps}</span>
                  </div>
                ))}
                {todayData.exercises.length > 3 && (
                  <p className="text-slate-600 text-xs pl-3.5">
                    +{todayData.exercises.length - 3} más...
                  </p>
                )}
              </div>
            )}
          </button>
        )}

        {/* Calorie summary */}
        <button
          onClick={() => navigate('/nutrition')}
          className="card w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Apple size={20} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Nutrición Hoy</h3>
            </div>
            <ChevronRight size={18} className="text-slate-500" />
          </div>

          <div className="flex items-center gap-6">
            <CalorieRing
              current={caloriesConsumed}
              goal={caloriesGoal}
              color={accentColor}
            />
            <div className="flex-1 space-y-3">
              {[
                { label: 'Proteína', value: nutrition?.totals?.protein || 0, unit: 'g', color: '#F59E0B' },
                { label: 'Grasas', value: nutrition?.totals?.fat || 0, unit: 'g', color: '#EC4899' },
                { label: 'Carbos', value: nutrition?.totals?.carbs || 0, unit: 'g', color: '#10B981' }
              ].map(macro => (
                <div key={macro.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{macro.label}</span>
                    <span className="font-semibold" style={{ color: macro.color }}>
                      {macro.value.toFixed(0)}{macro.unit}
                    </span>
                  </div>
                </div>
              ))}

              <div className="text-sm text-slate-400">
                {caloriesGoal - caloriesConsumed > 0
                  ? `Faltan ${caloriesGoal - caloriesConsumed} kcal`
                  : `+${caloriesConsumed - caloriesGoal} kcal extra`
                }
              </div>
            </div>
          </div>
        </button>

        {/* Supplements */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pill size={20} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Suplementos</h3>
            </div>
            <span className="text-sm font-semibold" style={{ color: accentColor }}>
              {supplementsTaken}/{supplementsTotal}
            </span>
          </div>

          <div className="space-y-2">
            {supplements.map(supp => (
              <button
                key={supp.name}
                onClick={() => toggleSupplement(supp.name, supp.taken)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#07070F] active:scale-[0.98] transition-all"
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    supp.taken ? 'text-white' : 'bg-[#0D1422]'
                  }`}
                  style={{ backgroundColor: supp.taken ? accentColor : undefined }}
                >
                  {supp.taken ? <Check size={14} /> : null}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${supp.taken ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {supp.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {supp.time === 'morning' ? 'Mañana' :
                     supp.time === 'post-workout' ? 'Post-entreno' :
                     supp.time === 'lunch' ? 'Almuerzo' :
                     supp.time === 'before-sleep' ? 'Antes de dormir' : supp.time}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
              <div className="text-xs text-slate-400 mt-1">Sesiones</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold" style={{ color: accentColor }}>{stats.streak}</div>
              <div className="text-xs text-slate-400 mt-1">Racha días</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-white">
                {stats.latestWeight ? `${stats.latestWeight}` : '--'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Peso (kg)</div>
            </div>
          </div>
        )}

        {/* Weekly overview */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} style={{ color: accentColor }} />
            <h3 className="font-semibold text-white">Esta Semana</h3>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => {
              const types = ['upper_a', 'lower_a', 'abs_a', 'upper_b', 'lower_b', 'abs_b', null];
              const type = types[i];
              // 0=Sunday in JS; Monday is index 1
              const jsDay = i + 1 === 7 ? 0 : i + 1;
              const isToday = dayOfWeek === jsDay;

              return (
                <div
                  key={day}
                  className={`rounded-xl p-2 text-center ${isToday ? 'ring-2' : ''}`}
                  style={{
                    backgroundColor: type ? `${DAY_COLORS[type]}20` : '#0F172A',
                    ringColor: accentColor
                  }}
                >
                  <div className={`text-xs font-medium ${isToday ? 'text-white' : 'text-slate-400'}`}>
                    {day}
                  </div>
                  <div className="mt-1 text-xs font-bold" style={{ color: type ? DAY_COLORS[type] : '#475569' }}>
                    {type ? type.split('_').map(p => p[0].toUpperCase()).join('') : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
