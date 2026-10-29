import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';

export default function Footer({ settings }) {
  const email = (settings && settings.contactEmail) || 'contact@skandhagroup.com';
  const officeAddress = (settings && settings.officeAddress) || '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana - 500079';

  const instagramUrl = (settings && settings.socialLinks && settings.socialLinks.instagram && !settings.socialLinks.instagram.endsWith('/skandhagroup'))
    ? settings.socialLinks.instagram
    : 'https://www.instagram.com/_skandhagroups_/';

  const youtubeUrl = (settings && settings.socialLinks && settings.socialLinks.youtube && !settings.socialLinks.youtube.endsWith('/@skandhagroup'))
    ? settings.socialLinks.youtube
    : 'https://www.youtube.com/@SkandhaGroups-hyd';

  const rawFacebook = settings && settings.socialLinks && settings.socialLinks.facebook;
  const facebookUrl = (rawFacebook && rawFacebook !== 'https://facebook.com' && rawFacebook !== 'https://facebook.com/skandhagroup')
    ? rawFacebook
    : 'https://www.facebook.com/skandhagroup';

  const linkedinUrl = (settings && settings.socialLinks && settings.socialLinks.linkedin)
    ? settings.socialLinks.linkedin
    : 'https://www.linkedin.com/company/skandha-group';

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: facebookUrl },
    { name: 'Instagram', icon: Instagram, href: instagramUrl },
    { name: 'LinkedIn', icon: Linkedin, href: linkedinUrl },
    { name: 'YouTube', icon: Youtube, href: youtubeUrl }
  ];

  return (
    <footer
      className="relative text-white bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/assets/footer_bg.jpg')" }}
    >
      {/* Dark overlay for contrast matching reference design */}
      <div className="absolute inset-0 bg-[#00040a]/85 backdrop-blur-[1px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Column 1: Brand, Tagline, Email & Social Circles (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/assets/skandha_logo_official.png"
                alt="Skandha Group Logo"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Discover premium plotted developments in serene, well-connected locations.
            </p>

            <div className="flex items-center gap-2.5 text-sm text-slate-200 pt-1">
              <Mail className="w-4 h-4 text-slate-300 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="hover:text-brand-orange transition-colors"
              >
                {email}
              </a>
            </div>

            {/* Circular Social Buttons Matching Reference Image */}
            <div className="flex items-center gap-3 pt-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center transition-all duration-200 hover:border-brand-orange hover:text-brand-orange hover:bg-white/10"
                    aria-label={item.name}
                    title={item.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Office Address (Registered Company Location) (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-serif text-xl font-bold text-white tracking-wide">
              Office Address
            </h3>
            {/* Orange accent dotted line matching reference */}
            <div className="flex items-center gap-1.5">
              <span className="w-10 h-0.5 bg-brand-orange rounded-full" />
              <span className="w-2 h-0.5 bg-brand-orange/60 rounded-full" />
              <span className="w-1 h-0.5 bg-brand-orange/40 rounded-full" />
            </div>

            <div className="space-y-3 text-sm text-slate-200 leading-relaxed pt-1">
              <p className="font-semibold text-white">
                Skandha Group Registered Location:
              </p>
              <p className="text-slate-300 leading-relaxed">
                {officeAddress}
              </p>
              <div className="flex items-center gap-2 pt-1 text-slate-300">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-brand-orange transition-colors text-slate-200"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links & Sanctions (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-serif text-xl font-bold text-white tracking-wide">
              Quick Links
            </h3>
            {/* Orange accent dotted line */}
            <div className="flex items-center gap-1.5">
              <span className="w-10 h-0.5 bg-brand-orange rounded-full" />
              <span className="w-2 h-0.5 bg-brand-orange/60 rounded-full" />
              <span className="w-1 h-0.5 bg-brand-orange/40 rounded-full" />
            </div>

            <ul className="space-y-2 text-sm text-slate-300 pt-1">
              <li>
                <Link to="/" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <span className="text-brand-orange text-xs">▶</span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <span className="text-brand-orange text-xs">▶</span>
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/project" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <span className="text-brand-orange text-xs">▶</span>
                  <span>Featured Projects</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <span className="text-brand-orange text-xs">▶</span>
                  <span>Site Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
                  <span className="text-brand-orange text-xs">▶</span>
                  <span>Contact &amp; Map</span>
                </Link>
              </li>
              <li>
                <a
                  href="/plots"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-orange hover:text-white transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <span className="text-brand-orange text-xs">▶</span>
                  <span>Plot Availability (2D/3D)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal Strip Matching Reference */}
      <div className="relative z-10 bg-[#00050d] border-t border-white/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div>
            Copyright &copy; {new Date().getFullYear()} Skandha Group. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Designed &amp; Developed by</span>
            <a
              href="https://qwikdigitalsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange hover:text-orange-400 font-medium hover:underline transition-colors"
            >
              Qwik Digital Solutions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
