import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { WeightChart, VolumeChart } from '../components/ProgressChart';
import {
  Scale, Trophy, TrendingUp, Download, LogOut,
  Plus, ChevronRight, X, History, Search, Camera, Trash2, Image
} from 'lucide-react';
import SupplementsSection from '../components/SupplementsSection';
import { MonthlyCalendarModal } from '../components/MonthlyCalendarModal';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return `${DAYS[d.getDay()]} ${day}/${month}/${year}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function AddWeightModal({ onClose, onAdd, accentColor }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight) return;
    onAdd(parseFloat(weight), date);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
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
    </div>,
    document.body
  );
}

function ExerciseHistorySheet({ exercise, history, loading, onClose, accentColor }) {
  const allWeights = history.flatMap(s => s.sets.filter(s => s.completed && s.weight > 0).map(s => s.weight));
  const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0D1422] rounded-t-3xl w-full max-w-md flex flex-col slide-up" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">{exercise}</h3>
            {!loading && maxWeight > 0 && (
              <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                🏆 Récord: {maxWeight}kg
              </p>
            )}
            {!loading && (
              <p className="text-xs text-slate-500 mt-0.5">
                {history.length} sesión{history.length !== 1 ? 'es' : ''} registrada{history.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#07070F] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3 pb-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-slate-500 py-12 text-sm">Sin datos registrados</p>
          ) : (
            history.map((session, i) => {
              const completedSets = session.sets.filter(s => s.completed);
              if (completedSets.length === 0) return null;
              const sessionMax = Math.max(...completedSets.filter(s => s.weight > 0).map(s => s.weight), 0);
              const isPRSession = sessionMax > 0 && sessionMax === maxWeight;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: isPRSession ? '#F59E0B10' : '#07070F',
                    border: isPRSession ? '1px solid #F59E0B30' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold" style={{ color: accentColor }}>
                      {formatDate(session.date)}
                    </div>
                    {isPRSession && (
                      <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                        🏆 PR
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {completedSets.map((set, j) => {
                      const isSetPR = set.weight > 0 && set.weight === maxWeight;
                      return (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 w-14 shrink-0 text-xs">Serie {set.set_number}</span>
                          <span className={`font-bold ${isSetPR ? 'text-amber-400' : 'text-white'}`}>
                            {set.weight > 0 ? `${set.weight}kg` : 'PC'}
                          </span>
                          {isSetPR && <span className="text-xs">🏆</span>}
                          <span className="text-slate-500">×</span>
                          <span className="text-white font-bold">{set.reps} reps</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Progress Photos ──────────────────────────────────────────────────────────
function PhotoCard({ photo, onDelete }) {
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (!showFull) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [showFull]);

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#0E1520] border border-white/8">
      {photo.thumb ? (
        <img
          src={photo.thumb}
          alt={photo.date}
          className="w-full h-full object-cover cursor-pointer active:scale-95 transition-all"
          onClick={() => setShowFull(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-600">
          <Image size={24} />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 pointer-events-none">
        <div className="text-xs text-white">{formatDateShort(photo.date)}</div>
      </div>
      <button
        onClick={() => onDelete(photo.id)}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-red-400 active:scale-90"
      >
        <Trash2 size={12} />
      </button>

      {showFull && photo.thumb && createPortal(
        <div
          className="fixed inset-0 z-[60] bg-black/92 flex items-center justify-center p-4"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          onClick={() => setShowFull(false)}
        >
          <img
            src={photo.thumb}
            alt={photo.date}
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setShowFull(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <X size={20} className="text-white" />
          </button>
          <div className="absolute bottom-8 left-0 right-0 text-center text-slate-400 text-sm">
            {formatDateShort(photo.date)}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ProgressPhotosSection({ accentColor }) {
  const { user, apiCall } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) fetchPhotos();
  }, [user]);

  async function fetchPhotos() {
    try {
      const res = await apiCall(`/photos/${user.id}/all`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  }

  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new window.Image();
        img.onload = () => {
          const MAX = 900;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
            else { width = Math.round((width * MAX) / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const photoData = await resizeImage(file);
      const res = await apiCall('/photos', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, photo_data: photoData, notes: '' })
      });
      if (res.ok) await fetchPhotos();
    } catch (err) {
      console.error('Error uploading photo:', err);
    }
    setUploading(false);
    e.target.value = '';
  }

  async function deletePhoto(id) {
    try {
      await apiCall(`/photos/${id}`, { method: 'DELETE' });
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera size={18} style={{ color: accentColor }} />
          <h3 className="font-semibold text-white">Fotos de Progreso</h3>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-sm font-semibold active:scale-95 disabled:opacity-50"
          style={{ color: accentColor }}
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          {uploading ? 'Subiendo…' : 'Añadir'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {photos.length === 0 ? (
        <div className="text-center py-6">
          <Camera size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm">Documenta tu progreso</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm font-semibold active:scale-95"
            style={{ color: accentColor }}
          >
            Añadir primera foto
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onDelete={deletePhoto}
                accentColor={accentColor}
              />
            ))}
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">
            {photos.length} foto{photos.length !== 1 ? 's' : ''} · Toca para ampliar
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, color, onClick, trailing }) {
  const El = onClick ? 'button' : 'div';
  return (
    <El
      className={`card${onClick ? ' w-full text-left active:scale-[0.98] transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-xs text-slate-400">{label}</span>
        {trailing}
      </div>
      <div className="text-2xl font-bold text-white">
        {value}
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </div>
    </El>
  );
}

