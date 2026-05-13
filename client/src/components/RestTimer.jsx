import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

const NOTIFY_SUPPORTED = typeof window !== 'undefined' && 'Notification' in window;

function playBeep(frequency = 880, duration = 200, volume = 0.5) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (_) {}
}

function playCompletionSound() {
  playBeep(660, 150, 0.4);
  setTimeout(() => playBeep(880, 150, 0.4), 200);
  setTimeout(() => playBeep(1100, 300, 0.5), 400);
}

function notifyIfAllowed(title, opts = {}) {
  if (!NOTIFY_SUPPORTED || Notification.permission !== 'granted') return;
  try { new Notification(title, opts); } catch (_) {}
}

function tellSW(msg) {
  navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage(msg)).catch(() => {});
}

export default function RestTimer({ defaultTime = 90, onClose, accentColor = '#00FF88', exerciseName = '' }) {
  const [totalTime, setTotalTime] = useState(defaultTime);
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  // Stores the real-world timestamp when the timer was started/resumed
  const startTsRef = useRef(null);
  // Stores seconds elapsed before the current run (for pause/resume)
  const elapsedBeforeRef = useRef(0);
  const tickRef = useRef(null);

  const complete = useCallback((silent = false) => {
    clearInterval(tickRef.current);
    startTsRef.current = null;
    setIsRunning(false);
    setFinished(true);
    setTimeLeft(0);
    if (!silent) {
      playCompletionSound();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      notifyIfAllowed('¡Listo! 💪', {
        body: exerciseName ? `${exerciseName} — Siguiente serie` : 'Siguiente serie',
        tag: 'rest-done',
        icon: '/icons/icon-192.svg',
        silent: false,
      });
    }
    tellSW({ type: 'REST_TIMER_STOP' });
  }, [exerciseName]);

  const startRun = useCallback((duration, alreadyElapsed = 0) => {
    clearInterval(tickRef.current);
    elapsedBeforeRef.current = alreadyElapsed;
    startTsRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const elapsed = elapsedBeforeRef.current + Math.floor((Date.now() - startTsRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining === 3) playBeep(440, 100, 0.3);
      if (remaining === 0) complete();
    }, 250);
  }, [complete]);

  // Recover correct state when tab/app becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !isRunning || !startTsRef.current) return;
      const elapsed = elapsedBeforeRef.current + Math.floor((Date.now() - startTsRef.current) / 1000);
      const remaining = Math.max(0, totalTime - elapsed);
      if (remaining === 0) {
        complete();
      } else {
        setTimeLeft(remaining);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isRunning, totalTime, complete]);

  // Auto-start on mount
  useEffect(() => {
    setIsRunning(true);
    setFinished(false);
    elapsedBeforeRef.current = 0;
    startRun(defaultTime, 0);
    const endTime = Date.now() + defaultTime * 1000;
    tellSW({ type: 'REST_TIMER_START', endTime, exerciseName });
    notifyIfAllowed(`⏱ Descansando${exerciseName ? ` — ${exerciseName}` : ''}`, {
      body: `${Math.floor(defaultTime / 60) > 0 ? Math.floor(defaultTime / 60) + 'm ' : ''}${defaultTime % 60}s`,
      tag: 'rest-timer',
      icon: '/icons/icon-192.svg',
      silent: true,
    });
    return () => {
      clearInterval(tickRef.current);
      tellSW({ type: 'REST_TIMER_STOP' });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = () => {
    clearInterval(tickRef.current);
    // Freeze elapsed so resume can pick up from here
    elapsedBeforeRef.current += Math.floor((Date.now() - (startTsRef.current ?? Date.now())) / 1000);
    startTsRef.current = null;
    setIsRunning(false);
    tellSW({ type: 'REST_TIMER_STOP' });
  };

  const resume = () => {
    setIsRunning(true);
    startRun(totalTime, elapsedBeforeRef.current);
    const remainingSecs = Math.max(0, totalTime - elapsedBeforeRef.current);
    tellSW({ type: 'REST_TIMER_START', endTime: Date.now() + remainingSecs * 1000, exerciseName });
  };

  const reset = () => {
    clearInterval(tickRef.current);
    startTsRef.current = null;
    elapsedBeforeRef.current = 0;
    setIsRunning(false);
    setFinished(false);
    setTimeLeft(totalTime);
    tellSW({ type: 'REST_TIMER_STOP' });
  };

  const setPreset = (seconds) => {
    clearInterval(tickRef.current);
    elapsedBeforeRef.current = 0;
    setTotalTime(seconds);
    setIsRunning(true);
    setFinished(false);
    startRun(seconds, 0);
    const endTime = Date.now() + seconds * 1000;
    tellSW({ type: 'REST_TIMER_START', endTime, exerciseName });
  };

  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 1;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="w-full max-w-md p-5 slide-up shadow-[0_-4px_24px_rgba(0,0,0,0.5)]"
        style={{ background: '#1d1a24', borderRadius: '24px 24px 0 0', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#e8dfee]">Descanso</h3>
            {exerciseName && <p className="text-xs" style={{ color: '#958da1' }}>{exerciseName}</p>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#958da1' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Circular progress */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={accentColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
                style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {finished
                ? <span className="text-3xl">✓</span>
                : <span className="text-3xl font-bold tabular-nums" style={{ color: '#e8dfee' }}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
              }
            </div>
          </div>
          {finished && (
            <p className="font-semibold mt-2 animate-pulse" style={{ color: accentColor }}>¡Descanso completado!</p>
          )}
        </div>

        {/* Presets */}
        <div className="flex gap-2 mb-3">
          {[{ s: 30, label: '30s' }, { s: 45, label: '45s' }, { s: 60, label: '1m' }, { s: 75, label: '1¼m' }, { s: 90, label: '1½m' }, { s: 120, label: '2m' }].map(({ s, label }) => (
            <button
              key={s} onClick={() => setPreset(s)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-90"
              style={
                totalTime === s && !finished
                  ? { background: accentColor, color: '#15121b' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#958da1', border: '1px solid #4a4455' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#e8dfee', border: '1px solid #4a4455' }}
          >
            <RotateCcw size={18} />
            Reset
          </button>
          {isRunning ? (
            <button
              onClick={pause}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95"
              style={{ background: accentColor, color: '#15121b' }}
            >
              <Pause size={18} />
              Pausar
            </button>
          ) : (
            <button
              onClick={finished ? reset : resume}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95"
              style={{ background: accentColor, color: '#15121b' }}
            >
              <Play size={18} />
              {finished ? 'Reiniciar' : 'Continuar'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
