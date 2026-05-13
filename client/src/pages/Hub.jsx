import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell, Sparkles, CheckSquare, FilePlus,
  Dumbbell, Moon, Flame, Trophy,
} from 'lucide-react';
import SupplementsSection from '../components/SupplementsSection';
import NotificationsDrawer from '../components/NotificationsDrawer';

const DAY_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const SESSION_NAMES = {
  back_biceps: 'Espalda / Bíceps',
  chest_triceps: 'Pecho / Tríceps',
  glute_hamstring: 'Glúteo / Femoral',
  quad_shoulder: 'Cuádriceps / Hombro',
  abs: 'Abdomen Casa',
  upper_a: 'Upper A', lower_a: 'Lower A', abs_a: 'Abs A',
  upper_b: 'Upper B', lower_b: 'Lower B', abs_b: 'Abs B',
};

const QUOTES = [
  '"La disciplina es el puente entre las metas y los logros."',
  '"El éxito es la suma de pequeños esfuerzos repetidos día tras día."',
  '"No se trata de tener tiempo, se trata de hacer tiempo."',
  '"Cada día es una nueva oportunidad para mejorar."',
  '"Lo que no te reta, no te cambia."',
  '"Empieza donde estás. Usa lo que tienes. Haz lo que puedes."',
  '"Un pequeño progreso cada día suma grandes resultados."',
];

