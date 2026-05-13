import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Search, Trash2, Tag } from 'lucide-react';

function NoteModal({ note, onClose, onSave, onDelete, accentColor }) {
  const isNew = !note;
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), content: content.trim(), tags: tags.trim() });
    onClose();
  }

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#07070F]" style={{ paddingTop: `env(safe-area-inset-top)` }}>
      {/* Note header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 active:text-white active:scale-90 transition-all">
          <X size={20} />
        </button>
        <input
          autoFocus={isNew}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título"
          className="flex-1 bg-transparent text-white font-bold text-lg outline-none placeholder-slate-600"
        />
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={() => { onDelete(note.id); onClose(); }}
              className="p-2 text-slate-600 active:text-red-400 active:scale-90 transition-all"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: accentColor, color: '#07070F', opacity: title.trim() ? 1 : 0.4 }}
          >
            {isNew ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <Tag size={13} className="text-slate-600 shrink-0" />
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="etiquetas, separadas, por, comas"
          className="flex-1 bg-transparent text-slate-400 text-xs outline-none placeholder-slate-700"
        />
      </div>

      {/* Content area */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escribe aquí tu nota..."
        className="flex-1 px-4 py-4 bg-transparent text-slate-200 text-sm leading-relaxed outline-none resize-none placeholder-slate-700"
        style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 1rem)` }}
      />
    </div>,
    document.body
  );
}

function NoteCard({ note, onClick, accentColor }) {
  const tagList = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const date = new Date(note.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl bg-[#0E1520] active:scale-[0.98] transition-all"
      style={{ border: '1px solid #1E293B' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-sm leading-snug">{note.title}</h3>
        <span className="text-[10px] text-slate-600 shrink-0">{date}</span>
      </div>
      {note.content && (
        <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">{note.content}</p>
      )}
      {tagList.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {tagList.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default function Notes() {
  const { user, apiCall } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [openNote, setOpenNote] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);

  const accentColor = user?.color || '#3B82F6';

  const load = useCallback(async (q = '', tag = '') => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (tag) params.set('tag', tag);
    const res = await apiCall(`/notes/${user.id}?${params}`);
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }, [user, apiCall]);

  useEffect(() => { if (user) load(); }, [user]);

  function handleSearch(q) {
    setSearch(q);
    setActiveTag('');
    load(q, '');
  }

  function handleTagFilter(tag) {
    const next = activeTag === tag ? '' : tag;
    setActiveTag(next);
    setSearch('');
    load('', next);
  }

  async function handleSave(data) {
    if (openNote) {
      await apiCall(`/notes/${openNote.id}`, { method: 'PATCH', body: JSON.stringify(data) });
    } else {
      await apiCall('/notes', { method: 'POST', body: JSON.stringify({ user_id: user.id, ...data }) });
    }
    load(search, activeTag);
  }

  async function handleDelete(id) {
    await apiCall(`/notes/${id}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  // Collect all unique tags
  const allTags = [...new Set(
    notes.flatMap(n => n.tags ? n.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  )];

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      <div className="px-4 pb-3" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-white">Notas</h1>
          <button
            onClick={() => { setOpenNote(null); setShowNew(true); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar notas..."
            className="input-dark w-full pl-9 text-sm"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 active:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="px-4 mb-3 flex gap-2 overflow-x-auto pb-1">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{
                backgroundColor: activeTag === tag ? `${accentColor}25` : '#0E1520',
                color: activeTag === tag ? accentColor : '#64748B',
                border: `1px solid ${activeTag === tag ? `${accentColor}60` : '#1E293B'}`,
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="px-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-slate-400 text-sm">
              {search || activeTag ? 'No hay notas con ese filtro.' : 'Todavía no tienes notas.'}
            </p>
            {!search && !activeTag && (
              <button onClick={() => setShowNew(true)} className="mt-3 text-sm" style={{ color: accentColor }}>
                + Nueva nota
              </button>
            )}
          </div>
        )}

        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            accentColor={accentColor}
            onClick={() => { setOpenNote(note); setShowNew(true); }}
          />
        ))}
      </div>

      {showNew && (
        <NoteModal
          note={openNote}
          onClose={() => { setShowNew(false); setOpenNote(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}
