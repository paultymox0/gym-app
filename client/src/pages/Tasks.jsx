import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, Plus, ChevronDown, X, Trash2 } from 'lucide-react';
import NotificationsDrawer from '../components/NotificationsDrawer';

const PRIORITY = {
  high:   { label: 'Alta',  color: '#ffb4ab', bg: 'rgba(255,180,171,0.12)' },
  medium: { label: 'Media', color: '#ffb784', bg: 'rgba(255,183,132,0.12)' },
  low:    { label: 'Baja',  color: '#89ceff', bg: 'rgba(137,206,255,0.12)' },
};

const glass = {
  background: 'rgba(34, 30, 40, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const sheetBg = { background: '#1d1a24' };
const inputStyle = { background: '#100d16', border: '1px solid #4a4455' };

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
          <h3 className="text-lg font-bold text-[#e8dfee]">Nueva tarea</h3>
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
            placeholder="Título de la tarea"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />
          <input
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-2">Prioridad</p>
            <div className="flex gap-2">
              {Object.entries(PRIORITY).map(([key, { label, color }]) => (
                <button
                  key={key} type="button" onClick={() => setPriority(key)}
                  className="flex-1 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: priority === key ? `${color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${priority === key ? color : '#4a4455'}`,
                    color: priority === key ? color : '#958da1',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 && (
            <div className="relative">
              <select
                value={projectId} onChange={e => setProjectId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm appearance-none outline-none"
                style={{ ...inputStyle, color: projectId ? '#e8dfee' : '#958da1' }}
              >
                <option value="">Sin proyecto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#958da1]" />
            </div>
          )}

          <button
            type="submit" disabled={!title.trim() || saving}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: accentColor, color: '#15121b', opacity: title.trim() ? 1 : 0.4 }}
          >
            Añadir tarea
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function EditTaskSheet({ task, onClose, onSave, projects, accentColor }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [projectId, setProjectId] = useState(task.project_id ? String(task.project_id) : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave(task.id, { title: title.trim(), description: description.trim(), priority, project_id: projectId || null });
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
          <h3 className="text-lg font-bold text-[#e8dfee]">Editar tarea</h3>
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
            placeholder="Título de la tarea"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />
          <input
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full rounded-xl px-4 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] mb-2">Prioridad</p>
            <div className="flex gap-2">
              {Object.entries(PRIORITY).map(([key, { label, color }]) => (
                <button
                  key={key} type="button" onClick={() => setPriority(key)}
                  className="flex-1 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: priority === key ? `${color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${priority === key ? color : '#4a4455'}`,
                    color: priority === key ? color : '#958da1',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 && (
            <div className="relative">
              <select
                value={projectId} onChange={e => setProjectId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm appearance-none outline-none"
                style={{ ...inputStyle, color: projectId ? '#e8dfee' : '#958da1' }}
              >
                <option value="">Sin proyecto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#958da1]" />
            </div>
          )}

          <button
            type="submit" disabled={!title.trim() || saving}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: accentColor, color: '#15121b', opacity: title.trim() ? 1 : 0.4 }}
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default function Tasks() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);

  const accentColor = user?.color || '#d2bbff';

  const load = useCallback(async () => {
    setLoading(true);
    const [tRes, pRes] = await Promise.all([
      apiCall(`/tasks/${user.id}`),
      apiCall(`/projects/${user.id}`),
    ]);
    if (tRes.ok) setTasks(await tRes.json());
    if (pRes.ok) setProjects(await pRes.json());
    setLoading(false);
  }, [user, apiCall]);

  useEffect(() => { if (user) load(); }, [user]);

  async function handleToggle(task) {
    const res = await apiCall(`/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !task.completed }),
    });
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

  async function handleEdit(id, data) {
    const res = await apiCall(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    if (res.ok) load();
  }

  const filtered = tasks
    .filter(t => statusFilter === 'all' ? true : statusFilter === 'pending' ? !t.completed : t.completed)
    .filter(t => priorityFilter === 'all' ? true : t.priority === priorityFilter);

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

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
          <h1 className="text-xl font-bold tracking-tight" style={{ color: accentColor }}>Tareas</h1>
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

        {/* Filter chips */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] shrink-0">
              Prioridad
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[
                ['all', 'Todas', accentColor],
                ['high', 'Alta', '#ffb4ab'],
                ['medium', 'Media', '#ffb784'],
                ['low', 'Baja', '#89ceff'],
              ].map(([v, l, c]) => (
                <button
                  key={v}
                  onClick={() => setPriorityFilter(v)}
                  className="px-4 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 shrink-0"
                  style={{
                    background: priorityFilter === v ? `${c}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${priorityFilter === v ? c : '#4a4455'}`,
                    color: priorityFilter === v ? c : '#958da1',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] shrink-0">
              Estado
            </span>
            <div className="flex gap-2">
              {[['all', 'Todas'], ['pending', 'Pendiente'], ['completed', 'Completada']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className="px-4 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: statusFilter === v ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${statusFilter === v ? accentColor : '#4a4455'}`,
                    color: statusFilter === v ? accentColor : '#958da1',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Task list */}
        <section className="space-y-3">
          <div className="flex items-end justify-between px-1">
            <h2 className="text-xl font-semibold text-[#e8dfee]">Mis Tareas</h2>
            <span className="text-[10px] text-[#958da1]">{filtered.length} total</span>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-sm text-[#958da1]">
                {statusFilter === 'pending' ? '¡Todo al día! No hay tareas pendientes.' : 'No hay tareas aquí.'}
              </p>
              {statusFilter === 'pending' && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-3 text-sm font-semibold"
                  style={{ color: accentColor }}
                >
                  + Añadir tarea
                </button>
              )}
            </div>
          )}

          {filtered.map(task => {
            const p = PRIORITY[task.priority] || PRIORITY.medium;
            return (
              <div
                key={task.id} style={glass}
                className="rounded-xl flex items-center gap-4 p-4 active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => setEditTask(task)}
              >
                {/* Priority bar */}
                <div
                  className="w-1 rounded-full shrink-0 self-stretch"
                  style={{ background: task.completed ? '#4a4455' : p.color, minHeight: '40px' }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: task.completed ? '#958da1' : '#e8dfee',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {!task.completed && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: p.color, background: p.bg }}
                      >
                        {p.label}
                      </span>
                    )}
                    {task.completed && (
                      <span className="text-[10px] text-[#89ceff]">Completada</span>
                    )}
                    {task.project_title && (
                      <span className="text-[10px] text-[#958da1]">· {task.project_title}</span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-[#958da1] mt-0.5 truncate">{task.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-all"
                    style={{ color: '#4a4455' }}
                    onPointerEnter={e => { e.currentTarget.style.color = '#ffb4ab'; }}
                    onPointerLeave={e => { e.currentTarget.style.color = '#4a4455'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => handleToggle(task)}
                    className="w-6 h-6 rounded flex items-center justify-center active:scale-90 transition-all border-2"
                    style={{
                      borderColor: task.completed ? '#89ceff' : '#4a4455',
                      background: task.completed ? '#89ceff' : 'transparent',
                    }}
                  >
                    {task.completed && <Check size={12} style={{ color: '#001e2f' }} strokeWidth={3} />}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Stats bento */}
        <section className="grid grid-cols-2 gap-3">
          <div style={glass} className="rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1]">Pendientes</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold" style={{ color: accentColor }}>{pendingCount}</span>
              <span className="text-xs text-[#958da1]">tareas</span>
            </div>
          </div>
          <div style={glass} className="rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1]">Completadas</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#89ceff]">{completedCount}</span>
              <span className="text-xs text-[#958da1]">tareas</span>
            </div>
          </div>
        </section>

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
        <AddTaskSheet
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          projects={projects}
          accentColor={accentColor}
        />
      )}
      {editTask && (
        <EditTaskSheet
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={handleEdit}
          projects={projects}
          accentColor={accentColor}
        />
      )}
      {showNotifs && (
        <NotificationsDrawer accentColor={accentColor} onClose={() => setShowNotifs(false)} />
      )}
    </div>
  );
}
