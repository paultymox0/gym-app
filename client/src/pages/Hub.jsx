import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Dumbbell, CheckSquare, Briefcase, Zap, FileText,
  ChevronRight, Moon, Flame, Trophy, User
} from 'lucide-react';
import SupplementsSection from '../components/SupplementsSection';

const DAY_NAMES = {
  upper_a: 'Upper A', lower_a: 'Lower A', abs_a: 'Abs A',
  upper_b: 'Upper B', lower_b: 'Lower B', abs_b: 'Abs B',
};

function CompetitionCard({ competition }) {
  if (!competition) return null;
  const { timmy, andrea } = competition;

  function Row({ label, tV, aV, fmt }) {
    const f = fmt || (v => v);
    return (
      <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
        <div className={`flex-1 text-right text-xs font-bold ${tV > aV ? 'text-[#00FF88]' : 'text-slate-400'}`}>{tV > aV && '👑 '}{f(tV)}</div>
        <div className="text-[10px] text-slate-500 w-20 text-center shrink-0">{label}</div>
        <div className={`flex-1 text-left text-xs font-bold ${aV > tV ? 'text-[#BF5FFF]' : 'text-slate-400'}`}>{f(aV)}{aV > tV && ' 👑'}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Timmy vs Andrea</h3>
        <span className="text-[10px] text-slate-500 ml-auto">Este mes</span>
      </div>
      <div className="flex mb-1">
        <div className="flex-1 text-center text-xs font-bold" style={{ color: '#00FF88' }}>Timmy</div>
        <div className="w-20" />
        <div className="flex-1 text-center text-xs font-bold" style={{ color: '#BF5FFF' }}>Andrea</div>
      </div>
      <Row label="Sesiones 💪" tV={timmy.monthSessions} aV={andrea.monthSessions} />
      <Row label="Racha 🔥" tV={timmy.streak} aV={andrea.streak} fmt={v => `${v}d`} />
    </div>
  );
}

export default function Hub() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ gym: null, stats: null, habits: [], tasks: [], projects: [], notes: [], competition: null });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#3B82F6';
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayDisplay = today.split('-').reverse().join('/');

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
      <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  const { gym, stats, habits, tasks, projects, notes, competition } = data;
  const gymStreak = stats?.streak || 0;
  const isRestDay = gym?.isRestDay;
  const gymDayType = gym?.dayType;
  const gymCompleted = gym?.session?.completed;
  const habitsCompleted = habits.filter(h => h.today_completed).length;
  const pendingTasks = tasks.filter(t => !t.completed);
  const highPriority = pendingTasks.filter(t => t.priority === 'high');
  const activeProjects = projects.filter(p => p.status === 'active');
  const recentNote = notes[0];

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      {/* Header */}
      <div className="px-4 pb-3" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">{dayNames[new Date().getDay()]}, {todayDisplay}</p>
            <h1 className="text-2xl font-bold text-white">Mi Hub</h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center border-2 active:scale-90 transition-all"
            style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}15` }}
          >
            <User size={18} style={{ color: accentColor }} />
          </button>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          Hola, <span style={{ color: accentColor }}>{user?.name}</span> 👋
        </p>
      </div>

      <div className="px-4 space-y-3">
        {/* Gym card */}
        <button
          onClick={() => navigate('/session')}
          className="card w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: isRestDay ? '#1E293B' : `${accentColor}20` }}>
                {isRestDay ? <Moon size={22} className="text-slate-400" /> : <Dumbbell size={22} style={{ color: accentColor }} />}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Gym hoy</p>
                <p className="font-semibold text-white text-sm">
                  {isRestDay ? 'Día de descanso' : gymCompleted ? 'Completado ✓' : DAY_NAMES[gymDayType] || 'Empezar sesión'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-right mr-1">
                <div className="flex items-center gap-1">
                  <Flame size={13} style={{ color: accentColor }} />
                  <span className="font-bold text-white text-sm">{gymStreak}</span>
                </div>
                <p className="text-[10px] text-slate-500">días</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </div>
          </div>
        </button>

        {/* 2x2 section grid */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/habits')} className="card text-left active:scale-[0.98] transition-all">
            <Zap size={18} className="mb-2" style={{ color: accentColor }} />
            <p className="text-2xl font-bold text-white">{habitsCompleted}<span className="text-base text-slate-500">/{habits.length}</span></p>
            <p className="text-xs text-slate-400 mt-0.5">Hábitos hoy</p>
          </button>

          <button onClick={() => navigate('/tasks')} className="card text-left active:scale-[0.98] transition-all">
            <CheckSquare size={18} className="mb-2 text-sky-400" />
            <p className="text-2xl font-bold text-white">{pendingTasks.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Tareas
              {highPriority.length > 0 && <span className="text-red-400"> · {highPriority.length} urgente</span>}
            </p>
          </button>

          <button onClick={() => navigate('/projects')} className="card text-left active:scale-[0.98] transition-all">
            <Briefcase size={18} className="mb-2 text-violet-400" />
            <p className="text-2xl font-bold text-white">{activeProjects.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Proyectos activos</p>
          </button>

          <button onClick={() => navigate('/notes')} className="card text-left active:scale-[0.98] transition-all">
            <FileText size={18} className="mb-2 text-amber-400" />
            <p className="text-2xl font-bold text-white">{notes.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Notas</p>
          </button>
        </div>

        {/* High priority tasks */}
        {highPriority.length > 0 && (
          <button onClick={() => navigate('/tasks')} className="card w-full text-left active:scale-[0.98] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-white">Urgente</span>
              <ChevronRight size={14} className="text-slate-500 ml-auto" />
            </div>
            <div className="space-y-2">
              {highPriority.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-slate-600 shrink-0" />
                  <span className="text-sm text-slate-300 truncate">{t.title}</span>
                </div>
              ))}
            </div>
          </button>
        )}

        {/* Recent note */}
        {recentNote && (
          <button onClick={() => navigate('/notes')} className="card w-full text-left active:scale-[0.98] transition-all">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={13} className="text-amber-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Nota reciente</span>
            </div>
            <p className="font-semibold text-white text-sm">{recentNote.title}</p>
            {recentNote.content && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{recentNote.content}</p>}
          </button>
        )}

        {/* Supplements */}
        <SupplementsSection accentColor={accentColor} />

        {/* Competition */}
        <CompetitionCard competition={competition} />
      </div>
    </div>
  );
}
