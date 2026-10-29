import React, { useState } from 'react';
import {
  X,
  Compass,
  Shield,
  Info,
  ArrowLeft,
  Ruler,
  Share2,
  Navigation,
  Check,
  Sparkles,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { statusColors } from '../visualizer/masterPlanData';

export default function PlotDrawer({ plot, isOpen, onClose, onEnquire }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !plot) return null;

  const statusMeta = statusColors[plot.status] || statusColors.available;
  const isAvailable = plot.status === 'available';
  const isBooked = plot.status === 'booked' || plot.status === 'reserved';
  const isSold = plot.status === 'sold';

  const sqYds = plot.areaSqYds || 0;
  const sqFt = plot.areaSqFt || Math.round(sqYds * 9);

  // Handle individual plot sharing (User requirement: "each plot is sharable")
  const handleSharePlot = () => {
    const shareUrl = `${window.location.origin}/plots?plot=${plot.plotNumber}`;
    if (navigator.share) {
      navigator.share({
        title: `Skandha Group - Plot #${plot.plotNumber}`,
        text: `Check out Plot #${plot.plotNumber} (${sqYds} sq.yds, ${plot.facing} facing) in Skandha Group Plotted Community at Kadthal, Srisailam Highway.`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={`Details for Plot ${plot.plotNumber}`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Responsive Container: Bottom Sheet on Mobile (<md), Right Side Drawer on Desktop (md+) */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-md flex flex-col justify-end md:justify-start">
        <div className="w-full bg-white rounded-t-3xl md:rounded-none shadow-2xl flex flex-col max-h-[88vh] md:max-h-full h-auto md:h-full border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden">
          
          {/* Mobile Drag Pill */}
          <div className="pt-3 pb-1 flex justify-center md:hidden bg-slate-50">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 md:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Plot Specification
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusMeta.badge}`}>
                  {statusMeta.label}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                Plot #{plot.plotNumber}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Share Button (Plots99 Feature) */}
              <button
                onClick={handleSharePlot}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Share this Plot Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                aria-label="Close plot specification drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-orange-50/70 rounded-xl border border-orange-100">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Area Specification</span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {sqYds} <span className="text-xs font-normal text-slate-600">Sq.Yds</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  &asymp; {sqFt.toLocaleString('en-IN')} Sq.Ft
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Facing Direction</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <span>{plot.facing || 'East'}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  100% Vasthu Compliant
                </div>
              </div>
            </div>

            {/* Approved Dimensions Card */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Approved Dimensions (Sanctioned Plan)
                </h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  DTCP Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-slate-500">Dimensions:</div>
                <div className="font-semibold text-slate-900 text-right">{plot.dimensions || "36'-0\" x 50'-0\""}</div>

                <div className="text-slate-500">Adjoining Road:</div>
                <div className="font-semibold text-slate-900 text-right">{plot.roadWidth || "33'-0\""} Wide Road</div>

                <div className="text-slate-500">Plot Type:</div>
                <div className="font-semibold text-slate-900 text-right">
                  {plot.isCorner ? (
                    <span className="text-brand-orange font-bold">Corner Plot</span>
                  ) : (
                    'Regular Villa Plot'
                  )}
                </div>

                <div className="text-slate-500">Sanction Stamp:</div>
                <div className="font-semibold text-emerald-700 text-right text-xs">
                  TLP NO. 87/2024/H
                </div>
              </div>
            </div>

            {/* Quick Action Chips (Plots99 Screenshot 2 & 4) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Vasthu</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Certified Alignment</div>
              </div>

              <a
                href="https://www.google.com/maps?q=16.9530689,78.4918425&z=17&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition-colors flex flex-col items-center justify-center"
              >
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Get Directions</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Layout Site (Kadthal)</div>
              </a>
            </div>

            {/* Legal Clearances & Title Note (NO direct cost figures per user directive) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clear Title &amp; Booking Terms</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Direct developer terms with immediate spot registration availability under DTCP TLP NO. 87/2024/H &amp; TS RERA PO2400009081. Official government rate card and bank loan options provided upon consultation.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 md:p-6 border-t border-slate-200 bg-white space-y-2.5">
            <button
              onClick={() => onEnquire(plot)}
              disabled={isSold}
              className={`w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl text-sm shadow transition-all duration-200 ${
                isSold
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : isBooked
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-brand-orange hover:bg-brand-orange-dark text-white'
              }`}
            >
              {isSold ? (
                <span>Plot Sold Out &bull; Choose Another</span>
              ) : isBooked ? (
                <span>Join Waitlist for Booked Plot #{plot.plotNumber}</span>
              ) : (
                <span>Enquire for Plot #{plot.plotNumber}</span>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full inline-flex items-center justify-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Return to Layout View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
