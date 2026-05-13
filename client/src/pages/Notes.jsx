import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Search, Trash2, Tag } from 'lucide-react';

const glass = {
  background: 'rgba(34, 30, 40, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};
const inputStyle = { background: '#100d16', border: '1px solid #4a4455' };

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

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: '#15121b', paddingTop: `env(safe-area-inset-top)` }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid #4a4455' }}
      >
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full active:scale-90 transition-all"
          style={{ color: '#958da1' }}
        >
          <X size={20} />
        </button>
        <input
          autoFocus={isNew}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título"
          className="flex-1 bg-transparent font-bold text-lg outline-none"
          style={{ color: '#e8dfee' }}
          placeholderStyle={{ color: '#4a4455' }}
        />
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={() => { onDelete(note.id); onClose(); }}
              className="p-2 rounded-full active:scale-90 transition-all"
              style={{ color: '#4a4455' }}
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95"
            style={{ background: accentColor, color: '#15121b', opacity: title.trim() ? 1 : 0.4 }}
          >
            {isNew ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Tag size={13} style={{ color: '#4a4455' }} className="shrink-0" />
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="etiquetas, separadas, por, comas"
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: '#958da1' }}
        />
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escribe aquí tu nota..."
        className="flex-1 px-4 py-4 bg-transparent text-sm leading-relaxed outline-none resize-none"
        style={{ color: '#ccc3d8', paddingBottom: `calc(env(safe-area-inset-bottom) + 1rem)` }}
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
      className="w-full text-left p-4 rounded-2xl active:scale-[0.98] transition-all"
      style={glass}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm leading-snug" style={{ color: '#e8dfee' }}>{note.title}</h3>
        <span className="text-[10px] shrink-0" style={{ color: '#958da1' }}>{date}</span>
      </div>
      {note.content && (
        <p className="text-xs mt-1.5 line-clamp-3 leading-relaxed" style={{ color: '#958da1' }}>{note.content}</p>
      )}
      {tagList.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {tagList.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${accentColor}20`, color: accentColor }}
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

  const accentColor = user?.color || '#d2bbff';

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

  const allTags = [...new Set(
    notes.flatMap(n => n.tags ? n.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  )];

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
          <h1 className="text-xl font-bold tracking-tight" style={{ color: accentColor }}>Notas</h1>
        </div>
        <button
          onClick={() => { setOpenNote(null); setShowNew(true); }}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-all"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          <Plus size={18} />
        </button>
      </header>

      <div className="px-4 pt-4 space-y-3">

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#958da1' }} />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full rounded-xl pl-9 pr-9 py-3 text-sm text-[#e8dfee] placeholder-[#958da1] outline-none"
            style={inputStyle}
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 active:text-[#e8dfee]"
              style={{ color: '#958da1' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                style={{
                  background: activeTag === tag ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                  color: activeTag === tag ? accentColor : '#958da1',
                  border: `1px solid ${activeTag === tag ? `${accentColor}60` : '#4a4455'}`,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm" style={{ color: '#958da1' }}>
              {search || activeTag ? 'No hay notas con ese filtro.' : 'Todavía no tienes notas.'}
            </p>
            {!search && !activeTag && (
              <button
                onClick={() => setShowNew(true)}
                className="mt-3 text-sm"
                style={{ color: accentColor }}
              >
                + Nueva nota
              </button>
            )}
          </div>
        )}

        {/* Notes grid */}
        <div className="space-y-2">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              accentColor={accentColor}
              onClick={() => { setOpenNote(note); setShowNew(true); }}
            />
          ))}
        </div>
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
