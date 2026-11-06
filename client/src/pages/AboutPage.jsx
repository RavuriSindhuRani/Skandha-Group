import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Award,
  CheckCircle,
  HeartHandshake,
  Quote,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Building
} from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal';
import AboutLogoCrest from '../components/AboutLogoCrest';

export default function AboutPage({ settings }) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const officeAddress = (settings && settings.officeAddress) || '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079';
  const email = (settings && settings.contactEmail) || 'contact@skandhagroup.com';
  const reraNo = (settings && settings.reraNumber) || 'PO2400009081';
  const dtcpNo = (settings && settings.dtcpNumber) || 'TLP NO. 87/2024/H';

  const pillars = [
    {
      title: '100% Clear Titles & Transparency',
      desc: 'Every layout undertaken by Skandha Group undergoes thorough legal scrutiny, ensuring completely clean title deeds, survey clearance, and hassle-free spot registrations.',
      icon: ShieldCheck
    },
    {
      title: 'Approved Regulatory Compliance',
      desc: 'Strict adherence to DTCP and TS RERA statutory guidelines guarantees peace of mind, high bank-loan eligibility, and legally secured land ownership.',
      icon: Award
    },
    {
      title: 'Strategic High-Growth Corridors',
      desc: 'Our projects are located along expanding highway corridors, life science hubs, and industrial belts to ensure maximum capital appreciation for investors and homeowners.',
      icon: CheckCircle
    },
    {
      title: 'Customer-First Execution',
      desc: 'From initial site visit to spot registration and long-term layout maintenance, we ensure seamless service and dedicated post-purchase support.',
      icon: HeartHandshake
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* ========================================================== */}
      {/* 1. LUXURY CREST HERO BANNER (MATCHING REFERENCE IMAGE)     */}
      {/* ========================================================== */}
      <AboutLogoCrest isBanner={true} showBadge={true} />

      {/* ========================================================== */}
      {/* 2. VISION & MISSION WITH IMAGE COLLAGE                     */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Overlapping Architectural Image Collage Matching Reference */}
          <div className="lg:col-span-6 relative">
            {/* Decorative Dot Matrix on Left */}
            <div className="hidden sm:grid absolute -left-10 top-1/2 -translate-y-1/2 grid-cols-4 gap-2.5 opacity-30 pointer-events-none z-0">
              {[...Array(28)].map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              ))}
            </div>

            <div className="relative z-10 space-y-3">
              {/* Top Row: Arch Detail + Terrace Garden + Orange 5 Years Card */}
              <div className="grid grid-cols-12 gap-3 items-stretch">
                <div className="col-span-3 rounded-lg overflow-hidden shadow-md border-2 border-white bg-slate-100">
                  <img
                    src="/assets/about_arch_detail.webp"
                    alt="Modern Villa Architecture"
                    className="w-full h-28 sm:h-36 object-cover"
                  />
                </div>
                <div className="col-span-5 rounded-lg overflow-hidden shadow-md border-2 border-white bg-slate-100">
                  <img
                    src="/assets/about_terrace_garden.webp"
                    alt="Terrace Garden Pergola"
                    className="w-full h-28 sm:h-36 object-cover"
                  />
                </div>
                <div className="col-span-4 bg-brand-orange text-white rounded-lg shadow-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                  <span className="font-serif text-4xl sm:text-5xl font-black leading-none">
                    5
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider mt-1.5 leading-tight text-orange-100">
                    Years of Experiences
                  </span>
                </div>
              </div>

              {/* Bottom Main Photo: Grand Entrance Boulevard */}
              <div className="rounded-xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                <img
                  src="/assets/about_venture_entrance.webp"
                  alt="Skandha Group Grand Entrance Boulevard"
                  className="w-full h-56 sm:h-72 object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Right Column: OUR VISION & OUR MISSION Cards Matching Reference */}
          <div className="lg:col-span-6 space-y-6">
            {/* OUR VISION */}
            <div className="flex items-start gap-4 p-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-wide uppercase">
                  OUR VISION
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                  We don’t just build properties&mdash;we craft lifestyles. Every Skandha Group project is designed to blend modern living with affordability, ensuring families thrive in well-connected, secure, and vibrant communities.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* OUR MISSION */}
            <div className="flex items-start gap-4 p-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-wide uppercase">
                  OUR MISSION
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                  To create quality, affordable homes that foster vibrant, connected communities&mdash;where families don't just live, they thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. MORE THAN HOMES - A LEGACY OF TRUST & VALUE             */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#fbfcff] rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Heading & Button */}
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-orange bg-orange-100/70 px-3 py-1 rounded-sm border border-orange-200/60">
                Legacy. Transparency. Growth.
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                More Than Homes &ndash; A Legacy of Trust &amp; Value
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Skandha Group specializes in delivering DTCP approved open plots in Kadthal along the high-growth Sri Sailam Highway and Sagar Highway corridors, strategically aligned with the Telangana Future City growth belt.
              </p>

              <div>
                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="bg-brand-orange hover:bg-orange-600 active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-md shadow-lg shadow-orange-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Ventures</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: 2x2 Stats Grid Matching Reference Image */}
            <div className="lg:col-span-7 grid grid-cols-2 divide-x divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              {/* Stat 1: 5+ Years of Excellence */}
              <div className="p-6 sm:p-8 flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full border-2 border-orange-200 bg-orange-50/70 text-brand-orange flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-all duration-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none">
                    5<span className="text-brand-orange">+</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
                    Years of Excellence
                  </div>
                </div>
              </div>

              {/* Stat 2: 2.5k+ Acres Developed */}
              <div className="p-6 sm:p-8 flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full border-2 border-orange-200 bg-orange-50/70 text-brand-orange flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-all duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none">
                    2.5k<span className="text-brand-orange">+</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
                    Acres Developed
                  </div>
                </div>
              </div>

              {/* Stat 3: 25k+ Happy Customers */}
              <div className="p-6 sm:p-8 flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full border-2 border-orange-200 bg-orange-50/70 text-brand-orange flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-all duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none">
                    25k<span className="text-brand-orange">+</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
                    Happy Customers
                  </div>
                </div>
              </div>

              {/* Stat 4: 100%+ Legal Compliance */}
              <div className="p-6 sm:p-8 flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full border-2 border-orange-200 bg-orange-50/70 text-brand-orange flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-all duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none">
                    100%<span className="text-brand-orange">+</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
                    legal compliance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. CORPORATE HEADQUARTERS & CONTACT SECTION                */}
      {/* ========================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Head Office Card */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-black px-4 py-2.5 rounded-xl inline-block shadow-sm">
                <img
                  src="/assets/skandha_logo_official.png"
                  alt="Skandha Group"
                  className="h-11 w-auto object-contain"
                />
              </div>
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Corporate Headquarters
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span className="leading-relaxed">{officeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-brand-orange font-semibold">
                  {email}
                </a>
              </div>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 leading-relaxed">
              <strong>Spot Registration Commitment:</strong> Transparent documentation with on-site surveyed boundary pegs, clear Vasthu alignments, and spot registration.
            </div>
          </div>

          {/* Project Site Card */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              <MapPin className="w-3.5 h-3.5" />
              <span>Project Site Office</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Kadthal Venture &bull; Srisailam Highway
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Adjoining 4-lane NH 765 Srisailam Highway, Kadthal Mandal, Ranga Reddy District, Telangana - 509358. Just 1 minute drive from Maisigandi Temple.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900">Daily Guided Site Tours:</div>
              <p>Complimentary escorted site visits available daily with cab pickup from Hyderabad.</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Guided Site Tour</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
