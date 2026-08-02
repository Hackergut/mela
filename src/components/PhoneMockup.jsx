import React from 'react';

/**
 * Mockup iPhone frontale stilizzato: cornice metallica, schermo e Dynamic Island.
 * Il contenuto `children` viene renderizzato come schermo (riempire con absolute inset-0).
 */
export default function PhoneMockup({ children, className = '', style }) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* Cornice metallica */}
      <div className="relative w-full aspect-[117/253] rounded-[2.2rem] p-[3px] bg-gradient-to-b from-[#a1a1a6] via-[#48484a] to-[#1c1c1e] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_30px_70px_-20px_rgba(0,0,0,0.9)]">
        {/* Schermo */}
        <div className="relative w-full h-full rounded-[1.95rem] overflow-hidden bg-black ring-1 ring-black/60">
          {/* Dynamic Island */}
          <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[34%] h-[22px] bg-black rounded-full z-30 ring-1 ring-white/5" />
          {children}
        </div>
      </div>
    </div>
  );
}