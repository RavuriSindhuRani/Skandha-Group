import React, { useState } from 'react';
import {
  Calendar,
  ExternalLink,
  Download
} from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal';
import { trackActivityEvent } from '../api/client';

export default function ProjectPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const marqueeItems = [
    'DTCP APPROVED OPEN PLOTS IN KADTHAL',
    'SRI SAILAM HIGHWAY & SAGAR HIGHWAY CORRIDOR',
    'PROXIMITY TO TELANGANA FUTURE CITY',
    'SKANDHA GROUP TRUSTED QUALITY',
    'DTCP SANCTIONED TLP NO. 87/2024/H',
    'TS RERA REGISTERED PO2400009081',
    '100% VASTHU COMPLIANT ALIGNMENT',
    '40 FT & 33 FT BLACKTOP ROADS',
    '10.50 ACRES GATED ESTATE',
    '96 NUMBERED VILLA PLOTS',
    'AC. 0.758 CENTRAL GREEN PARK',
    'IMMEDIATE SPOT REGISTRATION',
    'CLEAR TITLE & BANK LOAN FACILITY'
  ];

  const keyFacts = [
    { label: 'Project Name', value: 'Brundavanam' },
    { label: 'Venture Extent', value: '10.50 Acres' },
    { label: 'Total Units', value: '96 Open Plots' },
    { label: 'DTCP Sanction', value: 'TLP NO. 87/2024/H' },
    { label: 'TS RERA Registration', value: 'PO2400009081' },
    { label: 'Venture Location', value: 'Kadthal, Sri Sailam Highway' },
    { label: 'Highway Corridor', value: 'Connected to Sagar Highway' },
    { label: 'Growth Hub', value: 'Near Telangana Future City' },
    { label: 'Internal Roads', value: "40' & 33' Blacktop" },
    { label: 'Registration Status', value: 'Immediate Spot Ready' }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20 bg-slate-50">
      {/* ========================================================== */}
      {/* 1. PANORAMIC HERO BANNER (MATCHING REFERENCE DESIGN)       */}
      {/* ========================================================== */}
      <section className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex items-center overflow-hidden border-b border-slate-800">
        {/* Architectural Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/project_hero_bg.webp"
            alt="Skandha Group Brundavanam Aerial Estate"
            className="w-full h-full object-cover object-center"
          />
          {/* Deep Navy/Blue Translucent Gradient Overlay (Matching Reference) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071731]/92 via-[#091f42]/85 to-[#0c2856]/75" />
          <div className="absolute inset-0 bg-[#06142a]/30" />
        </div>

        {/* Diagonal Frosted Glass Light Sheen / Beam Effect (Matching Reference) */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-1"
          aria-hidden="true"
        >
          <div
            className="absolute -top-1/4 -left-1/4 w-[160%] h-[160%] opacity-25"
            style={{
              background:
                'linear-gradient(118deg, transparent 36%, rgba(255,255,255,0.35) 42%, transparent 47%, transparent 53%, rgba(255,255,255,0.2) 56%, transparent 60%)'
            }}
          />
        </div>

        {/* Subtle Background Watermark Typography */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-1"
          aria-hidden="true"
        >
          <span className="text-[12vw] sm:text-[10vw] font-black uppercase tracking-wider text-white/[0.035] leading-none whitespace-nowrap">
            BRUNDAVANAM
          </span>
        </div>

        {/* Top-Right Faint Watermark Text */}
        <div className="absolute top-6 right-6 sm:right-12 hidden sm:flex items-center gap-2 text-slate-300/40 text-[11px] font-bold tracking-widest uppercase pointer-events-none select-none z-10">
          <span>SKANDHA GROUP</span>
        </div>

        {/* Main Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              {/* Heading with Orange Badge (Exact Reference Layout) */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
                  Skandha Group
                </h1>
                <span className="bg-brand-orange text-white text-2xl sm:text-4xl lg:text-5xl font-extrabold px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-none shadow-xl tracking-tight inline-block">
                  Brundavanam
                </span>
              </div>

              {/* Tagline */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium tracking-wide drop-shadow max-w-2xl">
                Transforming Horizons, Securing Generational Wealth Along Srisailam Highway
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <a
                  href="/plots"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-sm shadow-lg transition-all active:scale-95"
                >
                  <span>Interactive Plot Availability (2D/3D)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href="/assets/skandha_brochure.pdf"
                  download="Skandha_Group_Kadthal_Brochure.pdf"
                  onClick={() => trackActivityEvent('brochure_downloaded', null, { label: 'Official Brochure PDF', source: 'ProjectPage' })}
                  className="inline-flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 hover:border-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-sm backdrop-blur-sm transition-all"
                >
                  <Download className="w-4 h-4 text-brand-orange" />
                  <span>Download Official Brochure</span>
                </a>

                <button
                  onClick={() => {
                    trackActivityEvent('enquiry_started', null, { source: 'ProjectPage_BookSiteVisit' });
                    setIsEnquiryOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-sm backdrop-blur-sm transition-all"
                >
                  <Calendar className="w-4 h-4 text-brand-orange" />
                  <span>Book Site Visit</span>
                </button>
              </div>
            </div>

            {/* Right Side Circular Orange Dot Indicator (Matching Reference) */}
            <div className="hidden lg:flex items-center justify-center shrink-0 pr-6">
              <div
                className="w-8 h-8 rounded-full border-2 border-brand-orange flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.6)] cursor-pointer hover:scale-110 transition-transform"
                title="Brundavanam - Flagship Gated Estate"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specification Marquee Ribbon */}
      <div className="bg-[#071326] py-3.5 border-y border-[#0d223f] overflow-hidden shadow-inner -mt-16 sm:-mt-20">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-slate-300">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 shrink-0">
              <span className="text-brand-orange">&#10022;</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. BRUNDAVANAM AT A GLANCE (QUICK SPECS MATRIX)            */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-orange mb-1">
                <span className="h-px w-6 bg-brand-orange/40" />
                <span className="w-1.5 h-1.5 rounded-sm bg-brand-orange" />
                FLAGSHIP VENTURE
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
                Brundavanam – Project Overview &amp; Key Facts
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                A 10.50-acre DTCP Sanctioned and TS RERA Registered gated residential plotted development engineered with 96 Vasthu-harmonized villa plots.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg shadow-md transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Private Visit</span>
              </button>
            </div>
          </div>

          {/* 10-Item Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {keyFacts.map((fact, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-orange/40 hover:bg-white transition-all space-y-1"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {fact.label}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900">
                  {fact.value}
                </div>
              </div>
            ))}
          </div>

          {/* Legal Compliance Verification Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-200/80">
              <img
                src="/assets/dtcp_approved_stamp.svg"
                alt="DTCP Approved Stamp"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statutory Sanction
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  DTCP Approved Layout Plan
                </div>
                <div className="text-xs font-semibold text-brand-orange">
                  Sanctioned Order No: TLP NO. 87/2024/H
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-100 to-white border border-slate-200">
              <img
                src="/assets/ts_rera_stamp.svg"
                alt="TS RERA Registration Stamp"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Regulatory Compliance
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  Telangana RERA Registered
                </div>
                <div className="text-xs font-semibold text-brand-orange">
                  Registration ID: PO2400009081
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
