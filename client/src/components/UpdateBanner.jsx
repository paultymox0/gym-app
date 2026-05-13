import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';

export default function UpdateBanner() {
  const [reg, setReg] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    function onUpdate(e) { setReg(e.detail.reg); }
    window.addEventListener('sw:update-available', onUpdate);
    return () => window.removeEventListener('sw:update-available', onUpdate);
  }, []);

  if (!reg) return null;

  function handleUpdate() {
    setApplying(true);
    const sw = reg.waiting;
    if (sw) sw.postMessage({ type: 'SKIP_WAITING' });
    // reload is triggered by controllerchange listener in main.jsx
  }

  return createPortal(
    <button
      onClick={handleUpdate}
      disabled={applying}
      className="fixed left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl transition-all active:scale-[0.97]"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
        background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(109,40,217,0.4)',
        opacity: applying ? 0.7 : 1,
      }}
    >
      <RefreshCw size={16} className={applying ? 'animate-spin' : ''} />
      {applying ? 'Actualizando…' : 'Nueva versión disponible — Pulsa para actualizar'}
    </button>,
    document.body
  );
}
