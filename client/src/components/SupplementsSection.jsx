import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const TIME_OPTIONS = [
  { value: 'morning',      label: '☀️ Mañana' },
  { value: 'pre-workout',  label: '🏃 Pre-entreno' },
  { value: 'post-workout', label: '💪 Post-entreno' },
  { value: 'lunch',        label: '🍽️ Mediodía' },
  { value: 'afternoon',    label: '🌅 Tarde' },
  { value: 'before-sleep', label: '🌙 Antes de dormir' },
];

function getTimeLabel(time) {
  return TIME_OPTIONS.find(o => o.value === time)?.label ?? time;
}

export default function SupplementsSection({ accentColor }) {
  const { user, apiCall } = useAuth();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('morning');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const MAX = 10;

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
    setSupplements(prev =>
      prev.map(s => s.name === suppName ? { ...s, taken: !currentTaken } : s)
    );
    try {
      await apiCall('/supplements/toggle', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          date: today,
          supplement_name: suppName,
          taken: !currentTaken
        })
      });
    } catch (err) {
      setSupplements(prev =>
        prev.map(s => s.name === suppName ? { ...s, taken: currentTaken } : s)
      );
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      const res = await apiCall('/supplements/definitions', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, name: newName.trim(), time: newTime })
      });
      if (res.ok) {
        await fetchSupplements();
        setNewName('');
        setNewTime('morning');
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error adding supplement:', err);
    }
    setSaving(false);
  }

  async function deleteSupplement(id) {
    setSupplements(prev => prev.filter(s => s.id !== id));
    try {
      await apiCall(`/supplements/definitions/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting supplement:', err);
      await fetchSupplements();
    }
  }

  const openForm = () => { setNewName(''); setNewTime('morning'); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setNewName(''); setNewTime('morning'); };

  const taken = supplements.filter(s => s.taken).length;
  const canAdd = supplements.length < MAX;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill size={20} style={{ color: accentColor }} />
          <h3 className="font-semibold text-white">Suplementos</h3>
          {supplements.length > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {taken}/{supplements.length}
            </span>
          )}
        </div>

        {canAdd && !showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm active:scale-95 transition-all"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <Plus size={15} />
            Añadir
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && supplements.length === 0 && !showForm && (
        <div className="flex flex-col items-center py-8 gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Pill size={28} style={{ color: accentColor, opacity: 0.6 }} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Añade tu primer suplemento</p>
          <button
            onClick={openForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm active:scale-95 transition-all text-white"
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={16} />
            Añadir suplemento
          </button>
        </div>
      )}

      {/* Supplement list */}
      {!loading && supplements.length > 0 && (
        <div className="space-y-2 mb-2">
          <AnimatePresence initial={false}>
            {supplements.map(supp => (
              <motion.div
                key={supp.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: '#07070F' }}
              >
                {/* Checkbox con animación pop */}
                <motion.button
                  onClick={() => toggleSupplement(supp.name, supp.taken)}
                  whileTap={{ scale: 0.75 }}
                  animate={supp.taken ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-2"
                  style={{
                    backgroundColor: supp.taken ? accentColor : 'transparent',
                    borderColor: supp.taken ? accentColor : '#334155'
                  }}
                >
                  <AnimatePresence>
                    {supp.taken && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check size={15} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${supp.taken ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {supp.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{getTimeLabel(supp.time)}</p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteSupplement(supp.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Inline add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-2 p-4 rounded-2xl space-y-3"
          style={{ backgroundColor: '#07070F', border: `1px solid ${accentColor}30` }}
        >
          <p className="text-sm font-semibold text-white">Nuevo suplemento</p>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nombre (ej: Vitamina D3 2000UI)"
            className="input-dark"
            maxLength={40}
            autoFocus
          />
          <select
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            className="input-dark"
          >
            {TIME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelForm}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-slate-400 active:scale-95 transition-all"
              style={{ backgroundColor: '#1E293B' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || saving}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white active:scale-95 transition-all disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {!canAdd && !showForm && (
        <p className="text-center text-xs text-slate-600 pt-1">Máximo 5 suplementos</p>
      )}
    </div>
  );
}

