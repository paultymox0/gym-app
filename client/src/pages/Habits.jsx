import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Flame, ChevronRight, Trash2, Check, Bell } from 'lucide-react';
import SupplementsSection from '../components/SupplementsSection';
import { MonthlyCalendarModal } from '../components/MonthlyCalendarModal';

const HABIT_COLORS = ['#d2bbff', '#89ceff', '#ffb784', '#4ade80', '#f472b6', '#fb923c', '#34d399', '#60a5fa'];
const EMOJIS = ['✅', '📚', '💧', '🧘', '🏃', '😴', '🥗', '🎯', '✍️', '🎸', '🌿', '💊'];

const glass = {
  background: 'rgba(34, 30, 40, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};
const sheetBg = { background: '#1d1a24' };
const inputStyle = { background: '#100d16', border: '1px solid #4a4455' };

function AddHabitSheet({ onClose, onAdd, accentColor }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [color, setColor] = useState(accentColor || '#d2bbff');

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
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-t-3xl p-5 slide-up"
        style={{ ...sheetBg, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#e8dfee]">Nuevo hábito</h3>
          <button
            type="button" onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-2">Emoji</p>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e} type="button" onClick={() => setEmoji(e)}
                  className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: emoji === e ? `${color}25` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${emoji === e ? color : '#4a4455'}`,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input
            autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="Nombre del hábito"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all active:scale-90"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={!name.trim()}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: color, color: '#15121b', opacity: name.trim() ? 1 : 0.4 }}
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
      <span className="text-sm font-bold text-[#e8dfee]">{streak}</span>
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
  const accentColor = user?.color || '#d2bbff';

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiCall(`/habits/${user.id}`);
    if (res.ok) setHabits(await res.json());
    setLoading(false);
  }, [user, apiCall]);

  useEffect(() => { if (user) load(); }, [user]);

  async function handleToggle(habit) {
    if (habit.type === 'gym') { navigate('/session'); return; }
    setHabits(prev => prev.map(h => h.id === habit.id
      ? { ...h, today_completed: h.today_completed ? 0 : 1, streak: h.today_completed ? Math.max(0, h.streak - 1) : h.streak + 1 }
      : h
    ));
    const res = await apiCall('/habits/log', { method: 'POST', body: JSON.stringify({ user_id: user.id, habit_id: habit.id, date: today }) });
    if (!res.ok) load();
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
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#15121b' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${accentColor}30`, borderTopColor: accentColor }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32" style={{ background: '#15121b', color: '#e8dfee' }}>

      {/* Header */}
      <header
        className="flex justify-between items-center px-4 w-full sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(21, 18, 27, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: '#4a4455',
          paddingTop: 'max(env(safe-area-inset-top), 0px)',
          height: 'calc(64px + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0"
            style={{ borderColor: accentColor, background: `${accentColor}20`, color: accentColor }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: accentColor }}>Hábitos</h1>
            <p className="text-[11px]" style={{ color: '#958da1' }}>{completedToday}/{habits.length} completados hoy</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-all"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          <Plus size={18} />
        </button>
      </header>

      <div className="px-4 pt-4 space-y-3">

        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedToday / habits.length) * 100}%`, background: accentColor }}
            />
          </div>
        )}

        {/* Gym habit */}
        {gymHabit && (
          <div style={{ ...glass, borderRadius: 16 }} className="overflow-hidden">
            <div
              className="p-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
              style={{ background: `${accentColor}0d` }}
              onClick={() => navigate('/session')}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${accentColor}20` }}
              >
                🏋️
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#e8dfee]">Gym</p>
                <p className="text-xs" style={{ color: '#958da1' }}>
                  {gymHabit.today_completed ? 'Sesión completada hoy ✓' : 'Tap para empezar sesión'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StreakBadge streak={gymHabit.streak} color={accentColor} />
                <ChevronRight size={16} style={{ color: '#958da1' }} />
              </div>
            </div>
            <div className="px-4 py-2 flex gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => navigate('/profile')} className="text-xs transition-colors active:text-[#e8dfee]" style={{ color: '#958da1' }}>
                Ver estadísticas →
              </button>
              <button onClick={() => setShowCalendar(true)} className="text-xs transition-colors active:text-[#e8dfee]" style={{ color: '#958da1' }}>
                Calendario →
              </button>
            </div>
          </div>
        )}

        {/* Custom habits */}
        {customHabits.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm" style={{ color: '#958da1' }}>Añade hábitos personalizados</p>
          </div>
        )}

        {customHabits.map(habit => (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ ...glass, borderLeft: `3px solid ${habit.color}` }}
          >
            <button
              onClick={() => handleToggle(habit)}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 active:scale-90 transition-all"
              style={{
                borderColor: habit.today_completed ? habit.color : '#4a4455',
                background: habit.today_completed ? habit.color : 'transparent',
              }}
            >
              {habit.today_completed && <Check size={14} className="text-white" strokeWidth={3} />}
            </button>

            <div className="w-8 h-8 flex items-center justify-center text-xl shrink-0">{habit.emoji}</div>

            <div className="flex-1">
              <p className="font-medium" style={{ color: habit.today_completed ? '#958da1' : '#e8dfee' }}>{habit.name}</p>
            </div>

            <StreakBadge streak={habit.streak} color={habit.color} />

            <button
              onClick={() => handleDelete(habit.id)}
              className="p-1.5 rounded-lg transition-all active:scale-90 ml-1"
              style={{ color: '#4a4455' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a4455'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Supplements */}
        <div className="pt-1">
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
