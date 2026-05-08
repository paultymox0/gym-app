import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

function playBeep(frequency = 880, duration = 200, volume = 0.5) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    // Audio not available
  }
}

function playCompletionSound() {
  // Three ascending beeps
  playBeep(660, 150, 0.4);
  setTimeout(() => playBeep(880, 150, 0.4), 200);
  setTimeout(() => playBeep(1100, 300, 0.5), 400);
}

export default function RestTimer({ defaultTime = 90, onClose }) {
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(defaultTime);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setFinished(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setFinished(false);
  }, [totalTime]);

  const setPreset = useCallback((seconds) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
    setFinished(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setFinished(true);
            playCompletionSound();
            // Vibration if available
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          // Warning beep at 3 seconds
          if (prev === 4) {
            playBeep(440, 100, 0.3);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Auto-start when mounted
  useEffect(() => {
    setIsRunning(true);
  }, []);

  const progress = 1 - timeLeft / totalTime;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-[#1E293B] rounded-t-3xl w-full p-5 slide-up shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Descanso</h3>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-slate-400 active:scale-90">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Circular progress */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={finished ? '#10B981' : '#3B82F6'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {finished ? (
                <span className="text-2xl">✓</span>
              ) : (
                <span className="text-3xl font-bold text-white tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>

          {finished && (
            <p className="text-green-400 font-semibold mt-2 animate-pulse">¡Descanso completado!</p>
          )}
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 mb-3">
          {[
            { s: 30, label: '30s' },
            { s: 45, label: '45s' },
            { s: 60, label: '1m' },
            { s: 75, label: '1.25m' },
            { s: 90, label: '1.5m' },
            { s: 120, label: '2m' },
          ].map(({ s, label }) => (
            <button
              key={s}
              onClick={() => setPreset(s)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-90 ${
                totalTime === s && !finished
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#0F172A] text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl bg-[#0F172A] text-slate-300 font-semibold flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          {isRunning ? (
            <button
              onClick={pause}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95"
            >
              <Pause size={18} />
              Pausar
            </button>
          ) : (
            <button
              onClick={start}
              disabled={finished && timeLeft === 0}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Play size={18} />
              {finished ? 'Reiniciar' : 'Iniciar'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

