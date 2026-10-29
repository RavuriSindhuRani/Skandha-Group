import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, X, Star, ExternalLink, CheckCircle2, MapPin } from 'lucide-react';
import {
  fetchPublicSettings,
  fetchPlotStats,
  fetchGallery,
  submitLead,
  trackActivityEvent
} from '../api/client';
import EnquiryModal from '../components/EnquiryModal';
import Lightbox from '../components/Lightbox';

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(2);
  const [testimonialSlide, setTestimonialSlide] = useState(0);

  // Book a Site Visit Form State
  const [siteVisitForm, setSiteVisitForm] = useState({ name: '', phone: '', email: '' });
  const [siteVisitLoading, setSiteVisitLoading] = useState(false);
  const [siteVisitSuccess, setSiteVisitSuccess] = useState(false);
  const [siteVisitError, setSiteVisitError] = useState('');

  const handleSiteVisitSubmit = async (e) => {
    e.preventDefault();
    if (!siteVisitForm.name.trim() || !siteVisitForm.phone.trim()) {
      setSiteVisitError('Please provide your name and phone number');
      return;
    }
    setSiteVisitLoading(true);
    setSiteVisitError('');
    try {
      const res = await submitLead({
        name: siteVisitForm.name,
        phone: siteVisitForm.phone,
        email: siteVisitForm.email,
        notes: 'Book a site visit request from Homepage'
      });
      if (res.success) {
        setSiteVisitSuccess(true);
        setSiteVisitForm({ name: '', phone: '', email: '' });
        trackActivityEvent('site_visit_booked', null, { source: 'homepage' });
      } else {
        setSiteVisitError(res.error || 'Failed to submit request');
      }
    } catch (err) {
      setSiteVisitError(err.message || 'Error submitting site visit request');
    } finally {
      setSiteVisitLoading(false);
    }
  };

  useEffect(() => {
    trackActivityEvent('layout_opened', null, { source: 'homepage' });
    fetchPublicSettings().then(res => res.success && setSettings(res.settings)).catch(console.error);
    fetchPlotStats().then(res => res.success && setStats(res.stats)).catch(console.error);
    fetchGallery().then(res => res.success && setGallery(res.items.slice(0, 6))).catch(console.error);
  }, []);

  return (
    <div className="pb-20 overflow-hidden bg-[#000000] text-slate-100 relative">
      {/* ========================================================== */}
      {/* 1. CLEAN HERO BANNER IMAGE (ZERO CONTENT OVER BACKGROUND)   */}
      {/* ========================================================== */}
      <section className="relative w-full overflow-hidden bg-black aspect-[16/9] min-h-[440px] max-h-[82vh] flex items-end">
        {/* Clean Full-Width Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero_cover.jpg"
            alt="Skandha Group Real Estate Developer Hyderabad"
            className="w-full h-full object-cover object-[center_25%]"
            loading="eager"
            fetchPriority="high"
          />
          {/* Subtle bottom shadow gradient to anchor the 3-feature ribbon */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. CONNECTED 3-FEATURE RIBBON                              */}
      {/* ========================================================== */}
      <section className="relative -mt-16 sm:-mt-20 lg:-mt-24 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Connected 3-Feature Ribbon With Chevron */}
        <div className="feature-ribbon-wrap">
          {/* Feature 1 (Left Box: White) */}
          <div className="feature-ribbon-item">
            <div className="feature-ribbon-icon shrink-0">
              <img
                src="/assets/feature_icon_handshake.png"
                alt="5 years of Trusted Real Estate Excellence"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                5 years of Trusted Real Estate Excellence
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our expertise ensures every venture is planned and executed to perfection, offering secure investments and lasting value.
              </p>
            </div>
          </div>

          {/* Feature 2 (Middle Box: Brand Orange with Chevron Arrow) */}
          <div className="feature-ribbon-item">
            <div className="feature-ribbon-icon shrink-0">
              <img
                src="/assets/feature_icon_map.png"
                alt="Prime Locations for Future Growth"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="space-y-1.5 text-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white leading-tight feature-ribbon-title">
                Prime Locations for Future Growth
              </h3>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed feature-ribbon-text">
                Invest in plots and villas designed for long-term appreciation and a premium lifestyle in high-growth corridors.
              </p>
            </div>
          </div>

          {/* Feature 3 (Right Box: White) */}
          <div className="feature-ribbon-item">
            <div className="feature-ribbon-icon shrink-0">
              <img
                src="/assets/feature_icon_tailored.png"
                alt="Tailored to Your Needs"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                Tailored to Your Needs
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                At Skandha Group, we believe in creating homes that reflect your dreams. From customizable plots to modern villas, every project is designed with your lifestyle in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections Wrapper */}
      <div className="space-y-16 mt-8 sm:mt-10">

      {/* ========================================================== */}
      {/* 3. PRIME PROJECTS CARDS (ALL 6 CARDS UNIQUE & VISIBLE)     */}
      {/* ========================================================== */}
      <section id="projects" className="bg-[#000000] text-white py-2 sm:py-4 scroll-mt-20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading: Skandha Group */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
              <span className="w-3.5 h-3.5 bg-brand-orange rounded-sm inline-block shadow-sm" />
              <h2 className="font-bold tracking-widest uppercase">
                SKANDHA GROUP
              </h2>
            </div>
            {/* Orange horizontal accent rule matching Reference */}
            <div className="w-40 sm:w-52 h-[2px] bg-brand-orange mx-auto mt-2" />
          </div>

          {/* 6 Cards Grid: Exactly 6 distinct unique Skandha Group development visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[
              {
                id: 1,
                name: 'Premium Plotted Communities',
                image: '/assets/about_venture_entrance.jpg',
                link: '/project'
              },
              {
                id: 2,
                name: 'Strategic High-Growth Corridors',
                image: '/assets/brundavanam_boulevard.jpg',
                link: '/about'
              },
              {
                id: 3,
                name: 'Vasthu-Compliant Master Layouts',
                image: '/assets/about_arch_detail.jpg',
                link: '/project'
              },
              {
                id: 4,
                name: 'Luxury Residential Living',
                image: '/assets/luxury_villa_day.jpg',
                link: '/about'
              },
              {
                id: 5,
                name: 'Lush Landscaped Open Spaces',
                image: '/assets/about_terrace_garden.jpg',
                link: '/project'
              },
              {
                id: 6,
                name: 'Architectural Excellence & Trust',
                image: '/assets/villa_twilight_lighting.jpg',
                link: '/contact'
              }
            ].map((proj) => {
              const isActive = activeProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setActiveProjectId(isActive ? null : proj.id)}
                  className={`transition-all duration-300 rounded-2xl p-2.5 cursor-pointer group relative ${
                    isActive
                      ? 'border-t-4 border-b-4 border-brand-orange bg-slate-900/60 shadow-2xl shadow-orange-500/20'
                      : 'border-t-4 border-b-4 border-transparent hover:border-t-brand-orange/60 hover:border-b-brand-orange/60'
                  }`}
                >
                  {/* Clean Image Container without play button or text */}
                  <div className="aspect-[16/10] sm:aspect-video w-full rounded-xl overflow-hidden relative bg-slate-950 border border-slate-800/80 shadow-lg">
                    <img
                      src={proj.image}
                      alt={proj.name}
                      className="w-full h-full object-cover transform group-hover:scale-106 transition-transform duration-700 ease-out"
                    />
                    {/* Subtle Ambient Hover Overlay */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      </div>

      {/* ========================================================== */}
      {/* 4. STICKY PARALLAX HIGHLIGHTS STRIP                        */}
      {/* ========================================================== */}
      <section
        className="relative w-full overflow-hidden py-14 sm:py-16 lg:py-20 border-y border-slate-900 bg-fixed bg-center bg-cover mt-12 sm:mt-16"
        style={{
          backgroundImage: `url('/assets/avenue_lighting.jpg')`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Translucent Overlay (86% opacity) matching Reference */}
        <div className="absolute inset-0 bg-black/85 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
            {/* 1. 5+ Years of Excellence */}
            <div className="flex flex-col items-center justify-center space-y-3 group">
              <div className="h-14 sm:h-16 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/assets/counter_icon_excellence.svg"
                  alt="5+ Years of Excellence"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide">
                5+ Years of Excellence
              </h3>
            </div>

            {/* 2. 25k + Happy Customers */}
            <div className="flex flex-col items-center justify-center space-y-3 group">
              <div className="h-14 sm:h-16 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/assets/counter_icon_customers.svg"
                  alt="25k + Happy Customers"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide">
                25k + Happy Customers
              </h3>
            </div>

            {/* 3. 2.50K Acres Developed */}
            <div className="flex flex-col items-center justify-center space-y-3 group">
              <div className="h-14 sm:h-16 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/assets/counter_icon_acres.webp"
                  alt="2.50K Acres Developed"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide">
                2.50K Acres Developed
              </h3>
            </div>

            {/* 4. 100% Legal Compliance */}
            <div className="flex flex-col items-center justify-center space-y-3 group">
              <div className="h-14 sm:h-16 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/assets/counter_icon_compliance.svg"
                  alt="100% Legal Compliance"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide">
                100% Legal Compliance
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. ABOUT US SECTION                                        */}
      {/* ========================================================== */}
      <section id="about" className="relative bg-[#000000] text-white py-16 sm:py-20 lg:py-24 border-b border-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Column: Authentic Skandha Luxury Villa Visual */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-transparent rounded-2xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800/80 shadow-2xl flex items-center justify-center aspect-[16/10] sm:aspect-video lg:aspect-[16/10]">
                <img
                  src="/assets/luxury_villa_day.jpg"
                  alt="Skandha Group Luxury Plotted Community"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* 5+ Years Legacy Gold Badge in Top-Left */}
                <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-amber-500/40 text-[11px] sm:text-xs font-bold text-amber-400 flex items-center gap-2 shadow-lg pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>5+ Years of Trust & Excellence</span>
                </div>
              </div>
            </div>

            {/* Right Column: About Us Content */}
            <div className="space-y-6">
              {/* Eyebrow Badge */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-orange">
                <span className="flex items-center gap-1.5 opacity-90">
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                </span>
                <span className="w-8 sm:w-12 h-[2px] bg-brand-orange inline-block" />
                <span className="font-extrabold tracking-widest">ABOUT US</span>
                <span className="w-8 sm:w-12 h-[2px] bg-brand-orange inline-block" />
                <span className="flex items-center gap-1.5 opacity-90">
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                We Provide The Beauty of Your Home
              </h2>

              {/* Paragraph */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Skandha Group has been a trusted name in the real estate industry, bringing over 5 years of dedicated excellence to creating affordable and high-quality living spaces in and around Hyderabad. With a strong reputation for statutory compliance and customer satisfaction, we specialize in developing a wide range of real estate ventures, including DTCP and TS RERA sanctioned plots, luxury villas, and residential investments in prime locations along high-growth corridors.
              </p>

              {/* Action Button (Right-side play button removed as requested) */}
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-7 sm:px-8 py-3.5 sm:py-4 rounded-md shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>about more</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 6. WHY CHOOSE US SECTION                                   */}
      {/* ========================================================== */}
      <section className="relative bg-[#000000] text-white py-16 sm:py-20 lg:py-24 border-b border-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Column: Why Choose Skandha Group Title & Points */}
            <div className="space-y-6">
              {/* Eyebrow Badge */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-orange">
                <span className="flex items-center gap-1.5 opacity-90">
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                </span>
                <span className="w-8 sm:w-12 h-[2px] bg-brand-orange inline-block" />
                <span className="font-extrabold tracking-widest">WHY CHOOSE US</span>
                <span className="w-8 sm:w-12 h-[2px] bg-brand-orange inline-block" />
                <span className="flex items-center gap-1.5 opacity-90">
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                  <span className="w-1.5 h-1.5 bg-brand-orange rotate-45 inline-block" />
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Why Choose Skandha Group?
              </h2>

              {/* Icon List Points */}
              <ul className="space-y-4 pt-2">
                {[
                  '5 Years of Trust',
                  'Customer-Centric Approach',
                  'Prime Locations',
                  'Transparency & Integrity',
                  'End to End Expertise'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 group">
                    <span className="w-3.5 h-3.5 text-brand-orange shrink-0 flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-brand-orange text-brand-orange" />
                    </span>
                    <span className="text-base sm:text-lg lg:text-xl font-medium text-white group-hover:text-brand-orange transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Signature Architecture Visual */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-600/20 via-amber-600/10 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl aspect-[16/10] sm:aspect-video lg:aspect-[16/10]">
                <img
                  src="/assets/villa_twilight_lighting.jpg"
                  alt="Skandha Group Signature Villa Architecture"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 7. TESTIMONIALS SECTION                                    */}
      {/* ========================================================== */}
      <section
        id="testimonials"
        className="relative bg-black text-white py-20 sm:py-24 lg:py-28 overflow-hidden bg-cover bg-bottom border-b border-slate-900"
        style={{
          backgroundImage: `url('/assets/pool_lighting.jpg')`
        }}
      >
        {/* Dark Translucent Overlay (78% opacity) */}
        <div className="absolute inset-0 bg-[#000308]/78 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header: Centered Eyebrow & Title */}
          <div className="text-center mb-12 sm:mb-16">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white">
              <span className="w-4 h-4 bg-brand-orange rounded flex items-center justify-center shadow-sm">
                <span className="w-1.5 h-1.5 border border-white rounded-[1px]" />
              </span>
              <span className="tracking-widest">TESTIMONIALS</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mt-3">
              What Our Client Say?
            </h2>
          </div>

          {/* Testimonial Cards Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {(testimonialSlide === 0
              ? [
                  {
                    id: 1,
                    name: 'Rahul',
                    rating: 5,
                    text: 'Second time buying with Skandha Group—great experience again. Despite market delays, the management went above and beyond to close the deal and deliver on time.'
                  },
                  {
                    id: 2,
                    name: 'Suresh',
                    rating: 5,
                    text: '"Great experience with Skandha—my investments were worth it, boosting my assets and lifestyle. You\'ve truly changed my life!'
                  },
                  {
                    id: 3,
                    name: 'Teja',
                    rating: 5,
                    text: "Skandha's service and potential made all my investments worthwhile, boosting my assets and lifestyle—you've truly made my life meaningful!"
                  }
                ]
              : [
                  {
                    id: 4,
                    name: 'Neelambari Devi',
                    rating: 5,
                    text: 'My first property investment with Skandha Group was smooth and trustworthy—the responsive team guided me patiently. A big step for my family’s future!'
                  },
                  {
                    id: 5,
                    name: 'Kiran Kumar',
                    rating: 5,
                    text: 'Top-tier statutory sanctions, crystal-clear documentation, and modern plotted infrastructure. Exceptional appreciation in prime high-growth corridor!'
                  },
                  {
                    id: 6,
                    name: 'Swapna Reddy',
                    rating: 5,
                    text: 'Dedicated site visits and effortless registration. The avenue plantation, underground drainage, and grand entrance arch are truly first-class.'
                  }
                ]
            ).map((item) => (
              <div
                key={item.id}
                className="relative bg-[#111111]/95 border border-slate-800/80 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden shadow-2xl transition-all duration-300 hover:border-brand-orange/40 hover:-translate-y-1"
              >
                {/* Top-Right Curved Orange Quote Badge */}
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-brand-orange rounded-bl-[42px] sm:rounded-bl-[48px] flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white translate-x-1 -translate-y-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Circular Gradient Avatar Badge */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-brand-orange/50 shadow-xl mt-2 mb-4 bg-gradient-to-tr from-brand-orange via-orange-600 to-amber-500 flex items-center justify-center text-white text-2xl font-serif font-bold shadow-orange-600/30">
                  <span>{item.name.charAt(0)}</span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg sm:text-xl text-white tracking-wide mb-2.5">
                  {item.name}
                </h3>

                {/* 5-Star Rating */}
                <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-10">
            <button
              onClick={() => setTestimonialSlide(0)}
              aria-label="Testimonial Page 1"
              className={`transition-all duration-300 rounded-full ${
                testimonialSlide === 0
                  ? 'w-7 h-2.5 bg-brand-orange shadow-md shadow-orange-500/50'
                  : 'w-2.5 h-2.5 bg-brand-orange/40 hover:bg-brand-orange/70'
              }`}
            />
            <button
              onClick={() => setTestimonialSlide(1)}
              aria-label="Testimonial Page 2"
              className={`transition-all duration-300 rounded-full ${
                testimonialSlide === 1
                  ? 'w-7 h-2.5 bg-brand-orange shadow-md shadow-orange-500/50'
                  : 'w-2.5 h-2.5 bg-brand-orange/40 hover:bg-brand-orange/70'
              }`}
            />
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 8. VISIT OUR OFFICE & BOOK A SITE VISIT SECTION             */}
      {/* ========================================================== */}
      <section
        id="contact"
        className="relative bg-black text-white py-16 sm:py-20 lg:py-24 border-b border-slate-900 overflow-hidden"
      >
        {/* Subtle ambient back-glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch">
            {/* Left Column: Visit Our Office & Map (Matches Right Side Height) */}
            <div className="flex flex-col justify-between h-full space-y-4">
              {/* Office Details */}
              <div>
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white">
                  <span className="w-4 h-4 bg-brand-orange rounded flex items-center justify-center shadow-sm">
                    <span className="w-1.5 h-1.5 border border-white rounded-[1px]" />
                  </span>
                  <span className="tracking-widest">VISIT OUR OFFICE</span>
                </div>

                {/* Office Location Title */}
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mt-2">
                  Hastinapuram, Hyderabad
                </h2>

                {/* Exact Company Address */}
                <div className="flex items-start gap-2 text-slate-300 text-xs sm:text-sm leading-relaxed mt-2">
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <p>
                    # 8-7-91/17/1, 4th Floor, Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana - 500079
                  </p>
                </div>
              </div>

              {/* Embedded Google Map (Size balanced to match right side height) */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 flex-1 min-h-[180px] h-[195px] sm:h-[210px] w-full">
                <iframe
                  title="Skandha Group Corporate Office Location"
                  src="https://maps.google.com/maps?q=Bata%20Building%20Beside%20Naveena%20Hospital%20Hastinapuram%20Hyderabad%20500079&t=m&z=15&output=embed&iwloc=near"
                  className="w-full h-full border-0"
                  loading="lazy"
                />

                {/* Floating "Open in Maps" Pill Overlay */}
                <div className="absolute top-2.5 left-2.5 bg-white/95 text-slate-900 rounded-lg p-2 shadow-md flex items-center gap-2 border border-slate-200">
                  <div className="text-left">
                    <p className="text-[11px] font-bold leading-tight">Bata Building, Hastinapuram</p>
                    <p className="text-[9px] text-slate-500 leading-tight">Hyderabad, Telangana 500079</p>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Bata+Building+Beside+Naveena+Hospital+Hastinapuram+Hyderabad+500079"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[10px] font-bold px-2 py-1 rounded shadow-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Open in Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Book A Site Visit Form */}
            <div className="space-y-6 pt-2 lg:pt-0">
              {/* Heading */}
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 bg-brand-orange rounded flex items-center justify-center shadow-sm">
                  <span className="w-1.5 h-1.5 border border-white rounded-[1px]" />
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Book a site visit
                </h2>
              </div>

              {/* Form Card */}
              <form onSubmit={handleSiteVisitSubmit} className="space-y-4">
                {siteVisitSuccess ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-6 text-center space-y-2 text-emerald-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="font-bold text-lg text-white">Site Visit Booked Successfully!</h3>
                    <p className="text-sm text-emerald-200/90">
                      Our customer relations manager will call you shortly to confirm your complimentary site visit tour.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSiteVisitSuccess(false)}
                      className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline cursor-pointer"
                    >
                      Book Another Visit
                    </button>
                  </div>
                ) : (
                  <>
                    {siteVisitError && (
                      <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-xs">
                        {siteVisitError}
                      </div>
                    )}

                    {/* Name Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Name"
                        value={siteVisitForm.name}
                        onChange={(e) => setSiteVisitForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>

                    {/* Phone Number Input */}
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={siteVisitForm.phone}
                        onChange={(e) => setSiteVisitForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={siteVisitForm.email}
                        onChange={(e) => setSiteVisitForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>

                    {/* Send Button matching reference */}
                    <button
                      type="submit"
                      disabled={siteVisitLoading}
                      className="w-full bg-brand-orange hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-4 rounded-lg shadow-lg shadow-orange-500/25 transition-all text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {siteVisitLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send</span>
                      )}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />

      {/* Lightbox */}
      <Lightbox
        items={gallery}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex(prev => (prev > 0 ? prev - 1 : gallery.length - 1))}
        onNext={() => setLightboxIndex(prev => (prev < gallery.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
