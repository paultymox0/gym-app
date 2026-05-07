import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ChevronLeft, Plus, AlertTriangle, Utensils, Dumbbell, Calendar, X } from 'lucide-react';

const PHASE_ICONS = {
  menstruation: '🔴',
  follicular: '🌱',
  ovulation: '✨',
  luteal: '🌙',
  luteal_late: '⚠️'
};

function DayMarkerModal({ onClose, onAdd, accentColor }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(date, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1E293B] rounded-t-3xl w-full max-w-md p-6 slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Marcar Día 1 del Ciclo</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-dark"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Síntomas, observaciones..."
              className="input-dark resize-none h-20"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-all"
            style={{ backgroundColor: accentColor }}
          >
            Marcar Inicio
          </button>
        </form>
      </div>
    </div>
  );
}

function PhaseTimeline({ currentPhase }) {
  const phases = [
    { key: 'menstruation', label: 'Mens.', days: '1-5', color: '#EF4444' },
    { key: 'follicular', label: 'Folicular', days: '6-13', color: '#10B981' },
    { key: 'ovulation', label: 'Ovulación', days: '14-16', color: '#F59E0B' },
    { key: 'luteal', label: 'Lútea', days: '17-21', color: '#8B5CF6' },
    { key: 'luteal_late', label: 'Lútea tardía', days: '22-28', color: '#F97316' }
  ];

  return (
    <div className="relative">
      {/* Timeline bar */}
      <div className="flex gap-1 mb-2">
        {phases.map(phase => (
          <div
            key={phase.key}
            className={`h-2 rounded-full transition-all ${
              currentPhase?.phase === phase.key ? 'flex-[2]' : 'flex-1'
            }`}
            style={{ backgroundColor: phase.color, opacity: currentPhase?.phase === phase.key ? 1 : 0.3 }}
          />
        ))}
      </div>
      {/* Labels */}
      <div className="flex gap-1">
        {phases.map(phase => (
          <div
            key={phase.key}
            className={`flex-1 text-center ${currentPhase?.phase === phase.key ? 'flex-[2]' : ''}`}
          >
            <div
              className="text-xs font-semibold"
              style={{ color: currentPhase?.phase === phase.key ? phase.color : '#475569' }}
            >
              {phase.label}
            </div>
            <div className="text-xs text-slate-600">{phase.days}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CyclePage() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();
  const [cycleData, setCycleData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const accentColor = '#EC4899';

  useEffect(() => {
    if (!user) return;
    // Redirect if not Sara
    if (user.gender !== 'female') {
      navigate('/profile');
      return;
    }
    fetchCycleData();
  }, [user]);

  async function fetchCycleData() {
    setLoading(true);
    try {
      const res = await apiCall(`/cycle/${user.id}`);
      if (res.ok) {
        setCycleData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching cycle data:', err);
    }
    setLoading(false);
  }

  async function addCycleDay(date, notes) {
    try {
      const res = await apiCall('/cycle', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          cycle_start_date: date,
          notes
        })
      });
      if (res.ok) {
        await fetchCycleData();
      }
    } catch (err) {
      console.error('Error adding cycle day:', err);
    }
  }

  async function deleteCycle(id) {
    try {
      await apiCall(`/cycle/${id}`, { method: 'DELETE' });
      await fetchCycleData();
    } catch (err) {
      console.error('Error deleting cycle:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  const phase = cycleData?.currentPhase;

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl bg-[#1E293B] text-slate-400 active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Ciclo Menstrual</h1>
            <p className="text-slate-400 text-sm">Seguimiento y recomendaciones</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white active:scale-90"
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Current phase */}
        {phase ? (
          <>
            {/* Alert for luteal late */}
            {phase.alert && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                <AlertTriangle size={20} className="text-orange-400 shrink-0 mt-0.5" />
                <p className="text-orange-300 text-sm leading-relaxed">{phase.alert}</p>
              </div>
            )}

            {/* Phase card */}
            <div className="card" style={{ borderColor: `${phase.color}30`, border: '1px solid' }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${phase.color}20` }}
                >
                  {PHASE_ICONS[phase.phase]}
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{phase.name}</div>
                  <div className="text-slate-400 text-sm">{phase.days}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-bold" style={{ color: phase.color }}>
                    {phase.dayNumber}
                  </div>
                  <div className="text-xs text-slate-400">día del ciclo</div>
                </div>
              </div>

              {/* Timeline */}
              <PhaseTimeline currentPhase={phase} />
            </div>

            {/* Nutrition recommendations */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Utensils size={18} style={{ color: phase.color }} />
                <h3 className="font-semibold text-white">Nutrición Esta Semana</h3>
              </div>
              <ul className="space-y-2">
                {phase.nutrition.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: phase.color }} />
                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Training recommendations */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell size={18} style={{ color: phase.color }} />
                <h3 className="font-semibold text-white">Entrenamiento Esta Semana</h3>
              </div>
              <ul className="space-y-2">
                {phase.training.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: phase.color }} />
                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="card text-center py-10">
            <Heart size={48} className="mx-auto mb-4 text-pink-400/40" />
            <h3 className="font-semibold text-white mb-2">Sin datos de ciclo</h3>
            <p className="text-slate-400 text-sm mb-4">
              Marca el primer día de tu ciclo para recibir recomendaciones personalizadas
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-2xl text-white font-semibold active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Marcar Día 1
            </button>
          </div>
        )}

        {/* Cycle history */}
        {cycleData?.cycles && cycleData.cycles.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Historial de Ciclos</h3>
            </div>
            <div className="space-y-2">
              {cycleData.cycles.map((cycle, i) => {
                const startDate = new Date(cycle.cycle_start_date + 'T12:00:00');
                const formattedDate = startDate.toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric'
                });

                // Calculate cycle length if there's a next cycle
                let cycleLength = null;
                if (i < cycleData.cycles.length - 1) {
                  const prevCycle = new Date(cycleData.cycles[i].cycle_start_date + 'T12:00:00');
                  const nextCycle = new Date(cycleData.cycles[i + 1].cycle_start_date + 'T12:00:00');
                  cycleLength = Math.round((prevCycle - nextCycle) / (1000 * 60 * 60 * 24));
                }

                return (
                  <div key={cycle.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-pink-400 text-sm">🔴 Día 1</span>
                        <span className="text-white text-sm font-medium">{formattedDate}</span>
                      </div>
                      {cycleLength && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Duración del ciclo: {cycleLength} días
                        </div>
                      )}
                      {cycle.notes && (
                        <div className="text-xs text-slate-400 mt-0.5">{cycle.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteCycle(cycle.id)}
                      className="p-2 text-slate-600 active:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Average cycle length */}
            {cycleData.cycles.length >= 2 && (() => {
              const lengths = cycleData.cycles.slice(0, -1).map((c, i) => {
                const d1 = new Date(c.cycle_start_date + 'T12:00:00');
                const d2 = new Date(cycleData.cycles[i + 1].cycle_start_date + 'T12:00:00');
                return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
              });
              const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
              return (
                <div className="mt-3 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <p className="text-pink-300 text-sm text-center">
                    Ciclo promedio: <strong>{avg} días</strong>
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Phase guide */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Guía de Fases</h3>
          <div className="space-y-2">
            {[
              { phase: 'Menstruación', days: 'Días 1-5', color: '#EF4444', icon: '🔴' },
              { phase: 'Folicular', days: 'Días 6-13', color: '#10B981', icon: '🌱' },
              { phase: 'Ovulación', days: 'Días 14-16', color: '#F59E0B', icon: '✨' },
              { phase: 'Lútea', days: 'Días 17-21', color: '#8B5CF6', icon: '🌙' },
              { phase: 'Lútea tardía', days: 'Días 22-28', color: '#F97316', icon: '⚠️' }
            ].map(p => (
              <div key={p.phase} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0F172A]">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <span className="font-medium text-sm" style={{ color: p.color }}>{p.phase}</span>
                  <span className="text-slate-500 text-xs ml-2">{p.days}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <DayMarkerModal
          onClose={() => setShowAddModal(false)}
          onAdd={addCycleDay}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}
