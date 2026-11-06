import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mail,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ShieldCheck
} from 'lucide-react';
import EnquiryModal from './EnquiryModal';

export default function Navbar({ settings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const email = (settings && settings.contactEmail) || 'contact@skandhagroup.com';

  const instagramUrl = (settings && settings.socialLinks && settings.socialLinks.instagram && !settings.socialLinks.instagram.endsWith('/skandhagroup'))
    ? settings.socialLinks.instagram
    : 'https://www.instagram.com/_skandhagroups_/';

  const youtubeUrl = (settings && settings.socialLinks && settings.socialLinks.youtube && !settings.socialLinks.youtube.endsWith('/@skandhagroup'))
    ? settings.socialLinks.youtube
    : 'https://www.youtube.com/@SkandhaGroups-hyd';

  const rawFacebook = settings && settings.socialLinks && settings.socialLinks.facebook;
  const facebookUrl = (rawFacebook && rawFacebook !== 'https://facebook.com' && rawFacebook !== 'https://facebook.com/skandhagroup' && rawFacebook !== '')
    ? rawFacebook
    : 'https://www.facebook.com/share/1FMmY12zRG/';

  return (
    <>
      <header className="relative z-50">
        {/* Top Bar: Dark Navy with White Icons and Square Social Buttons */}
        <div className="bg-[#071326] text-white text-xs py-2 px-4 border-b border-[#0d223f]">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
            {/* Email & Location on Left */}
            <div className="flex items-center gap-5 text-xs text-white">
              <a
                href={`mailto:${email}`}
                className="hover:text-brand-orange transition-colors inline-flex items-center gap-2 font-medium"
              >
                <Mail className="w-3.5 h-3.5 fill-white text-white" />
                <span>{email}</span>
              </a>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-300 text-xs">
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                <span>Hastinapuram, Hyderabad</span>
              </span>
            </div>

            {/* Social Icon Squares on Right */}
            <div className="flex items-center gap-1.5">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-sm bg-[#3b5998] hover:opacity-90 text-white flex items-center justify-center transition-opacity"
                title="Facebook"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5 fill-white" />
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-sm bg-[#262626] hover:opacity-90 text-white flex items-center justify-center transition-opacity"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>

              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-sm bg-[#cd201f] hover:opacity-90 text-white flex items-center justify-center transition-opacity"
                title="YouTube"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5 fill-white" />
              </a>

              {/* Portal Symbol (Symbol only, strictly no text) */}
              <Link
                to="/admin"
                className="w-6 h-6 rounded-sm bg-[#162a45] hover:bg-brand-orange text-slate-300 hover:text-white flex items-center justify-center transition-all ml-1"
                aria-label="Portal Access"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header: Solid Pure Black Background */}
        <div className="bg-[#000000] border-b border-black py-3 sm:py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo on Left */}
            <Link to="/" className="flex items-center gap-3 shrink-0" title="Skandha Group">
              <img
                src="/assets/skandha_logo_official.png"
                alt="Skandha Group"
                className="h-14 sm:h-16 lg:h-18 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {/* Home */}
              <Link
                to="/"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/' ? 'text-brand-orange' : 'text-white hover:text-brand-orange'
                }`}
              >
                Home
              </Link>

              {/* About Us */}
              <Link
                to="/about"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/about' ? 'text-brand-orange' : 'text-white hover:text-brand-orange'
                }`}
              >
                About Us
              </Link>

              {/* Featured Projects */}
              <Link
                to="/project"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/project' ? 'text-brand-orange' : 'text-white hover:text-brand-orange'
                }`}
              >
                Featured Projects
              </Link>

              {/* Gallery */}
              <Link
                to="/gallery"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/gallery' ? 'text-brand-orange' : 'text-white hover:text-brand-orange'
                }`}
              >
                Gallery
              </Link>

              {/* Contact */}
              <Link
                to="/contact"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/contact' ? 'text-brand-orange' : 'text-white hover:text-brand-orange'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Button: "PLOT AVAILABILITY" & Admin Symbol */}
            <div className="hidden sm:flex items-center gap-2.5">
              <a
                href="/plots"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-sm shadow-md transition-all active:scale-95"
              >
                PLOT AVAILABILITY
              </a>

              <Link
                to="/admin"
                className="w-9 h-9 rounded-sm bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                aria-label="Portal Access"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400 hover:text-brand-orange transition-colors" />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="lg:hidden flex items-center gap-2">
              <a
                href="/plots"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm"
              >
                Plots
              </a>

              <Link
                to="/admin"
                className="p-1.5 rounded-sm bg-white/5 text-slate-400 hover:text-white border border-white/10"
                aria-label="Portal Access"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
                className="p-2 text-white hover:text-brand-orange transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Off-Canvas Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d0f14] border-b border-slate-800 px-5 py-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 text-white">
            <div className="flex flex-col space-y-1">
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },
                { label: 'Featured Projects', path: '/project' },
                { label: 'Site Gallery', path: '/gallery' },
                { label: 'Contact & Map', path: '/contact' }
              ].map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-sm text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-brand-orange text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                );
              })}

              {/* Dedicated Plot Availability Link */}
              <a
                href="/plots"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-wider bg-brand-orange hover:bg-brand-orange-dark text-white flex items-center justify-between shadow-md"
              >
                <span>Interactive Plot Availability (2D/3D)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </>
  );
}
