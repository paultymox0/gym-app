import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, ChevronRight, Minus } from 'lucide-react';

const STATUS_COLORS = { active: '#10B981', paused: '#F59E0B', completed: '#64748B' };
const STATUS_LABELS = { active: 'Activo', paused: 'Pausado', completed: 'Completado' };

const PROJECT_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'];

function AddProjectSheet({ onClose, onAdd, accentColor }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={handleSubmit}
        className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-5 slide-up"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Nuevo proyecto</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del proyecto" className="input-dark w-full" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="input-dark w-full resize-none" rows={2} />

          <div>
            <p className="text-xs text-slate-400 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all active:scale-90"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: color, color: '#fff', opacity: title.trim() ? 1 : 0.4 }}
          >
            Crear proyecto
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function ProjectDetailSheet({ project, onClose, onUpdate, accentColor }) {
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-5 slide-up" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{project.title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90"><X size={18} /></button>
        </div>

        {project.description && <p className="text-slate-400 text-sm mb-4">{project.description}</p>}

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">Progreso</p>
              <span className="text-sm font-bold" style={{ color: project.color }}>{progress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setProgress(Math.max(0, progress - 5))} className="w-8 h-8 rounded-xl bg-[#07070F] flex items-center justify-center text-slate-400 active:scale-90">
                <Minus size={14} />
              </button>
              <div className="flex-1 h-3 rounded-full bg-[#07070F] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
              </div>
              <button onClick={() => setProgress(Math.min(100, progress + 5))} className="w-8 h-8 rounded-xl bg-[#07070F] flex items-center justify-center text-slate-400 active:scale-90">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">Estado</p>
            <div className="flex gap-2">
              {['active', 'paused', 'completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor: status === s ? `${STATUS_COLORS[s]}20` : '#07070F',
                    border: `1px solid ${status === s ? STATUS_COLORS[s] : '#1E293B'}`,
                    color: status === s ? STATUS_COLORS[s] : '#64748B',
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-2xl font-semibold text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: project.color }}
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
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const accentColor = user?.color || '#3B82F6';

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

  async function handleDelete(id) {
    await apiCall(`/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const filtered = statusFilter === 'all' ? projects : projects.filter(p => p.status === statusFilter);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      <div className="px-4 pb-3" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          {[['all', 'Todos'], ['active', 'Activos'], ['paused', 'Pausados'], ['completed', 'Completados']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 shrink-0"
              style={{
                backgroundColor: statusFilter === v ? `${v === 'all' ? accentColor : STATUS_COLORS[v]}20` : '#0E1520',
                color: statusFilter === v ? (v === 'all' ? accentColor : STATUS_COLORS[v]) : '#64748B',
                border: `1px solid ${statusFilter === v ? `${v === 'all' ? accentColor : STATUS_COLORS[v]}50` : '#1E293B'}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-slate-400 text-sm">No hay proyectos aquí.</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 text-sm" style={{ color: accentColor }}>
              + Crear proyecto
            </button>
          </div>
        )}

        {filtered.map(project => (
          <div key={project.id} className="bg-[#0E1520] rounded-2xl overflow-hidden">
            {/* Color top strip */}
            <div className="h-1" style={{ backgroundColor: project.color }} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{project.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLORS[project.status]}20`, color: STATUS_COLORS[project.status] }}>
                      {STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  {project.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{project.description}</p>}
                </div>
                <button onClick={() => setSelected(project)} className="p-1.5 text-slate-500 active:text-white active:scale-90 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{project.completed_tasks}/{project.task_count} tareas</span>
                  <span className="text-xs font-bold" style={{ color: project.color }}>{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#07070F] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddProjectSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} accentColor={accentColor} />}
      {selected && (
        <ProjectDetailSheet
          project={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}
