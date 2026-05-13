import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Plus, X, Minus, FolderOpen } from 'lucide-react';
import NotificationsDrawer from '../components/NotificationsDrawer';

const STATUS = {
  active:    { label: 'Activo',     color: '#89ceff', bg: 'rgba(137,206,255,0.12)' },
  paused:    { label: 'Pausado',    color: '#ffb784', bg: 'rgba(255,183,132,0.12)' },
  completed: { label: 'Completado', color: '#ccc3d8', bg: 'rgba(204,195,216,0.08)' },
};

const PROJECT_COLORS = [
  '#d2bbff', '#89ceff', '#ffb784', '#4ade80',
  '#f472b6', '#fb923c', '#34d399', '#60a5fa',
];

const glass = {
  background: 'rgba(34, 30, 40, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const sheetBg = { background: '#1d1a24' };
const inputStyle = { background: '#100d16', border: '1px solid #4a4455' };

function AddProjectSheet({ onClose, onAdd, accentColor }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(accentColor || '#d2bbff');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), description: description.trim(), color });
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
          <h3 className="text-lg font-bold text-[#e8dfee]">Nuevo proyecto</h3>
          <button
            type="button" onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Nombre del proyecto"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none resize-none"
            style={inputStyle}
            rows={2}
          />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all active:scale-90"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={!title.trim()}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: color, color: '#15121b', opacity: title.trim() ? 1 : 0.4 }}
          >
            Crear proyecto
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function ProjectDetailSheet({ project, onClose, onUpdate }) {
  const [progress, setProgress] = useState(project.progress);
  const [status, setStatus] = useState(project.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSave() {
    setSaving(true);
    await onUpdate(project.id, { progress, status });
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-5 slide-up"
        style={{ ...sheetBg, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 rounded-full" style={{ background: project.color }} />
            <h3 className="text-lg font-bold text-[#e8dfee]">{project.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
          >
            <X size={18} />
          </button>
        </div>

        {project.description && (
          <p className="text-sm text-[#ccc3d8] mb-5">{project.description}</p>
        )}

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1]">Progreso</p>
              <span className="text-sm font-bold" style={{ color: project.color }}>{progress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProgress(Math.max(0, progress - 5))}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
              >
                <Minus size={14} />
              </button>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#100d16' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: project.color }} />
              </div>
              <button
                onClick={() => setProgress(Math.min(100, progress + 5))}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-2">Estado</p>
            <div className="flex gap-2">
              {Object.entries(STATUS).map(([key, { label, color, bg }]) => (
                <button
                  key={key} onClick={() => setStatus(key)}
                  className="flex-1 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: status === key ? bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${status === key ? color : '#4a4455'}`,
                    color: status === key ? color : '#958da1',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: project.color, color: '#15121b' }}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Projects() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);

  const accentColor = user?.color || '#d2bbff';

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiCall(`/projects/${user.id}`);
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }, [user, apiCall]);

  useEffect(() => { if (user) load(); }, [user]);

  async function handleAdd(data) {
    const res = await apiCall('/projects', { method: 'POST', body: JSON.stringify({ user_id: user.id, ...data }) });
    if (res.ok) load();
  }

  async function handleUpdate(id, data) {
    const res = await apiCall(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    if (res.ok) load();
  }

  const filtered = statusFilter === 'all' ? projects : projects.filter(p => p.status === statusFilter);
  const activeCount = projects.filter(p => p.status === 'active').length;

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
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0 active:scale-90 transition-transform"
            style={{ borderColor: accentColor, background: `${accentColor}20`, color: accentColor }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </button>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: accentColor }}>Proyectos</h1>
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

        {/* Hero */}
        <section>
          <h2 className="text-xl font-semibold text-[#e8dfee]">Proyectos Activos</h2>
          <p className="text-sm text-[#ccc3d8] mt-0.5">
            {activeCount > 0
              ? `${activeCount} proyecto${activeCount > 1 ? 's' : ''} en progreso esta semana.`
              : 'No hay proyectos activos esta semana.'}
          </p>
        </section>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            ['all', 'Todos', accentColor],
            ['active', 'Activos', '#89ceff'],
            ['paused', 'Pausados', '#ffb784'],
            ['completed', 'Completados', '#ccc3d8'],
          ].map(([v, l, c]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="px-4 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 shrink-0"
              style={{
                background: statusFilter === v ? `${c}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${statusFilter === v ? c : '#4a4455'}`,
                color: statusFilter === v ? c : '#958da1',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Project cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-sm text-[#958da1]">No hay proyectos aquí.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 text-sm font-semibold"
              style={{ color: accentColor }}
            >
              + Crear proyecto
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(project => {
              const s = STATUS[project.status] || STATUS.active;
              return (
                <div key={project.id} style={glass} className="rounded-xl p-5 flex flex-col gap-5">

                  {/* Top row: status badge + title + icon */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2 flex-1 min-w-0 mr-3">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full self-start"
                        style={{ background: s.bg, border: `1px solid ${s.color}40`, color: s.color }}
                      >
                        {s.label}
                      </span>
                      <h3 className="text-lg font-bold text-[#e8dfee] truncate">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-[#ccc3d8] line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${project.color}20` }}
                    >
                      <FolderOpen size={20} style={{ color: project.color }} />
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-[#958da1]">Completion</span>
                      <span className="text-xs font-bold" style={{ color: project.color }}>{project.progress}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#100d16' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${project.progress}%`, background: project.color }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex justify-between items-center pt-4 border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-[11px] text-[#958da1]">
                      {project.completed_tasks}/{project.task_count} tareas
                    </span>
                    <button
                      onClick={() => setSelected(project)}
                      className="text-sm font-bold active:scale-95 transition-transform"
                      style={{ color: accentColor }}
                    >
                      Ver Detalle →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-xl flex items-center justify-center z-50 active:scale-90 transition-transform shadow-lg"
        style={{ background: accentColor, color: '#15121b' }}
      >
        <Plus size={28} />
      </button>

      {showAdd && (
        <AddProjectSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} accentColor={accentColor} />
      )}
      {selected && (
        <ProjectDetailSheet
          project={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
      {showNotifs && (
        <NotificationsDrawer accentColor={accentColor} onClose={() => setShowNotifs(false)} />
      )}
    </div>
  );
}
