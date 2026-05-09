import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pill, Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TIME_OPTIONS = [
  { value: 'morning', label: '☀️ Mañana' },
  { value: 'pre-workout', label: '🏃 Pre-entreno' },
  { value: 'post-workout', label: '💪 Post-entreno' },
  { value: 'lunch', label: '🍽️ Mediodía' },
  { value: 'afternoon', label: '🌅 Tarde' },
  { value: 'before-sleep', label: '🌙 Antes de dormir' },
];

function getTimeLabel(time) {
  return TIME_OPTIONS.find(o => o.value === time)?.label ?? time;
}

function SupplementModal({ supplement, onSave, onClose, accentColor }) {
  const [name, setName] = useState(supplement?.name ?? '');
  const [time, setTime] = useState(supplement?.time ?? 'morning');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), time });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-6 slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">
            {supplement ? 'Editar Suplemento' : 'Nuevo Suplemento'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Vitamina D3 2000UI"
              className="input-dark"
              autoFocus
              maxLength={40}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Hora recomendada</label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="input-dark"
              style={{ appearance: 'none' }}
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            Guardar
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function SupplementsSection({ accentColor }) {
  const { user, apiCall } = useAuth();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupp, setEditingSupp] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const MAX = 5;

  useEffect(() => {
    if (!user) return;
    fetchSupplements();
  }, [user]);

  async function fetchSupplements() {
    setLoading(true);
    try {
      const res = await apiCall(`/supplements/${user.id}/${today}`);
      if (res.ok) setSupplements((await res.json()).supplements || []);
    } catch (err) {
      console.error('Error fetching supplements:', err);
    }
    setLoading(false);
  }

  async function toggleSupplement(suppName, currentTaken) {
    try {
      const res = await apiCall('/supplements/toggle', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          date: today,
          supplement_name: suppName,
          taken: !currentTaken
        })
      });
      if (res.ok) {
        setSupplements(prev =>
          prev.map(s => s.name === suppName ? { ...s, taken: !currentTaken } : s)
        );
      }
    } catch (err) {
      console.error('Error toggling supplement:', err);
    }
  }

  async function addSupplement({ name, time }) {
    try {
      const res = await apiCall('/supplements/definitions', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, name, time })
      });
      if (res.ok) await fetchSupplements();
    } catch (err) {
      console.error('Error adding supplement:', err);
    }
  }

  async function updateSupplement(id, { name, time }) {
    try {
      const res = await apiCall(`/supplements/definitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, time })
      });
      if (res.ok) await fetchSupplements();
    } catch (err) {
      console.error('Error updating supplement:', err);
    }
  }

  async function deleteSupplement(id) {
    try {
      const res = await apiCall(`/supplements/definitions/${id}`, { method: 'DELETE' });
      if (res.ok) setSupplements(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting supplement:', err);
    }
  }

  const openAdd = () => { setEditingSupp(null); setShowModal(true); };
  const openEdit = (supp) => { setEditingSupp(supp); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingSupp(null); };

  const handleSave = async (data) => {
    closeModal();
    if (editingSupp) {
      await updateSupplement(editingSupp.id, data);
    } else {
      await addSupplement(data);
    }
  };

  const taken = supplements.filter(s => s.taken).length;
  const canAdd = supplements.length < MAX;

  if (loading) return null;

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill size={20} style={{ color: accentColor }} />
            <h3 className="font-semibold text-white">Suplementos</h3>
          </div>
          <div className="flex items-center gap-3">
            {supplements.length > 0 && (
              <span className="text-sm font-semibold" style={{ color: accentColor }}>
                {taken}/{supplements.length}
              </span>
            )}
            {canAdd && (
              <button
                onClick={openAdd}
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>

        {supplements.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm mb-3">Sin suplementos configurados</p>
            <button
              onClick={openAdd}
              className="text-sm font-semibold active:scale-95"
              style={{ color: accentColor }}
            >
              + Añadir suplemento
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {supplements.map(supp => (
              <div
                key={supp.id}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[#07070F]"
              >
                <button
                  onClick={() => toggleSupplement(supp.name, supp.taken)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-90"
                  style={{ backgroundColor: supp.taken ? accentColor : '#1E293B' }}
                >
                  {supp.taken && <Check size={14} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${supp.taken ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {supp.name}
                  </p>
                  <p className="text-xs text-slate-500">{getTimeLabel(supp.time)}</p>
                </div>

                <button
                  onClick={() => openEdit(supp)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 active:scale-90 transition-all"
                >
                  <Pencil size={12} />
                </button>

                <button
                  onClick={() => deleteSupplement(supp.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500/50 active:scale-90 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {!canAdd && (
              <p className="text-center text-xs text-slate-600 pt-1">Máximo 5 suplementos</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <SupplementModal
          supplement={editingSupp}
          onSave={handleSave}
          onClose={closeModal}
          accentColor={accentColor}
        />
      )}
    </>
  );
}
