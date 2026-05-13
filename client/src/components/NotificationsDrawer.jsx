import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Dumbbell, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DAY_NAMES = {
  back_biceps: 'Espalda / Bíceps',
  chest_triceps: 'Pecho / Tríceps',
  glute_hamstring: 'Glúteo / Femoral',
  quad_shoulder: 'Cuádriceps / Hombro',
  abs: 'Abdomen Casa',
  upper_a: 'Upper A', lower_a: 'Lower A', abs_a: 'Abs A',
  upper_b: 'Upper B', lower_b: 'Lower B', abs_b: 'Abs B',
};

function relativeDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function NotificationsDrawer({ onClose, accentColor }) {
  const { user, apiCall } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [sRes, tRes] = await Promise.all([
        apiCall(`/sessions/history/${user.id}?limit=8`),
        apiCall(`/tasks/${user.id}`),
      ]);
      if (sRes.ok) setSessions(await sRes.json().then(d => d.sessions || d));
      if (tRes.ok) {
        const all = await tRes.json();
        setTasks(all.filter(t => t.completed).slice(0, 8));
      }
      setLoading(false);
    }
    load();
  }, [user, apiCall]);

  const sheetBg = { background: '#1d1a24' };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl slide-up overflow-hidden"
        style={{ ...sheetBg, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)', maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h3 className="text-lg font-bold text-[#e8dfee]">Actividad reciente</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-2" style={{ maxHeight: 'calc(80vh - 100px)' }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-7 h-7 rounded-full border-2 animate-spin"
                style={{ borderColor: `${accentColor}30`, borderTopColor: accentColor }}
              />
            </div>
          ) : (sessions.length === 0 && tasks.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-[#958da1]">Sin actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-2 pb-2">

              {sessions.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] px-1 pt-1 pb-0.5">
                    Sesiones de gym
                  </p>
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(34,30,40,0.75)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: s.completed ? `${accentColor}20` : 'rgba(74,68,85,0.4)' }}
                      >
                        <Dumbbell size={15} style={{ color: s.completed ? accentColor : '#4a4455' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#e8dfee] truncate">
                          {DAY_NAMES[s.day_type] || s.day_type || 'Entrenamiento'}
                        </p>
                        <p className="text-xs text-[#958da1]">{relativeDate(s.date)}</p>
                      </div>
                      {s.completed && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: accentColor, background: `${accentColor}15` }}
                        >
                          ✓ Completado
                        </span>
                      )}
                    </div>
                  ))}
                </>
              )}

              {tasks.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#958da1] px-1 pt-3 pb-0.5">
                    Tareas completadas
                  </p>
                  {tasks.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(34,30,40,0.75)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(137,206,255,0.15)' }}
                      >
                        <CheckSquare size={15} style={{ color: '#89ceff' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#958da1] truncate line-through">{t.title}</p>
                        {t.project_title && (
                          <p className="text-xs text-[#4a4455]">{t.project_title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
