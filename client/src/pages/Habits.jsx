import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Flame, ChevronRight, Trash2, Check } from 'lucide-react';
import SupplementsSection from '../components/SupplementsSection';
import { MonthlyCalendarModal } from '../components/MonthlyCalendarModal';

const HABIT_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'];
const EMOJIS = ['✅', '📚', '💧', '🧘', '🏃', '😴', '🥗', '🎯', '✍️', '🎸', '🌿', '💊'];

function AddHabitSheet({ onClose, onAdd, accentColor }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd({ name: name.trim(), emoji, color });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={handleSubmit}
        className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-5 slide-up"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Nuevo hábito</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-2">Emoji</p>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e} type="button" onClick={() => setEmoji(e)}
                  className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ backgroundColor: emoji === e ? `${color}30` : '#07070F', border: `1px solid ${emoji === e ? color : '#1E293B'}` }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del hábito" className="input-dark w-full" />

          <div>
            <p className="text-xs text-slate-400 mb-2">Color</p>
            <div className="flex gap-2">
              {HABIT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all active:scale-90"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: color, color: '#fff', opacity: name.trim() ? 1 : 0.4 }}
          >
            Crear hábito
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function StreakBadge({ streak, color }) {
  if (!streak) return null;
  if (streak >= 7) return (
    <div className="flex items-center gap-1">
      <span className="fire-animated text-sm">🔥</span>
      <span className="text-sm font-bold" style={{ color }}>{streak}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <Flame size={13} style={{ color }} />
      <span className="text-sm font-bold text-white">{streak}</span>
    </div>
  );
}

export default function Habits() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#3B82F6';

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiCall(`/habits/${user.id}`);
    if (res.ok) setHabits(await res.json());
    setLoading(false);
  }, [user, apiCall]);

  useEffect(() => { if (user) load(); }, [user]);

  async function handleToggle(habit) {
    if (habit.type === 'gym') {
      navigate('/session');
      return;
    }
    // Optimistic update
    setHabits(prev => prev.map(h => h.id === habit.id
      ? { ...h, today_completed: h.today_completed ? 0 : 1, streak: h.today_completed ? Math.max(0, h.streak - 1) : h.streak + 1 }
      : h
    ));
    const res = await apiCall('/habits/log', { method: 'POST', body: JSON.stringify({ user_id: user.id, habit_id: habit.id, date: today }) });
    if (!res.ok) load(); // revert on error
  }

  async function handleDelete(id) {
    await apiCall(`/habits/${id}`, { method: 'DELETE' });
    setHabits(prev => prev.filter(h => h.id !== id));
  }

  async function handleAdd(data) {
    const res = await apiCall('/habits', { method: 'POST', body: JSON.stringify({ user_id: user.id, ...data }) });
    if (res.ok) load();
  }

  const gymHabit = habits.find(h => h.type === 'gym');
  const customHabits = habits.filter(h => h.type !== 'gym');
  const completedToday = habits.filter(h => h.today_completed).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      <div className="px-4 pb-3" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hábitos</h1>
            <p className="text-slate-500 text-sm mt-0.5">{completedToday}/{habits.length} completados hoy</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="mt-3 h-1.5 rounded-full bg-[#0E1520] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${habits.length ? (completedToday / habits.length) * 100 : 0}%`, backgroundColor: accentColor }}
            />
          </div>
        )}
      </div>

      <div className="px-4 space-y-2">
        {/* Gym habit — special card */}
        {gymHabit && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accentColor}40` }}>
            <div
              className="p-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
              style={{ backgroundColor: `${accentColor}10` }}
              onClick={() => navigate('/session')}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${accentColor}20` }}>
                🏋️
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">Gym</p>
                <p className="text-xs text-slate-400">
                  {gymHabit.today_completed ? 'Sesión completada hoy ✓' : 'Tap para empezar sesión'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StreakBadge streak={gymHabit.streak} color={accentColor} />
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </div>
            <div className="px-4 py-2 bg-[#07070F] flex gap-3">
              <button onClick={() => navigate('/profile')} className="text-xs text-slate-400 active:text-white transition-colors">
                Ver estadísticas →
              </button>
              <button onClick={() => setShowCalendar(true)} className="text-xs text-slate-400 active:text-white transition-colors">
                Calendario →
              </button>
            </div>
          </div>
        )}

        {/* Custom habits */}
        {customHabits.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-slate-400 text-sm">Añade hábitos personalizados</p>
          </div>
        )}

        {customHabits.map(habit => (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#0E1520]"
            style={{ borderLeft: `3px solid ${habit.color}` }}
          >
            <button
              onClick={() => handleToggle(habit)}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 active:scale-90 transition-all"
              style={{
                borderColor: habit.today_completed ? habit.color : '#334155',
                backgroundColor: habit.today_completed ? habit.color : 'transparent',
              }}
            >
              {habit.today_completed && <Check size={14} className="text-white" strokeWidth={3} />}
            </button>

            <div className="w-8 h-8 flex items-center justify-center text-xl shrink-0">{habit.emoji}</div>

            <div className="flex-1">
              <p className={`font-medium ${habit.today_completed ? 'text-slate-400' : 'text-white'}`}>{habit.name}</p>
            </div>

            <StreakBadge streak={habit.streak} color={habit.color} />

            <button
              onClick={() => handleDelete(habit.id)}
              className="p-1.5 rounded-lg text-slate-700 active:text-red-400 active:scale-90 transition-all ml-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Supplements section */}
        <div className="pt-2">
          <SupplementsSection accentColor={accentColor} />
        </div>
      </div>

      {showAdd && <AddHabitSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} accentColor={accentColor} />}
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
