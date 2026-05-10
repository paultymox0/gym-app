import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEK_DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function formatFullDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dow = d.getDay();
  const dayName = WEEK_DAYS_ES[dow === 0 ? 6 : dow - 1];
  return `${dayName} ${day}/${month}/${year}`;
}

function SessionDetailView({ date, userId, accentColor, apiCall, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiCall(`/sessions/date/${userId}/${date}`);
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error('Error fetching session detail:', err);
      }
      setLoading(false);
    }
    load();
  }, [date]);

  const session = data?.session;
  const sets = data?.sets || [];
  const exercises = data?.exercises || [];

  const setsByExercise = {};
  sets.forEach(s => {
    if (!setsByExercise[s.exercise_name]) setsByExercise[s.exercise_name] = [];
    setsByExercise[s.exercise_name].push(s);
  });

  const dayColor = session ? (DAY_COLORS[session.day_type] || accentColor) : accentColor;
  const dayLabel = session ? (DAY_NAMES[session.day_type] || session.day_type) : '';

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#0D1422] flex items-center justify-center text-slate-400 active:scale-90"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate">{dayLabel}</div>
          <div className="text-xs text-slate-400">{formatFullDate(date)}</div>
        </div>
        {session && (
          session.completed ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 shrink-0">
              Completado
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-400 shrink-0">
              Sin terminar
            </span>
          )
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
          </div>
        ) : !session ? (
          <p className="text-center text-slate-500 py-16">Sin datos para este día</p>
        ) : (
          <>
            {exercises.map((ex, i) => {
              const exSets = (setsByExercise[ex.name] || []).filter(s => s.completed);
              return (
                <div key={i} className="bg-[#0D1422] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-sm">{ex.name}</span>
                    {exSets.length > 0 && (
                      <span className="text-xs text-slate-500">{exSets.length} series</span>
                    )}
                  </div>
                  {exSets.length === 0 ? (
                    <p className="text-xs text-slate-600">Sin series registradas</p>
                  ) : (
                    <div className="space-y-1.5">
                      {exSets.map((s, j) => (
                        <div key={j} className="flex items-center gap-3 text-sm">
                          <span className="text-slate-500 text-xs w-14 shrink-0">Serie {s.set_number}</span>
                          <span className="font-bold text-white">
                            {s.weight > 0 ? `${s.weight}kg` : 'PC'}
                          </span>
                          <span className="text-slate-500">×</span>
                          <span className="font-bold" style={{ color: dayColor }}>{s.reps} reps</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {session.notes ? (
              <div className="bg-[#0D1422] rounded-2xl p-4">
                <div className="text-xs text-slate-500 mb-1.5">Notas de la sesión</div>
                <div className="text-sm text-slate-300 leading-relaxed">{session.notes}</div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function MonthlyCalendarModal({ onClose, accentColor, userId, apiCall }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const today = now.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchMonth() {
      setLoading(true);
      try {
        const res = await apiCall(`/sessions/calendar/${userId}?year=${year}&month=${month}`);
        if (res.ok) setSessions((await res.json()).sessions || []);
      } catch (err) {
        console.error('Error fetching calendar:', err);
      }
      setLoading(false);
    }
    fetchMonth();
  }, [year, month]);

  function prevMonth() {
    setSelectedDate(null);
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    setSelectedDate(null);
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const sessionsByDate = {};
  sessions.forEach(s => { sessionsByDate[s.date] = s; });

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;

  const completedCount = sessions.filter(s => s.completed).length;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#07070F]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        {selectedDate ? (
          <button
            onClick={() => setSelectedDate(null)}
            className="w-9 h-9 rounded-xl bg-[#0D1422] flex items-center justify-center text-slate-400 active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl bg-[#0D1422] flex items-center justify-center text-slate-400 active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="text-center">
          <div className="font-bold text-white">{MONTHS_ES[month - 1]} {year}</div>
          {!selectedDate && !loading && (
            <div className="text-xs text-slate-500">{completedCount} entrenos</div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!selectedDate && (
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl bg-[#0D1422] flex items-center justify-center text-slate-400 active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#0D1422] flex items-center justify-center text-slate-400 active:scale-90"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {selectedDate ? (
        <SessionDetailView
          date={selectedDate}
          userId={userId}
          accentColor={accentColor}
          apiCall={apiCall}
          onBack={() => setSelectedDate(null)}
        />
      ) : (
        <>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1 gap-1 shrink-0">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 px-3 flex-1 content-start">
              {Array.from({ length: 42 }, (_, i) => {
                const dayNum = i - offset + 1;
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <div key={i} className="aspect-square" />;
                }
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const sess = sessionsByDate[dateStr];
                const isToday = dateStr === today;
                const dotColor = sess ? (DAY_COLORS[sess.day_type] || accentColor) : null;

                return (
                  <button
                    key={i}
                    onClick={() => sess && setSelectedDate(dateStr)}
                    disabled={!sess}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
                    style={{
                      backgroundColor: isToday
                        ? `${accentColor}25`
                        : sess
                          ? `${dotColor}18`
                          : 'transparent',
                      border: isToday ? `1.5px solid ${accentColor}50` : 'none'
                    }}
                  >
                    <span className={`text-sm font-semibold leading-none ${
                      isToday ? 'text-white' : sess ? 'text-white' : 'text-slate-600'
                    }`}>
                      {dayNum}
                    </span>
                    {sess && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          {!loading && (
            <div className="px-4 py-3 border-t border-white/5 shrink-0">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                {Object.entries(DAY_NAMES).map(([key, label]) => (
                  sessions.some(s => s.day_type === key) && (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DAY_COLORS[key] }} />
                      <span className="text-xs text-slate-500">{label}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>,
    document.body
  );
}
