import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import PhoneMockup from '@/components/PhoneMockup';
import { Flashlight, Camera, MessageCircle, Wifi, BatteryMedium, Signal } from 'lucide-react';

function StatusBar({ dark = false }) {
  const c = dark ? 'text-white' : 'text-white';
  return (
    <div className={`absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-5 pt-2.5 text-[11px] font-semibold z-20 ${c}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={11} />
        <Wifi size={11} />
        <BatteryMedium size={13} />
      </div>
    </div>
  );
}

/* Schermo 1 — app conferenza */
function ScreenConference() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2a] to-[#020617] text-white">
      <StatusBar />
      <div className="pt-14 px-5">
        <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-300/70">Eventi</p>
        <h3 className="text-base font-bold leading-tight mt-1.5">
          Hydrogeology<br />Research Conference
        </h3>
        <p className="text-[10px] text-white/50 mt-2">12–14 Set · Auditorium C</p>
        <button className="mt-3.5 px-3.5 py-1.5 rounded-full bg-[#FF9500] text-black text-[10px] font-bold">
          More Info
        </button>
        <div className="mt-4 space-y-2">
          {['Keynote: Acquiferi','Workshop GIS','Panel: Clima'].map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-400/20 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold leading-tight">{t}</p>
                <p className="text-[8px] text-white/40">09:00 — 10:30</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Schermo 2 — lock screen con wallpaper */
function ScreenLock() {
  return (
    <div className="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1583511655857-d19b40a15a54?w=500&auto=format&fit=crop"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
      <StatusBar />
      <div className="absolute top-14 left-0 right-0 text-center text-white">
        <p className="text-sm font-medium drop-shadow">Lun 3 ago</p>
        <p className="text-6xl font-light leading-none mt-1 drop-shadow-lg tracking-tight">9:41</p>
      </div>
      <div className="absolute bottom-7 left-0 right-0 flex items-center justify-between px-8">
        <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Flashlight size={15} className="text-white" />
        </div>
        <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Camera size={15} className="text-white" />
        </div>
      </div>
    </div>
  );
}

/* Schermo 3 — connessione satellite */
function ScreenSatellite() {
  return (
    <div className="absolute inset-0 bg-black text-white">
      <StatusBar />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-emerald-500 to-blue-900 shadow-[0_0_60px_rgba(59,130,246,0.45)] relative">
          <div className="absolute inset-0 rounded-full opacity-40 bg-[radial-gradient(circle_at_30%_30%,#fff,transparent_45%)]" />
        </div>
        <p className="text-sm font-semibold">Keep Pointing at Satellite</p>
        <p className="text-[10px] text-white/40">Connessione in corso…</p>
      </div>
      <div className="absolute bottom-5 left-3 right-3 rounded-2xl bg-white/10 backdrop-blur-md px-3 py-2.5 flex items-center gap-2 border border-white/10">
        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <MessageCircle size={13} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold leading-tight">Messaggi</p>
          <p className="text-[9px] text-white/50 leading-tight">Nuovo messaggio da Satellite</p>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const phones = [
    { screen: <ScreenConference />, rot: 'rotateY(13deg) rotate(3deg)', delay: 0.18, scale: 'md:scale-[0.84] md:-mr-3' },
    { screen: <ScreenLock />, rot: 'rotateY(0deg) rotate(0deg)', delay: 0.05, scale: 'md:scale-100 z-10' },
    { screen: <ScreenSatellite />, rot: 'rotateY(-13deg) rotate(-3deg)', delay: 0.3, scale: 'md:scale-[0.84] md:-ml-3' },
  ];

  return (
    <section className="relative bg-black pt-6 pb-0 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Sub-nav prodotto a pillola */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-md mb-12 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#161616]/80 backdrop-blur-md border border-white/5"
        >
          <span className="text-sm font-semibold text-white pl-1">iPhone 17 Pro</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo('categories')}
              className="px-4 py-1.5 rounded-full border border-white/25 text-white text-xs font-medium hover:bg-white/10 transition-colors"
            >
              Esplora
            </button>
            <button
              onClick={() => scrollTo('products')}
              className="px-4 py-1.5 rounded-full bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors"
            >
              Acquista
            </button>
          </div>
        </motion.div>

        {/* Pre-titolo */}
        <motion.p
          {...heroEntrance(0)}
          className="text-center text-base md:text-lg font-medium text-[#FF9500] mb-3"
        >
          Tutta la famiglia
        </motion.p>

        {/* Headline due righe */}
        <motion.h1
          {...heroEntrance(0.08)}
          className="text-center text-4xl md:text-6xl lg:text-7xl font-bold text-[#F5F5F7] leading-[1.05] tracking-tight mb-14"
        >
          Tutto l'indispensabile.
          <br />
          Tutto su iPhone.
        </motion.h1>

        {/* Showcase tre mockup flottanti */}
        <div className="relative" style={{ perspective: '1500px' }}>
          <div className="flex items-center justify-center gap-2 md:gap-3">
            {phones.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: p.delay, duration: 0.8, ease: 'easeOut' }}
                className={`relative w-[34%] md:w-[30%] ${p.scale}`}
                style={{ transform: p.rot, transformStyle: 'preserve-3d' }}
              >
                <PhoneMockup>{p.screen}</PhoneMockup>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cue di scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-1.5 pt-12 pb-8 text-white/30"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Scorri per esplorare</span>
          <motion.svg
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </motion.svg>
        </motion.div>
      </div>
    </section>
  );
}