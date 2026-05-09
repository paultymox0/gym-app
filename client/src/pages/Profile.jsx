import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WeightChart, VolumeChart } from '../components/ProgressChart';
import {
  User, Scale, Trophy, TrendingUp, Download, LogOut,
  Plus, Heart, Pill, ChevronRight, Check, X, Calendar
} from 'lucide-react';

function AddWeightModal({ onClose, onAdd, accentColor }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight) return;
    onAdd(parseFloat(weight), date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0D1422] rounded-t-3xl w-full max-w-md p-6 slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Registrar Peso</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Peso (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Ej: 68.5"
              className="input-dark text-center text-2xl font-bold"
              inputMode="decimal"
              step="0.1"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-dark"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            type="submit"
            disabled={!weight}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            Guardar Peso
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, color }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {value}
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, apiCall } = useAuth();
  const navigate = useNavigate();
  const [weightData, setWeightData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [stats, setStats] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const accentColor = user?.color || '#3B82F6';

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [weightRes, statsRes, suppRes, volumeRes] = await Promise.all([
        apiCall(`/bodyweight/${user.id}?limit=60`),
        apiCall(`/stats/${user.id}`),
        apiCall(`/supplements/${user.id}/${today}`),
        apiCall(`/exercises/volume/${user.id}?days=30`)
      ]);

      if (weightRes.ok) setWeightData((await weightRes.json()).entries || []);
      if (statsRes.ok) setStats(await statsRes.json());
      if (suppRes.ok) setSupplements((await suppRes.json()).supplements || []);
      if (volumeRes.ok) setVolumeData((await volumeRes.json()).volume || []);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    }
    setLoading(false);
  }

  async function addWeight(weight, date) {
    try {
      const res = await apiCall('/bodyweight', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, date, weight })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error adding weight:', err);
    }
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

  async function exportData() {
    try {
      window.open(`/api/export/${user.id}`, '_blank');
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  }

  const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;
  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070F] pb-24 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Perfil</h1>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-400 text-sm active:scale-95"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* User info card */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {user?.name?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <div className="text-slate-400 text-sm space-y-0.5">
                <div>{user?.age} años • {user?.height}m</div>
                <div className="flex items-center gap-1">
                  <span>Objetivo:</span>
                  <span className="font-semibold" style={{ color: accentColor }}>
                    {user?.weight_goal}kg
                  </span>
                  <span>• {user?.calories_goal} kcal/día</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Sesiones totales"
              value={stats.totalSessions}
              icon={Trophy}
              color={accentColor}
            />
            <StatCard
              label="Racha actual"
              value={stats.streak}
              unit="días"
              icon={TrendingUp}
              color="#F59E0B"
            />
            <StatCard
              label="Peso actual"
              value={latestWeight || '--'}
              unit={latestWeight ? 'kg' : ''}
              icon={Scale}
              color="#10B981"
            />
            <StatCard
              label="Volumen total"
              value={Math.round((stats.totalVolume || 0) / 1000)}
              unit="t levantadas"
              icon={TrendingUp}
              color="#8B5CF6"
            />
          </div>
        )}

        {/* Weight chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale size={18} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Evolución de Peso</h3>
            </div>
            <button
              onClick={() => setShowAddWeight(true)}
              className="flex items-center gap-1 text-sm font-semibold active:scale-95"
              style={{ color: accentColor }}
            >
              <Plus size={14} />
              Registrar
            </button>
          </div>

          {latestWeight && (
            <div className="flex items-center gap-4 mb-3">
              <div>
                <div className="text-2xl font-bold text-white">{latestWeight}kg</div>
                <div className="text-xs text-slate-400">Peso actual</div>
              </div>
              <div className="w-px h-10 bg-[#334155]" />
              <div>
                <div className="text-2xl font-bold" style={{ color: accentColor }}>
                  {user?.weight_goal}kg
                </div>
                <div className="text-xs text-slate-400">Objetivo</div>
              </div>
              {weightChange !== null && (
                <>
                  <div className="w-px h-10 bg-[#334155]" />
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: parseFloat(weightChange) >= 0 ? '#10B981' : '#EF4444' }}
                    >
                      {parseFloat(weightChange) >= 0 ? '+' : ''}{weightChange}kg
                    </div>
                    <div className="text-xs text-slate-400">Cambio</div>
                  </div>
                </>
              )}
            </div>
          )}

          <WeightChart
            data={weightData}
            color={accentColor}
            goalWeight={user?.weight_goal}
          />

          {weightData.length === 0 && (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">Registra tu peso para ver el progreso</p>
              <button
                onClick={() => setShowAddWeight(true)}
                className="mt-2 text-sm font-semibold active:scale-95"
                style={{ color: accentColor }}
              >
                Registrar primer peso
              </button>
            </div>
          )}
        </div>

        {/* Volume chart */}
        {volumeData.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Volumen de Entrenamiento</h3>
              <span className="text-xs text-slate-500">(últimas 4 semanas)</span>
            </div>
            <VolumeChart data={volumeData} color={accentColor} />
          </div>
        )}

        {/* Personal records */}
        {stats?.prs && stats.prs.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} style={{ color: '#F59E0B' }} />
              <h3 className="font-semibold text-white">Récords Personales</h3>
            </div>
            <div className="space-y-2">
              {stats.prs.slice(0, 6).map((pr, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#07070F]">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm font-bold">#{i + 1}</span>
                    <span className="text-white text-sm font-medium">{pr.exercise_name}</span>
                  </div>
                  <span className="font-bold" style={{ color: accentColor }}>
                    {pr.max_weight}kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supplements */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Pill size={18} style={{ color: accentColor }} />
            <h3 className="font-semibold text-white">Suplementos Hoy</h3>
          </div>
          <div className="space-y-2">
            {supplements.map(supp => (
              <button
                key={supp.name}
                onClick={() => toggleSupplement(supp.name, supp.taken)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#07070F] active:scale-[0.98] transition-all"
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all text-white shrink-0"
                  style={{ backgroundColor: supp.taken ? accentColor : '#334155' }}
                >
                  {supp.taken && <Check size={14} />}
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-medium ${supp.taken ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {supp.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {supp.time === 'morning' ? '☀️ Mañana' :
                     supp.time === 'post-workout' ? '💪 Post-entreno' :
                     supp.time === 'lunch' ? '🍽️ Almuerzo' :
                     supp.time === 'before-sleep' ? '🌙 Antes de dormir' : supp.time}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sara-only: Cycle page access */}
        {user?.gender === 'female' && (
          <button
            onClick={() => navigate('/cycle')}
            className="card w-full text-left active:scale-[0.98] transition-all border border-pink-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Heart size={20} className="text-pink-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">Ciclo Menstrual</div>
                <div className="text-sm text-slate-400">Seguimiento y recomendaciones</div>
              </div>
              <ChevronRight size={18} className="text-slate-500" />
            </div>
          </button>
        )}

        {/* Export */}
        <button
          onClick={exportData}
          className="card w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Download size={20} className="text-green-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Exportar Datos</div>
              <div className="text-sm text-slate-400">Descargar CSV con todos tus datos</div>
            </div>
            <ChevronRight size={18} className="text-slate-500" />
          </div>
        </button>
      </div>

      {showAddWeight && (
        <AddWeightModal
          onClose={() => setShowAddWeight(false)}
          onAdd={addWeight}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}