export default function Profile() {
  const { user, logout, apiCall } = useAuth();
  const [weightData, setWeightData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  const [exercises, setExercises] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const accentColor = user?.color || '#3B82F6';

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [weightRes, statsRes, volumeRes, exercisesRes] = await Promise.all([
        apiCall(`/bodyweight/${user.id}?limit=60`),
        apiCall(`/stats/${user.id}`),
        apiCall(`/exercises/volume/${user.id}?days=30`),
        apiCall(`/exercises/list/${user.id}`)
      ]);

      if (weightRes.ok) setWeightData((await weightRes.json()).entries || []);
      if (statsRes.ok) setStats(await statsRes.json());
      if (volumeRes.ok) setVolumeData((await volumeRes.json()).volume || []);
      if (exercisesRes.ok) setExercises((await exercisesRes.json()).exercises || []);
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
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Error adding weight:', err);
    }
  }

  async function handleSelectExercise(name) {
    setSelectedExercise(name);
    setExerciseHistory([]);
    setHistoryLoading(true);
    try {
      const res = await apiCall(`/exercises/history/${user.id}/${encodeURIComponent(name)}`);
      if (res.ok) setExerciseHistory((await res.json()).history || []);
    } catch (err) {
      console.error('Error fetching exercise history:', err);
    }
    setHistoryLoading(false);
  }

  function exportData() {
    window.open(`/api/export/${user.id}`, '_blank');
  }

  const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;
  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
    : null;

  const filteredExercises = useMemo(
    () => exercises.filter(ex => ex.exercise_name.toLowerCase().includes(exerciseSearch.toLowerCase())),
    [exercises, exerciseSearch]
  );

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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-3">
            <StatCard
              label="Sesiones totales"
              value={stats.totalSessions}
              icon={Trophy}
              color={accentColor}
              onClick={() => setShowCalendar(true)}
              trailing={<ChevronRight size={14} className="text-slate-500 ml-auto" />}
            />
            <div className="grid grid-cols-2 gap-3">
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
            </div>
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

          <WeightChart data={weightData} color={accentColor} goalWeight={user?.weight_goal} />

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
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold" style={{ color: accentColor }}>{pr.max_weight}kg</span>
                    {i === 0 && <span className="text-xs">🏆</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress photos */}
        <ProgressPhotosSection accentColor={accentColor} />

        {/* Exercise history */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} style={{ color: accentColor }} />
            <h3 className="font-semibold text-white">Mi historial</h3>
            {exercises.length > 0 && (
              <span className="text-xs text-slate-500 ml-auto">{exercises.length} ejercicios</span>
            )}
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={exerciseSearch}
              onChange={e => setExerciseSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="input-dark pl-9 text-sm"
            />
          </div>

          {filteredExercises.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-6">
              {exercises.length === 0 ? 'Aún no hay ejercicios registrados' : 'No se encontró ese ejercicio'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {filteredExercises.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectExercise(ex.exercise_name)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#07070F] active:scale-[0.98] transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{ex.exercise_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {ex.session_count} sesión{ex.session_count !== 1 ? 'es' : ''} · Último {formatDateShort(ex.last_date)}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Supplements */}
        <SupplementsSection accentColor={accentColor} />

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

      {selectedExercise && (
        <ExerciseHistorySheet
          exercise={selectedExercise}
          history={exerciseHistory}
          loading={historyLoading}
          onClose={() => setSelectedExercise(null)}
          accentColor={accentColor}
        />
      )}

      {showCalendar && (
        <MonthlyCalendarModal
          onClose={() => setShowCalendar(false)}
          accentColor={accentColor}
          userId={user?.id}
          apiCall={apiCall}
        />
      )}
    </div>
  );
}