const glass = {
  background: 'rgba(34, 30, 40, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

function CompetitionCard({ competition }) {
  if (!competition) return null;
  const { timmy, andrea } = competition;

  function Row({ label, tV, aV, fmt }) {
    const f = fmt || (v => v);
    return (
      <div className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className={`flex-1 text-right text-xs font-bold ${tV > aV ? 'text-[#00FF88]' : 'text-[#958da1]'}`}>
          {tV > aV && '👑 '}{f(tV)}
        </div>
        <div className="text-[10px] text-[#958da1] w-20 text-center shrink-0">{label}</div>
        <div className={`flex-1 text-left text-xs font-bold ${aV > tV ? 'text-[#BF5FFF]' : 'text-[#958da1]'}`}>
          {f(aV)}{aV > tV && ' 👑'}
        </div>
      </div>
    );
  }

  return (
    <div style={glass} className="rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-[#e8dfee]">Timmy vs Andrea</h3>
        <span className="text-[10px] text-[#958da1] ml-auto">Este mes</span>
      </div>
      <div className="flex mb-1">
        <div className="flex-1 text-center text-xs font-bold text-[#00FF88]">Timmy</div>
        <div className="w-20" />
        <div className="flex-1 text-center text-xs font-bold text-[#BF5FFF]">Andrea</div>
      </div>
      <Row label="Sesiones 💪" tV={timmy.monthSessions} aV={andrea.monthSessions} />
      <Row label="Racha 🔥" tV={timmy.streak} aV={andrea.streak} fmt={v => `${v}d`} />
    </div>
  );
}

export default function Hub() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    gym: null, stats: null, habits: [], tasks: [],
    projects: [], notes: [], competition: null,
  });
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  const now = new Date();
  const accentColor = user?.color || '#d2bbff';
  const todayLabel = `${DAY_ES[now.getDay()]}, ${now.getDate()} de ${MONTH_ES[now.getMonth()]}`;
  const quote = QUOTES[now.getDate() % QUOTES.length];

  useEffect(() => { if (user) fetchAll(); }, [user]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [gymRes, statsRes, habitsRes, tasksRes, projectsRes, notesRes, compRes] = await Promise.all([
        apiCall(`/sessions/today/${user.id}`),
        apiCall(`/stats/${user.id}`),
        apiCall(`/habits/${user.id}`),
        apiCall(`/tasks/${user.id}`),
        apiCall(`/projects/${user.id}`),
        apiCall(`/notes/${user.id}`),
        apiCall('/stats/competition'),
      ]);
      setData({
        gym: gymRes.ok ? await gymRes.json() : null,
        stats: statsRes.ok ? await statsRes.json() : null,
        habits: habitsRes.ok ? await habitsRes.json() : [],
        tasks: tasksRes.ok ? await tasksRes.json() : [],
        projects: projectsRes.ok ? await projectsRes.json() : [],
        notes: notesRes.ok ? await notesRes.json() : [],
        competition: compRes.ok ? await compRes.json() : null,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#15121b' }}>
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: `${accentColor}30`, borderTopColor: accentColor }}
        />
      </div>
    );
  }

  const { gym, stats, habits, tasks, competition } = data;
  const gymStreak = stats?.streak || 0;
  const isRestDay = gym?.isRestDay;
  const gymDayType = gym?.dayType;
  const gymCompleted = gym?.session?.completed;
  const habitsCompleted = habits.filter(h => h.today_completed).length;
  const pendingTasks = tasks.filter(t => !t.completed);
  const highPriority = pendingTasks.filter(t => t.priority === 'high');
  const urgentTask = highPriority[0] || pendingTasks[0];

  const summaryText = (() => {
    const parts = [];
    if (pendingTasks.length > 0)
      parts.push(`${pendingTasks.length} tarea${pendingTasks.length > 1 ? 's pendientes' : ' pendiente'}`);
    const left = habits.length - habitsCompleted;
    if (left > 0) parts.push(`${left} hábito${left > 1 ? 's' : ''} para hoy`);
    if (parts.length === 0) return '¡Todo al día! Sigue así 🎉';
    return `Tienes ${parts.join(' y ')}. ¡A por ello!`;
  })();

  const progressFilled = habits.length > 0
    ? Math.round((habitsCompleted / habits.length) * 3)
    : 0;

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
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0 active:scale-90 transition-transform"
            style={{ borderColor: accentColor, background: `${accentColor}20`, color: accentColor }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </button>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: accentColor }}>Mi Hub</h1>
        </div>
        <button
          onClick={() => setShowNotifs(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ color: accentColor }}
        >
          <Bell size={20} />
        </button>
      </header>

      <main className="px-4 pt-6 max-w-2xl mx-auto space-y-6">

        {/* Greeting */}
        <section>
          <h2 className="text-xl font-semibold text-[#e8dfee]">¡Hola, {user?.name}!</h2>
          <p className="text-sm text-[#ccc3d8] mt-0.5">{todayLabel}</p>
        </section>

        {/* AI Summary Card */}
        <section style={glass} className="rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-1 right-1 pointer-events-none select-none">
            <Sparkles size={52} style={{ color: accentColor, opacity: 0.15 }} />
          </div>
          <div className="relative flex flex-col gap-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              Resumen AI
            </span>
            <p className="text-lg font-semibold leading-tight text-[#e8dfee] pr-10">
              {summaryText}
            </p>
          </div>
          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: i < progressFilled ? accentColor : '#4a4455' }}
              />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="flex gap-3">
          <button
            onClick={() => navigate('/tasks')}
            style={glass}
            className="flex-1 p-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <CheckSquare size={18} style={{ color: accentColor }} />
            <span className="text-xs font-semibold text-[#e8dfee]">Nueva Tarea</span>
          </button>
          <button
            onClick={() => navigate('/notes')}
            style={glass}
            className="flex-1 p-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <FilePlus size={18} className="text-[#89ceff]" />
            <span className="text-xs font-semibold text-[#e8dfee]">Nueva Nota</span>
          </button>
        </section>

        {/* Resumen del Día */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest px-1 text-[#ccc3d8]">
            Resumen del Día
          </h3>
          <div className="grid grid-cols-2 gap-3">

            {/* Urgent / pending task */}
            {urgentTask ? (
              <button
                onClick={() => navigate('/tasks')}
                style={{ ...glass, borderLeft: '4px solid #ffb4ab' }}
                className="col-span-2 rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: '#ffb4ab', background: 'rgba(255,180,171,0.1)' }}
                  >
                    {highPriority.length > 0 ? 'Urgente' : 'Pendiente'}
                  </span>
                  <span className="text-[10px] text-[#958da1]">{pendingTasks.length} tareas</span>
                </div>
                <p className="text-base font-semibold text-[#e8dfee] truncate">{urgentTask.title}</p>
                {urgentTask.description && (
                  <p className="text-sm text-[#ccc3d8] mt-0.5 truncate">{urgentTask.description}</p>
                )}
              </button>
            ) : (
              <div
                style={{ ...glass, borderLeft: '4px solid #4a4455' }}
                className="col-span-2 rounded-xl p-4"
              >
                <p className="text-sm font-semibold text-[#e8dfee]">Sin tareas pendientes</p>
                <p className="text-xs text-[#958da1] mt-0.5">¡Todo al día! 🎉</p>
              </div>
            )}

            {/* Gym card */}
            <button
              onClick={() => navigate('/session')}
              style={glass}
              className="rounded-xl p-4 flex flex-col justify-between active:scale-95 transition-transform text-left"
            >
              <div className="mb-2">
                {isRestDay
                  ? <Moon size={28} className="text-[#958da1]" />
                  : <Dumbbell size={28} style={{ color: '#ffb784' }} />
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-[#e8dfee]">
                  {isRestDay ? 'Descanso' : SESSION_NAMES[gymDayType] || 'Gym'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: gymCompleted ? '#ffb784' : '#958da1' }}>
                  {gymCompleted ? 'Completado' : isRestDay ? 'Día libre' : 'Pendiente'}
                </p>
              </div>
            </button>

            {/* Streak card */}
            <button
              onClick={() => navigate('/profile')}
              style={glass}
              className="rounded-xl p-4 flex flex-col justify-between text-left active:scale-95 transition-transform"
            >
              <Flame size={28} style={{ color: accentColor }} />
              <div className="mt-4">
                <p className="text-2xl font-bold text-[#e8dfee]">
                  {gymStreak}
                  <span className="text-sm font-normal text-[#958da1]">d</span>
                </p>
                <p className="text-xs text-[#958da1]">Racha actual</p>
              </div>
            </button>

          </div>
        </section>

        {/* Frase del Día */}
        <section
          className="relative rounded-xl overflow-hidden flex items-center px-6 py-10"
          style={{
            minHeight: '160px',
            background: 'linear-gradient(135deg, rgba(63,0,142,0.85) 0%, rgba(124,58,237,0.55) 55%, rgba(21,18,27,0.98) 100%)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #15121b 0%, rgba(21,18,27,0.3) 60%, transparent 100%)' }}
          />
          <div className="relative z-10 text-center w-full">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest block mb-2"
              style={{ color: accentColor }}
            >
              Frase del Día
            </span>
            <p className="text-base font-semibold italic leading-relaxed text-[#ede0ff]">
              {quote}
            </p>
          </div>
        </section>

        {/* Supplements */}
        <SupplementsSection accentColor={accentColor} />

        {/* Competition */}
        <CompetitionCard competition={competition} />

      </main>

      {showNotifs && (
        <NotificationsDrawer accentColor={accentColor} onClose={() => setShowNotifs(false)} />
      )}
    </div>
  );
}
