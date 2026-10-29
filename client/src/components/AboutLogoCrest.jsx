import React from 'react';

/**
 * AboutLogoCrest Component
 * Features the 3D circular emblem badge (transparent cutout with zero square black box)
 * with an orange background and metallic gold rim/logo, framed over the dark gray flowing
 * silk background with warm ambient glow.
 */
export default function AboutLogoCrest({ className = '', isBanner = false, showBadge = true }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0c0d10] flex items-center justify-center select-none group ${
        isBanner
          ? 'w-full py-16 sm:py-20 md:py-24 lg:py-28 border-b border-slate-900 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px]'
          : 'rounded-2xl border border-slate-800 shadow-xl py-12 px-8 aspect-[16/10] sm:aspect-video lg:aspect-[16/10]'
      } ${className}`}
    >
      {/* Background Image: High-res dark gray flowing silk waves */}
      <img
        src="/assets/about_crest_bg.jpg"
        alt="Skandha Group Luxury Heritage Background"
        className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out pointer-events-none"
      />

      {/* Subtle Radial Vignette for Depth */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/75 pointer-events-none" />

      {/* Ambient Brand Orange Back-Glow */}
      <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-brand-orange/20 blur-[100px] pointer-events-none animate-pulse duration-1000" />

      {/* Subtle Floating Embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#F15A24] animate-ping opacity-60 duration-1000" />
        <span className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-orange-300 shadow-[0_0_6px_#FF7A3D] animate-pulse opacity-70" />
        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_6px_#D94814] animate-pulse opacity-60" />
        <span className="absolute top-2/3 right-1/5 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#F15A24] animate-ping opacity-50 duration-700" />
      </div>

      {/* 5+ Years Legacy Brand Orange Badge in Top-Left (if enabled) */}
      {showBadge && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-7 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-brand-orange/40 text-[11px] sm:text-xs font-bold text-brand-orange flex items-center gap-2 shadow-lg pointer-events-none z-20">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          <span>5+ Years of Trust &amp; Excellence</span>
        </div>
      )}

      {/* 3D Circular Emblem Badge (Circle Only, Zero Black Box) */}
      <div className="relative z-10 flex items-center justify-center p-4">
        {/* Soft Golden/Orange Aura around the Circle */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-brand-orange/30 via-amber-500/20 to-transparent blur-xl pointer-events-none transform group-hover:scale-108 transition-transform duration-700" />

        <img
          src="/assets/skandha_circle_orange_crest.png"
          alt="Skandha Group 3D Circular Emblem with Orange Background"
          className="w-56 h-56 sm:w-68 sm:h-68 md:w-80 md:h-80 lg:w-88 lg:h-88 object-contain rounded-full filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] drop-shadow-[0_0_35px_rgba(241,90,36,0.35)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>
    </div>
  );
}
