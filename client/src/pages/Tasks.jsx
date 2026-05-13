import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Check, Trash2, ChevronDown } from 'lucide-react';

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#3B82F6' };
const PRIORITY_LABELS = { high: 'Alta', medium: 'Media', low: 'Baja' };

function AddTaskSheet({ onClose, onAdd, projects, accentColor }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({ title: title.trim(), description: description.trim(), priority, project_id: projectId || null });
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
          <h3 className="text-lg font-bold text-white">Nueva tarea</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título de la tarea"
            className="input-dark w-full"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="input-dark w-full"
          />

          <div>
            <p className="text-xs text-slate-400 mb-2">Prioridad</p>
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor: priority === p ? `${PRIORITY_COLORS[p]}25` : '#07070F',
                    border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : '#1E293B'}`,
                    color: priority === p ? PRIORITY_COLORS[p] : '#64748B',
                  }}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 && (
            <div className="relative">
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="input-dark w-full appearance-none"
              >
                <option value="">Sin proyecto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="btn-primary w-full py-3 rounded-2xl font-semibold"
            style={{ backgroundColor: accentColor, color: '#07070F', opacity: title.trim() ? 1 : 0.4 }}
          >
            Añadir tarea
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default function Tasks() {
  const { user, apiCall } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const accentColor = user?.color || '#3B82F6';

  const load = useCallback(async () => {
    setLoading(true);
    const [tRes, pRes] = await Promise.all([apiCall(`/tasks/${user.id}`), apiCall(`/projects/${user.id}`)]);
    if (tRes.ok) setTasks(await tRes.json());
    if (pRes.ok) setProjects(await pRes.json());
    setLoading(false);
  }, [user, apiCall]);

  useEffect(() => { if (user) load(); }, [user]);

  async function handleToggle(task) {
    const res = await apiCall(`/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) });
    if (res.ok) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  }

  async function handleDelete(id) {
    await apiCall(`/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function handleAdd(data) {
    await apiCall('/tasks', { method: 'POST', body: JSON.stringify({ user_id: user.id, ...data }) });
    load();
  }

  const filtered = tasks
    .filter(t => statusFilter === 'all' ? true : statusFilter === 'pending' ? !t.completed : t.completed)
    .filter(t => priorityFilter === 'all' ? true : t.priority === priorityFilter);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      <div className="px-4 pb-3" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Tareas</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-3 space-y-2">
        <div className="flex gap-2">
          {[['all', 'Todas'], ['pending', 'Pendientes'], ['completed', 'Completadas']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{
                backgroundColor: statusFilter === v ? `${accentColor}25` : '#0E1520',
                color: statusFilter === v ? accentColor : '#64748B',
                border: `1px solid ${statusFilter === v ? `${accentColor}60` : '#1E293B'}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[['all', 'Todas'], ['high', 'Alta'], ['medium', 'Media'], ['low', 'Baja']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setPriorityFilter(v)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{
                backgroundColor: priorityFilter === v ? `${v === 'all' ? accentColor : PRIORITY_COLORS[v]}20` : '#0E1520',
                color: priorityFilter === v ? (v === 'all' ? accentColor : PRIORITY_COLORS[v]) : '#64748B',
                border: `1px solid ${priorityFilter === v ? `${v === 'all' ? accentColor : PRIORITY_COLORS[v]}50` : '#1E293B'}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="px-4 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-slate-400 text-sm">
              {statusFilter === 'pending' ? '¡Todo al día! No hay tareas pendientes.' : 'No hay tareas aquí.'}
            </p>
            {statusFilter === 'pending' && (
              <button onClick={() => setShowAdd(true)} className="mt-3 text-sm" style={{ color: accentColor }}>
                + Añadir tarea
              </button>
            )}
          </div>
        )}

        {filtered.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-4 rounded-2xl transition-all"
            style={{
              backgroundColor: '#0E1520',
              borderLeft: `3px solid ${task.completed ? '#1E293B' : PRIORITY_COLORS[task.priority]}`,
            }}
          >
            <button
              onClick={() => handleToggle(task)}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 active:scale-90 transition-all"
              style={{
                borderColor: task.completed ? '#10B981' : '#334155',
                backgroundColor: task.completed ? '#10B981' : 'transparent',
              }}
            >
              {task.completed && <Check size={12} className="text-[#07070F]" strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                {task.title}
              </p>
              {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
                {task.project_title && (
                  <span className="text-[10px] text-slate-500">{task.project_title}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-600 active:text-red-400 active:scale-90 transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && <AddTaskSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} projects={projects} accentColor={accentColor} />}
    </div>
  );
}
