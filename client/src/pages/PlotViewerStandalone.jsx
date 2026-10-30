import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Box,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Ruler,
  Car,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  X,
  Info,
  Map,
  MapPin,
  Clock,
  Sparkles,
  Download,
  PhoneCall,
  Share2,
  Navigation,
  ChevronDown,
  Building,
  Trees,
  Droplets,
  Lightbulb,
  Award,
  Calculator,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  Check,
  Plus,
  Minus,
  Eye,
  Sliders,
  ArrowUpRight,
  TrendingUp,
  Phone,
  Send,
  Bot,
  Mail,
  Calendar,
  User,
  CheckCircle,
  FileText,
  Play,
  Pause,
  Footprints
} from 'lucide-react';
import { fetchPlots, fetchPlotStats, trackActivityEvent, submitLead, getPlotSyncVersion } from '../api/client';
import { getEnrichedPlots, LAYOUT_BOUNDS, statusColors } from '../visualizer/masterPlanData';
import LayoutMasterView, { WALK_ROADS } from '../visualizer/LayoutMasterView';
import EnquiryModal from '../components/EnquiryModal';

// Official Location Highlights matching Flyer Page 2 verbatim
const locationHighlights = [
  { icon: '🛕', text: 'Just 1 min drive to Maisigandi Maisamma Temple' },
  { icon: '🚗', text: 'Just 2 min drive to Srisailam Highway - NH 765' },
  { icon: '🏛️', text: 'Near Kadthal Town & Municipality' },
  { icon: '🌐', text: 'Close to Future City / Life Sciences Development Zone' },
  { icon: '🏭', text: 'Good Connectivity to Kandukur - Maheshwaram Industrial Belt' },
  { icon: '🧘', text: 'Close to Maheshwara Maha Pyramid Ashram' },
  { icon: '💊', text: "Major Pharma Investments - Dr. Reddy's, Aurobindo, Hetero, Laurus Labs, MSN & Gland Pharma" },
  { icon: '🛣️', text: 'Excellent Connectivity to Hyderabad via Srisailam Highway' },
  { icon: '🏎️', text: '10 min drive from ORR Exit 14' },
  { icon: '✈️', text: '20 min drive to Rajiv Gandhi International Airport (RGIA)' },
  { icon: '⭕', text: '10 min drive from Regional Ring Road (RRR)' }
];

// Official Project Highlights matching Flyer Page 2 verbatim
const projectHighlights = [
  { icon: '📜', text: 'DTCP Approved Layout (TLP NO. 87/2024/H) & TS RERA Registered (PO2400009081)' },
  { icon: '✍️', text: 'Clear Title as per Vasthu with Instant Spot Registration' },
  { icon: '🛣️', text: "40' & 33' B.T Roads with Kerb Stones & Footpaths" },
  { icon: '🛡️', text: '24 Hrs. Gated Security with Entrance Arch & Boundary Fencing' },
  { icon: '💡', text: 'Unique Street Lights with Concealed Underground Cabling' },
  { icon: '🕳️', text: 'Concealed Underground Drainage & Storm-Water System' },
  { icon: '🤝', text: 'Security & Layout Maintenance for 2 Years' },
  { icon: '🏃', text: "Jogging Track & Safe Children's Play Area" },
  { icon: '🌳', text: 'Landscape Parks (Ac. 0.758 Landscaped Greenery)' },
  { icon: '💧', text: 'Overhead Water Tank with Distribution Lines to Every Plot' },
  { icon: '🌲', text: 'Green Walkways & Avenue Plantation along all Roads' },
  { icon: '🏛️', text: 'Magnificent Entrance Gate with Heavy-Duty Compound Fencing' }
];

// 15 Master Layout Amenities matching Plots99
const layoutAmenities = [
  { title: 'DTCP & RERA Approved', desc: 'TLP No. 87/2024/H & PO2400009081 sanctioned layout', icon: ShieldCheck },
  { title: '60ft & 33ft BT Roads', desc: 'Heavy-duty blacktop boulevards with kerb stones', icon: Navigation },
  { title: '24/7 Gated Security', desc: 'Round-the-clock security cabin & boom barrier', icon: ShieldCheck },
  { title: 'Grand Entrance Arch', desc: 'Imposing architectural arch welcoming residents', icon: Building },
  { title: 'Overhead Water Tank', desc: 'High-capacity storage tank with pipeline to every plot', icon: Droplets },
  { title: 'Underground Drainage', desc: 'Concealed sewage network with eco-friendly outlets', icon: Layers },
  { title: 'LED Street Lighting', desc: 'Energy-efficient illumination with designer poles', icon: Lightbulb },
  { title: 'Underground Power Cables', desc: 'Concealed electrical lines with dedicated transformers', icon: Award },
  { title: 'Ac. 0.758 Central Park', desc: 'Lush park with jogging tracks, lawn & gazebo', icon: Trees },
  { title: "Children's Play Area", desc: 'Safe playground equipment and recreational sandpits', icon: Sparkles },
  { title: 'Perimeter Walking Track', desc: 'Paved walking paths for senior citizens & walkers', icon: Navigation },
  { title: 'Avenue Plantation', desc: 'Flowering avenue trees along every internal road', icon: Trees },
  { title: 'Layout Compound Wall', desc: 'Heavy-duty perimeter security fencing', icon: ShieldCheck },
  { title: '100% Vasthu Layout', desc: 'Scientifically planned orientation for peace & prosperity', icon: Compass },
  { title: 'Bank Loan Sanction', desc: 'Pre-approved home loans from SBI, HDFC & ICICI', icon: Award }
];

// Curated Nearby Landmarks matching Plots99 Screenshot 5
const nearbyLandmarks = [
  {
    name: 'Maisigandi Maisamma Temple',
    category: 'SPIRITUAL LANDMARK',
    distance: '0.8 km',
    time: '1 min',
    icon: Sparkles,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    name: 'Srisailam Highway (NH 765)',
    category: 'NATIONAL HIGHWAY',
    distance: 'Direct Frontage',
    time: '0 min',
    icon: Navigation,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    name: 'Upcoming Mucherla Future City & AI City',
    category: 'ECONOMIC HUB',
    distance: '14.2 km',
    time: '12m 30s',
    icon: Building,
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    name: 'Hyderabad Pharma City & Life Sciences SEZ',
    category: 'INDUSTRIAL CORRIDOR',
    distance: '18.5 km',
    time: '15m 45s',
    icon: Building,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    name: 'Regional Ring Road (RRR) Kadthal Junction',
    category: 'EXPRESSWAY',
    distance: '12.4 km',
    time: '10m 20s',
    icon: Navigation,
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    name: 'Kandukur & Maheshwaram Aerospace Park',
    category: 'TECH & DEFENCE',
    distance: '24.1 km',
    time: '20m 10s',
    icon: Building,
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  {
    name: 'RVM Institute of Medical Sciences & Hospital',
    category: 'HEALTHCARE',
    distance: '21.8 km',
    time: '18m 40s',
    icon: Droplets,
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    name: 'Bhashyam Blooms International School',
    category: 'EDUCATION',
    distance: '16.2 km',
    time: '14m 15s',
    icon: Award,
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  {
    name: 'Rajiv Gandhi International Airport (RGIA)',
    category: 'INTERNATIONAL AIRPORT',
    distance: '38.5 km',
    time: '32m 00s',
    icon: Navigation,
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  {
    name: 'Wonderla Amusement Park',
    category: 'RECREATION',
    distance: '31.2 km',
    time: '26m 30s',
    icon: Sparkles,
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    name: 'Foxconn Manufacturing & Kongara Kalan Hub',
    category: 'ELECTRONICS SEZ',
    distance: '26.7 km',
    time: '22m 45s',
    icon: Building,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    name: 'Outer Ring Road (ORR) Exit 14 Tukkuguda',
    category: 'HIGHWAY INTERCHANGE',
    distance: '34.0 km',
    time: '28m 15s',
    icon: Navigation,
    badgeColor: 'bg-violet-50 text-violet-800 border-violet-200'
  }
];

export default function PlotViewerStandalone({ settings }) {
  const [viewMode, setViewMode] = useState('3d');
  const [plots, setPlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [facingFilter, setFacingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Selected Plot & Modals
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isRouteMapModalOpen, setIsRouteMapModalOpen] = useState(false);
  const [routeMapZoom, setRouteMapZoom] = useState(1);

  const handleExecuteSearch = (query) => {
    const clean = (query !== undefined ? query : searchTerm).trim();
    if (!clean) {
      setSearchNotFound(false);
      return;
    }

    // Try exact plot number match first (e.g. "24")
    let found = plots.find(p => String(p.plotNumber) === clean);
    // If not exact match, look for numeric digits in string (e.g. user typed "plot 24" or "#24")
    if (!found) {
      const digits = clean.replace(/\D/g, '');
      if (digits) {
        found = plots.find(p => String(p.plotNumber) === digits);
      }
    }
    // If still not match, try partial match
    if (!found) {
      found = plots.find(p => String(p.plotNumber).includes(clean));
    }

    if (found) {
      setSearchNotFound(false);
      handleSelectPlot({ ...found });
      // In 3D mode, ensure camera is in overview/topDown so it smoothly flies directly to the plot
      if (viewMode === '3d' && (cameraPreset === 'parkGround' || cameraPreset === 'park')) {
        setCameraPreset('overview');
      }
    } else {
      setSearchNotFound(true);
      setTimeout(() => setSearchNotFound(false), 3500);
    }
  };
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      role: 'assistant',
      text: "Namaste! I am your Skandha AI Assistant. How can I help you regarding plot availability, Vasthu facings, DTCP/RERA approvals, or Srisailam Highway connectivity today?"
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleAskAIPrompt = (promptText) => {
    let reply = "";
    const lower = promptText.toLowerCase();

    if (lower.includes('east') || lower.includes('facing')) {
      reply = "Our Kadthal community offers premium East-facing plots (e.g. Plots 2, 3, 4, 5, 23, 24, 25, 91, 92, 93, 94, 95) with sizes ranging from 194 to 295 sq.yds. All plots are 100% Vasthu compliant with 33' blacktop road access.";
    } else if (lower.includes('dtcp') || lower.includes('rera') || lower.includes('approval') || lower.includes('legal')) {
      reply = "This venture is fully sanctioned by DTCP (Sanction Order: TLP NO. 87/2024/H) and registered with TS RERA (Reg No: PO2400009081). The venture provides 100% clear title ownership with instant spot registration and bank loan tie-ups with SBI, HDFC, and ICICI.";
    } else if (lower.includes('distance') || lower.includes('temple') || lower.includes('airport') || lower.includes('rgia')) {
      reply = "Key connectivity from the site (Kadthal):\n• Maisigandi Maisamma Temple: 0.8 km (1 min)\n• Srisailam Highway (NH 765): Direct Frontage (0 min)\n• Regional Ring Road (RRR) Kadthal Junction: 12.4 km (10 mins)\n• Hyderabad Pharma City SEZ: 18.5 km (15 mins)\n• Rajiv Gandhi International Airport (RGIA): 38.5 km (32 mins)";
    } else if (lower.includes('size') || lower.includes('dimension') || lower.includes('area') || lower.includes('road')) {
      reply = "Plot sizes range from 183 to 672 sq.yards (1,647 to 6,048 sq.ft) with standard dimensions such as 55' x 30' and 55' x 33'. The layout features a 60' wide main approach road, 33' wide internal blacktop boulevards, and an Ac. 0.758 landscaped central park.";
    } else {
      reply = "This development by Skandha Group is a prime 96-plot gated community situated directly on Srisailam Highway in Kadthal. Would you like to schedule a site visit or enquire about specific plot numbers? Click 'Enquire Plot' or message us directly on WhatsApp!";
    }

    setAiChatMessages(prev => [
      ...prev,
      { role: 'user', text: promptText },
      { role: 'assistant', text: reply }
    ]);
  };

  const handleSendAIMessage = (e) => {
    e?.preventDefault();
    if (!aiInputText.trim()) return;
    const q = aiInputText.trim();
    setAiInputText('');
    handleAskAIPrompt(q);
  };

  // Tools & State
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [cameraAzimuth, setCameraAzimuth] = useState(0);
  const [animateVehicles, setAnimateVehicles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMeasureMode, setIsMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [walkRoadIndex, setWalkRoadIndex] = useState(0);
  const [walkProgress, setWalkProgress] = useState(0.1);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  // Dynamic facing distribution calculation for Property Insights (Photo 3)
  const facingCounts = React.useMemo(() => {
    const counts = { N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 };
    plots.forEach(p => {
      const f = (p.facing || '').toLowerCase();
      if (f.includes('north-east') || f.includes('northeast')) counts.NE++;
      else if (f.includes('north-west') || f.includes('northwest')) counts.NW++;
      else if (f.includes('south-east') || f.includes('southeast')) counts.SE++;
      else if (f.includes('south-west') || f.includes('southwest')) counts.SW++;
      else if (f.includes('north')) counts.N++;
      else if (f.includes('south')) counts.S++;
      else if (f.includes('west')) counts.W++;
      else counts.E++;
    });
    return counts;
  }, [plots]);

  // Inventory breakdown percentages for Property Insights Pie Chart (Photo 3)
  const inventoryBreakdown = React.useMemo(() => {
    const total = plots.length || 96;
    const avail = plots.filter(p => p.status === 'available').length;
    const sold = plots.filter(p => p.status === 'sold').length;
    const booked = plots.filter(p => p.status === 'booked' || p.status === 'reserved').length;
    const blocked = plots.filter(p => p.status === 'blocked' || p.status === 'hold').length;
    return {
      total,
      available: avail,
      sold,
      booked,
      blocked,
      availPct: Math.round((avail / total) * 100),
      soldPct: Math.round((sold / total) * 100),
      bookedPct: Math.round((booked / total) * 100),
      blockedPct: Math.round((blocked / total) * 100)
    };
  }, [plots]);

  const containerRef = useRef(null);
  const mapSectionRef = useRef(null);
  const layoutRef = useRef(null);
  const syncVersionRef = useRef(0);
  const isSyncingRef = useRef(false);

  const checkSync = async () => {
    if (isSyncingRef.current) return;
    try {
      isSyncingRef.current = true;
      const res = await getPlotSyncVersion();
      if (res && res.success && typeof res.version === 'number') {
        if (syncVersionRef.current === 0) {
          syncVersionRef.current = res.version;
        } else if (res.version > syncVersionRef.current) {
          console.log(`[PlotViewer Sync] Layout updated remotely from v${syncVersionRef.current} to v${res.version}. Syncing live layout...`);
          syncVersionRef.current = res.version;
          await loadLayoutData();
        }
      }
    } catch (e) {
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    trackActivityEvent('layout_opened', null, { viewMode, standalone: true });
    loadLayoutData();
    checkSync();

    // 1. Multi-device background poll every 3500ms
    const pollTimer = setInterval(() => {
      checkSync();
    }, 3500);

    // 2. Check sync when viewer switches back to tab or device
    const handleFocus = () => checkSync();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkSync();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. Same-device cross-tab broadcast sync
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('skandha_plots_channel');
        bc.onmessage = (event) => {
          if (event?.data?.type === 'SYNC_PLOTS') {
            checkSync();
          }
        };
      }
    } catch (e) {}

    const handlePlotUpdated = (e) => {
      if (e?.detail?.resetAll) {
        setPlots(getEnrichedPlots());
        setSelectedPlot(prev => prev ? { ...prev, status: 'available' } : null);
        checkSync();
        return;
      }
      const updated = e.detail;
      if (!updated || !updated.plotNumber) return;
      setPlots(prev => prev.map(p => p.plotNumber === updated.plotNumber ? { ...p, ...updated } : p));
      setSelectedPlot(prev => (prev && prev.plotNumber === updated.plotNumber) ? { ...prev, ...updated } : prev);
      checkSync();
    };

    window.addEventListener('skandha:plot_updated', handlePlotUpdated);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('skandha:plot_updated', handlePlotUpdated);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, []);

  const loadLayoutData = async () => {
    setLoading(true);
    try {
      const [plotsRes, statsRes] = await Promise.all([
        fetchPlots({ all: 'true' }),
        fetchPlotStats()
      ]);

      let loadedPlots = [];
      if (plotsRes.success && plotsRes.plots) {
        loadedPlots = getEnrichedPlots(plotsRes.plots);
      } else {
        loadedPlots = getEnrichedPlots();
      }
      setPlots(loadedPlots);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      // Check URL query parameter for shared plot (User requirement: "each plot is sharable")
      const searchParams = new URLSearchParams(window.location.search);
      const targetPlotNum = searchParams.get('plot');
      if (targetPlotNum) {
        const found = loadedPlots.find(p => String(p.plotNumber) === String(targetPlotNum));
        if (found) {
          setSelectedPlot(found);
        }
      }
    } catch (err) {
      console.warn('Backend plots fetch failed, using authoritative master plan:', err);
      const fallbackPlots = getEnrichedPlots();
      setPlots(fallbackPlots);

      const searchParams = new URLSearchParams(window.location.search);
      const targetPlotNum = searchParams.get('plot');
      if (targetPlotNum) {
        const found = fallbackPlots.find(p => String(p.plotNumber) === String(targetPlotNum));
        if (found) {
          setSelectedPlot(found);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlot = (plot) => {
    setSelectedPlot(plot);
    if (plot && plot.plotNumber) {
      trackActivityEvent('plot_viewed', plot.plotNumber, {
        status: plot.status,
        facing: plot.facing,
        areaSqYds: plot.areaSqYds,
        price: plot.totalPrice,
        block: plot.block
      });
    }
  };

  const handleShareCurrentPlot = (plot) => {
    const target = plot || selectedPlot;
    if (!target) return;
    const shareUrl = `${window.location.origin}/plots?plot=${target.plotNumber}`;
    if (navigator.share) {
      navigator.share({
        title: `Skandha Group - Plot #${target.plotNumber}`,
        text: `Inspect Plot #${target.plotNumber} (${target.areaSqYds} sq.yds, ${target.facing} facing) in Skandha Group Plotted Community at Kadthal.`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleViewModeToggle = (mode) => {
    setViewMode(mode);
    trackActivityEvent('view_mode_toggled', null, { viewMode: mode });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMeasurePoint = (pt) => {
    setMeasurePoints(prev => {
      if (prev.length >= 2) return [pt];
      return [...prev, pt];
    });
  };

  const toggleStatusFilter = (status) => {
    const next = statusFilter === status ? 'all' : status;
    setStatusFilter(next);
    trackActivityEvent('filter_applied', null, { filter: next });
  };

  // Auto-walk smooth loop (slow, calm stroll pace)
  useEffect(() => {
    if (!isAutoWalking || cameraPreset !== 'roadWalk' || viewMode !== '3d') return;
    const interval = setInterval(() => {
      setWalkProgress((prev) => {
        const next = prev + 0.0012; // Slow, gentle forward promenade
        return next >= 1 ? 0 : next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [isAutoWalking, cameraPreset, viewMode]);

  const handleToggleRoadView = () => {
    if (viewMode !== '3d') setViewMode('3d');
    if (cameraPreset === 'roadWalk') {
      setCameraPreset('overview');
      setIsAutoWalking(false);
    } else {
      setCameraPreset('roadWalk');
      setWalkProgress(0.1);
    }
  };

  const handleRoadClick = (road) => {
    if (viewMode !== '3d') setViewMode('3d');
    const roadIdx = (WALK_ROADS || []).findIndex(
      r => r.id === road?.id || r.name?.toLowerCase().includes(road?.name?.toLowerCase())
    );
    setWalkRoadIndex(roadIdx >= 0 ? roadIdx : 0);
    setWalkProgress(0.12);
    setCameraPreset('roadWalk');
  };

  const handleWalkStep = (step) => {
    setWalkProgress(prev => Math.max(0, Math.min(1, prev + step)));
  };

  // Click on park drops camera into park ground stroll
  const handleParkClick = () => {
    if (viewMode !== '3d') setViewMode('3d');
    setCameraPreset(prev => prev === 'park' ? 'overview' : 'park');
  };

  const handleToggleParkView = () => {
    if (viewMode !== '3d') setViewMode('3d');
    setCameraPreset(prev => prev === 'park' ? 'overview' : 'park');
  };

  // Insights Tab Switcher (matching Plots99 Features & Additional Info)
  const [insightsTab, setInsightsTab] = useState('location');

  // Contact & Site Visit Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    facing: 'Any Facing',
    visitDate: '',
    message: ''
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactSuccessResult, setContactSuccessResult] = useState(null);
  const [isScrolledPastMap, setIsScrolledPastMap] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledPastMap(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth Section Scrolling
  const scrollToSection = (id) => {
    const aliasMap = {
      info: 'sec-info',
      insights: 'sec-insights',
      stats: 'sec-stats',
      nearby: 'sec-landmarks',
      contact: 'sec-contact',
      approvals: 'sec-approvals',
      overview: 'sec-overview'
    };
    const targetId = aliasMap[id] || id;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.phone.trim()) return;
    setContactSubmitting(true);
    try {
      const res = await submitLead({
        name: contactForm.name || 'Site Visit Guest',
        phone: contactForm.phone,
        email: contactForm.email || undefined,
        plotNumber: selectedPlot?.plotNumber ? Number(selectedPlot.plotNumber) : undefined,
        message: `Inquiry from Master Plan Viewer. Preferred Facing: ${contactForm.facing}. Preferred Date: ${contactForm.visitDate || 'Flexible'}. Notes: ${contactForm.message || 'Booked guided site visit'}`
      });
      setContactSuccess(true);
      trackActivityEvent('enquiry_submitted', selectedPlot?.plotNumber ? Number(selectedPlot.plotNumber) : undefined, {
        customerName: contactForm.name,
        customerPhone: contactForm.phone,
        customerEmail: contactForm.email,
        facing: contactForm.facing,
        visitDate: contactForm.visitDate
      });
      if (res?.whatsappUrl) {
        setContactSuccessResult(res);
        try {
          window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
        } catch {
          // Fallback if popup blocker intervenes
        }
      }
      setContactForm({
        name: '',
        phone: '',
        email: '',
        facing: 'Any Facing',
        visitDate: '',
        message: ''
      });
      setTimeout(() => setContactSuccess(false), 15000);
    } catch (err) {
      console.error('Failed to submit contact enquiry:', err);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen justify-between bg-slate-100 font-sans text-slate-800">
      <div id="main" className="grow">
        {/* ========================================================== */}
        {/* 1. TOP INTERACTIVE MASTER PLAN MAP (FIXED 75VH)            */}
        {/* ========================================================== */}
        <div
          ref={mapSectionRef}
          className={`fixed top-0 left-0 w-full z-0 overflow-hidden select-none touch-none bg-[#E5ECE3] ${
            isFullscreen ? 'h-full' : 'h-[75vh]'
          }`}
          style={{ touchAction: 'none' }}
        >
        {/* Floating Top Header (Branding & Search) */}
        <header className={`absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none transition-all duration-300 ${
          isScrolledPastMap ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
        }`}>
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-xl pointer-events-auto flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-brand-orange text-white rounded-xl text-xs font-bold transition-all shadow-md group shrink-0"
              title="Return to main public website"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Website</span>
            </a>

            <a href="/" className="flex items-center group bg-black px-3.5 py-2 rounded-xl shadow-xs" title="Return to main website">
              <img
                src="/assets/skandha_logo_official.png"
                alt="Skandha Group"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </a>

            <div className="border-l border-slate-200 pl-3 hidden sm:flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-50 text-brand-orange border border-orange-200 px-2 py-0.5 rounded-full">
                Master Plan
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Kadthal &bull; DTCP: TLP NO. 87/2024/H &bull; TS RERA: PO2400009081
              </span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/90 shadow-xl pointer-events-auto flex items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch();
              }}
              className="relative flex items-center"
            >
              <div className="relative w-44 sm:w-60">
                <button
                  type="submit"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  title="Search plot"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    const clean = val.trim();
                    if (!clean) {
                      setSearchNotFound(false);
                      return;
                    }
                    const digits = clean.replace(/\D/g, '');
                    let found = plots.find(p => String(p.plotNumber) === clean || (digits && String(p.plotNumber) === digits));
                    if (!found && clean.length >= 1) {
                      found = plots.find(p => String(p.plotNumber).includes(clean));
                    }
                    if (found) {
                      setSearchNotFound(false);
                      handleSelectPlot({ ...found });
                      if (viewMode === '3d' && (cameraPreset === 'parkGround' || cameraPreset === 'park')) {
                        setCameraPreset('overview');
                      }
                    }
                  }}
                  className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-semibold text-slate-900"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPlot(null);
                      setSearchNotFound(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchNotFound && (
                <div className="absolute top-10 left-0 bg-red-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl animate-fadeIn whitespace-nowrap z-50">
                  Plot not found (Plots 1 to 96 available)
                </div>
              )}
            </form>
          </div>
        </header>
        {/* Plots99 Zoom Pill (.ol-zoom) */}
        <div className={`ol-zoom pointer-events-auto transition-opacity duration-300 ${
          isScrolledPastMap ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <button
            type="button"
            onClick={() => layoutRef.current?.zoomIn()}
            className="ol-zoom-in"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => layoutRef.current?.zoomOut()}
            className="ol-zoom-out"
            title="Zoom out"
          >
            –
          </button>
        </div>

        {/* Floating Right Circular Toolbar */}
        <aside className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 pointer-events-auto transition-opacity duration-300 ${
          isScrolledPastMap ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          {/* 3D Street Walk View */}
          <button
            onClick={handleToggleRoadView}
            className={`w-10 h-10 rounded-full shadow-lg border transition-all duration-200 hover:scale-110 flex items-center justify-center ${
              cameraPreset === 'roadWalk'
                ? 'bg-brand-orange text-white border-brand-orange ring-2 ring-orange-400/50'
                : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-brand-orange border-slate-200/90 hover:bg-white'
            }`}
            title="3D Street Walk View (Stroll down 33' & 60' Boulevards & Avenues)"
          >
            <Footprints className="w-4 h-4" />
          </button>

          {/* Park View (Flowering Lawn, Cycad Palm Shrubs & Perimeter Palms) */}
          <button
            onClick={handleToggleParkView}
            className={`w-10 h-10 rounded-full shadow-lg border transition-all duration-200 hover:scale-110 flex items-center justify-center ${
              cameraPreset === 'park' || cameraPreset === 'parkGround'
                ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/50'
                : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 border-slate-200/90 hover:bg-white'
            }`}
            title="Park View (Ac. 0.758 Central Park Flowering Lawn & Cycad Shrubs)"
          >
            <Trees className="w-4 h-4" />
          </button>

          {/* Top-Down Orthographic */}
          <button
            onClick={() => setCameraPreset(cameraPreset === 'topDown' ? 'overview' : 'topDown')}
            className={`w-10 h-10 rounded-full shadow-lg border transition-all duration-200 hover:scale-110 flex items-center justify-center ${
              cameraPreset === 'topDown'
                ? 'bg-slate-900 text-white border-slate-950'
                : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-brand-orange border-slate-200/90 hover:bg-white'
            }`}
            title="Top-Down Overhead View"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200/90 text-slate-700 hover:text-brand-orange hover:bg-white flex items-center justify-center transition-all duration-200 hover:scale-110"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </aside>

        {/* Floating Street Walk Navigation Pill */}
        {cameraPreset === 'roadWalk' && viewMode === '3d' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-fadeIn max-w-[92vw]">
            <Footprints className="w-4 h-4 text-brand-orange shrink-0 animate-pulse" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">
                {WALK_ROADS[walkRoadIndex]?.name || "33' Internal Boulevard"}
              </span>
              <span className="text-[10px] text-slate-300">
                Drag / scroll to walk &bull; Zoom out to ascend
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-1 shrink-0">
              <button
                type="button"
                onClick={() => setWalkRoadIndex((prev) => (prev + 1) % (WALK_ROADS?.length || 1))}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-600 transition-colors"
                title="Switch avenue"
              >
                Next Road
              </button>
              <button
                type="button"
                onClick={() => {
                  setCameraPreset('overview');
                  setIsAutoWalking(false);
                }}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Exit Walk View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Map Canvas (3D or 2D) */}
        <div className="w-full h-full touch-none" style={{ touchAction: 'none' }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-[#DFEFE0]">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-semibold text-slate-700">Loading master plan...</div>
              </div>
            </div>
          ) : (
            <LayoutMasterView
              ref={layoutRef}
              viewMode={viewMode}
              plots={plots}
              selectedPlot={selectedPlot}
              onSelectPlot={handleSelectPlot}
              cameraPreset={cameraPreset}
              onAzimuthChange={setCameraAzimuth}
              onExitWalk={() => {
                setCameraPreset('overview');
                setIsAutoWalking(false);
              }}
              onSwitchToMapView={() => setCameraPreset('mapView')}
              onSwitchToOverview={() => setCameraPreset('overview')}
              searchTerm={searchTerm}
              filterStatus={statusFilter}
              filterFacing={facingFilter}
              walkRoadIndex={walkRoadIndex}
              walkProgress={walkProgress}
              onWalkProgressChange={setWalkProgress}
              animateVehicles={animateVehicles}
              isMeasureMode={isMeasureMode}
              measurePoints={measurePoints}
              onMeasurePoint={handleMeasurePoint}
              onRoadClick={handleRoadClick}
              onParkClick={handleParkClick}
            />
          )}
        </div>

        {/* Plot Details Modal - Top Right Side Floating Card (Not on lot) */}
        {selectedPlot && selectedPlot.plotNumber && (
          <aside
            aria-label={`Details for Plot ${selectedPlot.plotNumber}`}
            className="absolute top-[116px] sm:top-20 right-3 sm:right-4 z-40 w-80 sm:w-88 max-w-[calc(100vw-24px)] bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 pointer-events-auto animate-fadeIn"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedPlot.status === 'sold'
                    ? 'bg-[#F89898]'
                    : (selectedPlot.status === 'booked' || selectedPlot.status === 'reserved')
                    ? 'bg-[#FBE38E]'
                    : 'bg-[#68D391]'
                }`} />
                <span className="font-bold text-slate-900 text-base">
                  Plot #{selectedPlot.plotNumber}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {selectedPlot.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key-Value Details */}
            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Facing</span>
                <strong className="text-slate-900 font-bold">{selectedPlot.facing}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Area</span>
                <strong className="text-slate-900 font-bold">{selectedPlot.areaSqYds}.00 yd²</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Dimensions</span>
                <strong className="text-slate-900 font-bold">{selectedPlot.dimensions}</strong>
              </div>
            </div>

            {/* 4 Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-[11px] text-emerald-800 font-semibold text-center border border-emerald-200 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>RFA Score 96%</span>
              </div>
              <button
                onClick={() => handleShareCurrentPlot(selectedPlot)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedShare ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <a
                href="https://www.google.com/maps?q=16.9530689,78.4918425&z=17&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-orange" />
                <span>Directions</span>
              </a>
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="p-2 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-[11px] text-white font-bold text-center transition-colors shadow-xs"
              >
                Enquire Plot
              </button>
            </div>
          </aside>
        )}





        {/* Bottom Left Floating Legend (Plots99 Exact Structure - Vertical) */}
        <div className={`absolute bottom-4 left-4 z-30 pointer-events-auto transition-opacity duration-300 ${
          isScrolledPastMap ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-2xl">
            <div className="flex flex-col gap-1.5 text-xs font-bold">
              {/* SOLD */}
              <button
                onClick={() => toggleStatusFilter('sold')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  statusFilter === 'sold'
                    ? 'ring-2 ring-red-400 bg-red-50/90 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
                title="Filter Sold plots (click again to clear)"
              >
                <span className="w-7 h-6 rounded-md bg-[#F87171] text-[#7F1D1D] text-[11px] font-black flex items-center justify-center shadow-2xs">
                  {stats?.sold ?? inventoryBreakdown.sold ?? 0}
                </span>
                <span className="text-[11px] font-bold tracking-wider text-slate-700">
                  SOLD
                </span>
              </button>

              {/* BOOKED */}
              <button
                onClick={() => toggleStatusFilter('booked')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  statusFilter === 'booked'
                    ? 'ring-2 ring-amber-400 bg-amber-50/90 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
                title="Filter Booked plots (click again to clear)"
              >
                <span className="w-7 h-6 rounded-md bg-[#FACC15] text-[#78350F] text-[11px] font-black flex items-center justify-center shadow-2xs">
                  {stats?.booked ?? inventoryBreakdown.booked ?? 0}
                </span>
                <span className="text-[11px] font-bold tracking-wider text-slate-700">
                  BOOKED
                </span>
              </button>

              {/* BLOCKED */}
              <button
                onClick={() => toggleStatusFilter('blocked')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  statusFilter === 'blocked'
                    ? 'ring-2 ring-sky-400 bg-sky-50/90 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
                title="Filter Blocked plots (click again to clear)"
              >
                <span className="w-7 h-6 rounded-md bg-[#38BDF8] text-[#075985] text-[11px] font-black flex items-center justify-center shadow-2xs">
                  {stats?.blocked ?? inventoryBreakdown.blocked ?? 0}
                </span>
                <span className="text-[11px] font-bold tracking-wider text-slate-700">
                  BLOCKED
                </span>
              </button>

              {/* AVAILABLE */}
              <button
                onClick={() => toggleStatusFilter('available')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  statusFilter === 'available'
                    ? 'ring-2 ring-emerald-400 bg-emerald-50/90 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
                title="Filter Available plots (click again to clear)"
              >
                <span className="w-7 h-6 rounded-md bg-[#4ADE80] text-[#064E3B] text-[11px] font-black flex items-center justify-center shadow-2xs">
                  {stats?.available ?? inventoryBreakdown.available ?? (plots.length || 96)}
                </span>
                <span className="text-[11px] font-bold tracking-wider text-slate-700">
                  AVAILABLE
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Right Map Attribution (Single Clean Text) */}
        <div className={`absolute bottom-4 right-36 z-20 pointer-events-auto hidden md:block select-none transition-opacity duration-300 ${
          isScrolledPastMap ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <div className="text-[10px] text-slate-500 font-sans tracking-wide">
            &copy; Google Maps &bull; Kadthal, Srisailam Highway (NH-765)
          </div>
        </div>

        {/* Bottom Right View Mode Level & 2D/3D Toggle (User requirement: manual minimize/maximize) */}
        <div className={`absolute bottom-4 right-4 z-30 pointer-events-auto transition-opacity duration-300 flex items-center gap-2 ${
          isScrolledPastMap ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
        {/* Bottom Right 2D/3D Pill */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-2xl flex items-center gap-1">
            <button
              onClick={() => handleViewModeToggle('2d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === '2d'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => handleViewModeToggle('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. SLIDING BOTTOM CONTAINER SHEET (STARTING AT mt-[75vh])   */}
      {/* ========================================================== */}
      <div
        className="container-main relative z-10 bg-white rounded-t-[28px] sm:rounded-t-[36px] md:rounded-t-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.18)] border-t border-slate-200/40 max-w-full overflow-x-hidden mt-[75vh]"
        style={{ width: '100%', borderTopColor: '#329e4d' }}
      >
          {/* Sheet Content: Info & Overview */}
          <section id="sec-info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 md:space-y-12">
            {/* Top Brand & Title Info Block */}
            <div className="scroll-mt-24 space-y-5">
              <div className="flex items-start gap-3.5 sm:gap-5 md:items-center md:justify-between">
                <div className="shrink-0">
                  <div className="block p-2.5 sm:p-3 rounded-2xl bg-black border border-slate-800 shadow-xs hover:shadow-md transition-all group">
                    <img
                      alt="Skandha Group"
                      src="/assets/skandha_logo_official.png"
                      className="object-contain h-12 w-auto sm:h-14 md:h-16 transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 grow min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="w-fit shrink-0 justify-center overflow-hidden whitespace-nowrap border transition-[color,box-shadow] rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold text-[11px] sm:text-xs bg-emerald-600/10 text-emerald-700 border-emerald-600/20 flex items-center gap-1 sm:gap-1.5">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>Plotted Development</span>
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-brand-orange border border-orange-200">
                        DTCP &amp; TS RERA Approved
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="/"
                        className="h-8 px-3.5 rounded-full text-xs font-bold gap-1.5 border border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-2xs inline-flex items-center text-slate-700 bg-white group"
                        title="Return to main website"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        <span>Back to Website</span>
                      </a>

                      <button
                        onClick={() => handleShareCurrentPlot(selectedPlot || plots[0])}
                        className="h-8 px-3 rounded-full text-xs font-semibold gap-1.5 border border-slate-300/80 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-2xs inline-flex items-center text-slate-700 bg-white"
                        type="button"
                        title="Share Venture"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
                      </button>
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                    Kadthal Venture
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-500">
                    <div className="inline-flex items-center gap-1 font-semibold text-slate-600 text-left">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kadthal, Srisailam Highway</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Card */}
            <div id="sec-overview" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Project Overview
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    A DTCP-approved, 100% Vasthu-compliant residential plotted layout adjoining Srisailam Highway, situated 1 minute from Maisigandi Temple and minutes from the upcoming Mucherla Future City &amp; Hyderabad Pharma City.
                  </p>
                </div>

                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow transition-all shrink-0"
                >
                  <span>Enquire Plot Availability</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Spec Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Total Plotted Units</div>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">96 Plots</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Available for Booking</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Plot Sizes Range</div>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">183 - 672</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Sq. Yards (1,647 - 6,048 Sq.Ft)</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Statutory Clearances</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">DTCP &amp; TS RERA</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">TLP NO. 87/2024/H</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Open Space Park</div>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">Ac. 0.758</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Landscaped Children's Park</div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* 2. VENTURE INSIGHTS & HIGHLIGHTS (PLOTS99 EXACT MATCH)    */}
          {/* ========================================================== */}
          <section id="sec-insights" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Venture Intelligence</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    Project &amp; Location Insights
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Explore authoritative location connectivity, engineering infrastructure, master amenities, and orientation analysis.
                  </p>
                </div>
              </div>

              {/* Interactive Tabs matching Plots99 */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'location', label: 'Location Highlights', icon: MapPin },
                  { id: 'project', label: 'Project Highlights', icon: Building },
                  { id: 'amenities', label: 'Master Amenities (15)', icon: Sparkles },
                  { id: 'vasthu', label: 'Vasthu & Facings Radar', icon: Compass }
                ].map((tab) => {
                  const IconC = tab.icon;
                  const isActive = insightsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInsightsTab(tab.id)}
                      className={`h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold gap-2 border transition-all inline-flex items-center whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200/90 hover:border-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      <IconC className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Location Highlights */}
              {insightsTab === 'location' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                        Strategic Connectivity &amp; Regional Growth Corridors
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Direct Srisailam Highway (NH 765) access &amp; official location highlights from project brochure.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRouteMapZoom(1);
                        setIsRouteMapModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-orange border border-orange-200 text-xs font-bold transition-colors w-fit"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View Official Route Map</span>
                    </button>
                  </div>

                  {/* Flyer Schematic Route Map Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => {
                          setRouteMapZoom(1);
                          setIsRouteMapModalOpen(true);
                        }}
                        className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-xs cursor-pointer group shrink-0 relative bg-white"
                        title="Click to view full schematic route map"
                      >
                        <img
                          src="/assets/route_map_hd.png"
                          alt="Route Map Preview"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange bg-white px-2 py-0.5 rounded-md border border-orange-200 mb-1">
                          Official Flyer Roadmap
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                          Srisailam Highway &bull; ORR Exit 14 &bull; Pharma City SEZ Corridor
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          Dr. Reddy's, Bharat Biotech, Hetero, MSN, Laurus Labs &amp; 100ft layout road access.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setRouteMapZoom(1);
                        setIsRouteMapModalOpen(true);
                      }}
                      className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Enlarge Schematic Map</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {locationHighlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-start gap-3 group"
                      >
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Project Highlights */}
              {insightsTab === 'project' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                        Master Plan Infrastructure &amp; Statutory Approvals
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        DTCP TLP NO. 87/2024/H &amp; TS RERA PO2400009081 certified specifications.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
                      13 Key Features
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {projectHighlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-start gap-3 group"
                      >
                        <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Amenities Grid (15 Amenities) */}
              {insightsTab === 'amenities' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                        Master Layout Amenities &amp; Community Infrastructure
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        15 high-standard civil, green, and safety amenities for comfortable villa living.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
                      15 Amenities
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {layoutAmenities.map((item, idx) => {
                      const IconA = item.icon;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-start gap-3.5 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                            <IconA className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Vasthu & Cardinal Orientation Radar */}
              {insightsTab === 'vasthu' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                      100% Vasthu Compliant Cardinal Orientation
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Units planned according to classical Vasthu principles ensuring optimal sunlight, airflow, and positive prosperity.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3 Core Property Insights Analytics Cards (Always Visible in Insights) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {/* Card 1: Facing Distribution (Photo 3) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    <Compass className="w-3.5 h-3.5" />
                    <span>ANALYSIS</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mt-1">Facing Distribution</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Units oriented across cardinal directions</p>
                </div>

                {/* 8-Point Cardinal Compass Radar (Photo 3) */}
                <div className="relative w-56 h-56 mx-auto my-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-slate-200" />
                  <div className="absolute inset-8 rounded-full border border-dashed border-slate-200" />
                  <div className="absolute inset-16 rounded-full border border-slate-200/70" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500" />

                  {/* Dashed axes */}
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-200" />
                  <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-200" />

                  {/* North */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400">N</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs mt-0.5">
                      {facingCounts.N || 8}
                    </span>
                  </div>

                  {/* North-East */}
                  <div className="absolute top-6 right-6 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400">NE</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs mt-0.5">
                      {facingCounts.NE || 6}
                    </span>
                  </div>

                  {/* East */}
                  <div className="absolute top-1/2 right-1 -translate-y-1/2 flex items-center gap-1">
                    <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs">
                      {facingCounts.E || 44}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">E</span>
                  </div>

                  {/* South-East */}
                  <div className="absolute bottom-6 right-6 flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs mb-0.5">
                      {facingCounts.SE || 4}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">SE</span>
                  </div>

                  {/* South */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs mb-0.5">
                      {facingCounts.S || 6}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">S</span>
                  </div>

                  {/* South-West */}
                  <div className="absolute bottom-6 left-6 flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs mb-0.5">
                      {facingCounts.SW || 4}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">SW</span>
                  </div>

                  {/* West */}
                  <div className="absolute top-1/2 left-1 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">W</span>
                    <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs">
                      {facingCounts.W || 38}
                    </span>
                  </div>

                  {/* North-West */}
                  <div className="absolute top-6 left-6 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400">NW</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs mt-0.5">
                      {facingCounts.NW || 6}
                    </span>
                  </div>
                </div>

                <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50/60 py-2 rounded-xl border border-emerald-100">
                  +12 Multi-Facing &amp; Corner Units
                </div>
              </div>

              {/* Card 2: Inventory Status (Photo 3) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    <Layers className="w-3.5 h-3.5" />
                    <span>STOCK</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mt-1">Inventory Status</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Visual breakdown of unit availability</p>
                </div>

                {/* Pie / Donut Chart */}
                <div className="w-44 h-44 mx-auto my-6 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#4ADE80"
                      strokeWidth="24"
                      strokeDasharray={`${inventoryBreakdown.availPct * 2.38} 238`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="24"
                      strokeDasharray={`${inventoryBreakdown.bookedPct * 2.38} 238`}
                      strokeDashoffset={`-${inventoryBreakdown.availPct * 2.38}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="24"
                      strokeDasharray={`${inventoryBreakdown.blockedPct * 2.38} 238`}
                      strokeDashoffset={`-${(inventoryBreakdown.availPct + inventoryBreakdown.bookedPct) * 2.38}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#F87171"
                      strokeWidth="24"
                      strokeDasharray={`${inventoryBreakdown.soldPct * 2.38} 238`}
                      strokeDashoffset={`-${(inventoryBreakdown.availPct + inventoryBreakdown.bookedPct + inventoryBreakdown.blockedPct) * 2.38}`}
                    />
                  </svg>
                </div>

                {/* Legend below matching Photo 3 */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#4ADE80]" />
                    <span>Available {inventoryBreakdown.availPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#FACC15]" />
                    <span>Booked {inventoryBreakdown.bookedPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#38BDF8]" />
                    <span>Blocked {inventoryBreakdown.blockedPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#F87171]" />
                    <span>Sold {inventoryBreakdown.soldPct}%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Project Scale (Photo 3) */}
              <div className="bg-[#044E46] text-white p-7 rounded-3xl flex flex-col justify-between shadow-lg">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Project Scale
                  </div>
                  <div className="mt-5">
                    <div className="text-xs text-emerald-200">Total Units</div>
                    <div className="text-5xl font-extrabold mt-1">96</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-emerald-600/50 my-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">Total Area</div>
                    <div className="text-xl font-bold mt-1">24,200.00 yd²</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">In Acres</div>
                    <div className="text-xl font-bold mt-1">10.50 ac</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Kadthal, Srisailam Highway</span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* 3. STATUTORY APPROVALS & COMPLIANCE                        */}
          {/* ========================================================== */}
          <section id="sec-approvals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Statutory Clearances */}
            <div id="sec-approvals" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Legal Certainty</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                DTCP Approved &amp; TS RERA Registered
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Clear title ownership with instant spot registration. Pre-approved for housing and plotted development bank loans.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    DTCP Sanction Order
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    TLP NO. 87/2024/H
                  </div>
                  <p className="text-xs text-slate-600">
                    Directorate of Town and Country Planning official sanctioned layout approval.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    TS RERA Registration
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    PO2400009081
                  </div>
                  <p className="text-xs text-slate-600">
                    Telangana Real Estate Regulatory Authority registered project compliance.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Title &amp; Bank Clearances
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    100% Clear Title
                  </div>
                  <p className="text-xs text-slate-600">
                    Direct spot registration with loan sanction options across SBI, HDFC, and ICICI.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================== */}
          {/* ========================================================== */}
          {/* 4. NEARBY LANDMARKS & CONNECTIVITY (OFFICIAL FLYER MAP)    */}
          {/* ========================================================== */}
          <section id="sec-landmarks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Strategic Location</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Key Landmark Drive Times &amp; Distances
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Prime connectivity on Srisailam Highway with rapid drive-times to major upcoming industrial hubs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyLandmarks.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-orange transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.distance}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.time}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ========================================================== */}
          {/* 5. CONTACT & SITE VISIT SCHEDULER (PLOTS99 EXACT MATCH)    */}
          {/* ========================================================== */}
          <section id="sec-contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <Phone className="w-4 h-4" />
                    <span>Developer Desk</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    Connect with Our Project Desk
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                    Schedule an on-site visit to our Kadthal venture, receive certified DTCP/RERA documents, or request custom rate cards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="mailto:contact@skandhagroup.com"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Email Sales Desk</span>
                  </a>
                  <a
                    href="https://wa.me/919100031199?text=Hi%2C%20I%20am%20interested%20in%20visiting%20Skandha%20Group%20plots%20at%20Kadthal."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Office & Site Details */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Developer Information
                    </div>
                    <div className="font-serif text-lg font-bold text-slate-900">
                      Skandha Group
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Trusted real estate developer pioneering premium plotted developments, farm communities, and gated townships across Telangana.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Site Location</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        Kadthal, Srisailam Highway (NH 765)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        1 min from Maisigandi Temple
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Corporate Office</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        Hyderabad, Telangana, India
                      </div>
                      <div className="text-[11px] text-slate-500">
                        info@skandhagroup.com
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Site Desk Hours: Mon - Sun (9:00 AM - 7:00 PM)</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                      Open 7 Days
                    </span>
                  </div>
                </div>

                {/* Right Column: Site Visit & Plot Inquiry Form */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      Book a Free Guided Site Visit
                    </h4>
                    {selectedPlot && (
                      <span className="text-[11px] font-bold bg-orange-50 text-brand-orange border border-orange-200 px-2.5 py-0.5 rounded-full">
                        Plot #{selectedPlot.plotNumber} Selected
                      </span>
                    )}
                  </div>

                  {contactSuccess ? (
                    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>Site Visit Request Logged &amp; Confirmed!</span>
                      </div>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Thank you! Your verified enquiry has been logged dynamically into our developer portal. Our site coordinator from Skandha Group will contact you promptly.
                      </p>
                      {contactSuccessResult?.whatsappUrl && (
                        <a
                          href={contactSuccessResult.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all w-full sm:w-auto"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Send Details Directly on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ramesh Reddy"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Enter contact number"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Preferred Facing
                          </label>
                          <select
                            value={contactForm.facing}
                            onChange={(e) => setContactForm({ ...contactForm, facing: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          >
                            <option value="Any Facing">Any Facing</option>
                            <option value="North-East">North-East Facing</option>
                            <option value="North-West">North-West Facing</option>
                            <option value="South-East">South-East Facing</option>
                            <option value="South-West">South-West Facing</option>
                            <option value="Corner">Corner Plot</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Preferred Visit Date
                          </label>
                          <input
                            type="date"
                            value={contactForm.visitDate}
                            onChange={(e) => setContactForm({ ...contactForm, visitDate: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Notes / Requirements (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Interested in 200 sq.yds East plot, need pickup assistance"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactSubmitting || !contactForm.phone.trim()}
                        className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        {contactSubmitting ? (
                          <span>Submitting Request...</span>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Confirm Site Visit &amp; Request Rate Card</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>



      {/* ========================================================== */}
      {/* 6. SIGNATURE DARK FOOTER (PLOTS99 EXACT MATCH)             */}
      {/* ========================================================== */}
      <footer className="relative overflow-hidden bg-slate-950 text-slate-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        {/* Radial Glow Spheres matching Plots99 */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Col 1: Developer Branding */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/skandha_logo_official.png"
                  alt="Skandha Group"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white">Skandha Group</strong> presents a landmark DTCP-approved gated community residential layout, strategically poised on Srisailam Highway (NH 765), Kadthal.
              </p>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div><span className="text-slate-300 font-semibold">DTCP Sanction:</span> TLP NO. 87/2024/H</div>
                <div><span className="text-slate-300 font-semibold">TS RERA Reg:</span> PO2400009081</div>
                <div><span className="text-slate-300 font-semibold">Location:</span> Kadthal, Ranga Reddy Dist, Telangana</div>
              </div>
            </div>

            {/* Col 2: Layout & Planning */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Layout Specifications</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => scrollToSection('sec-overview')}>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span>96 Premium Plotted Units</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => scrollToSection('sec-overview')}>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span>60' Wide Arterial Highway Approach</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => scrollToSection('sec-overview')}>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span>33' Blacktop Internal Boulevards</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => scrollToSection('sec-overview')}>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span>Ac. 0.758 Landscaped Central Park</span>
                </li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => scrollToSection('sec-approvals')}>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                  <span>100% Vasthu Compliant East &amp; West Plots</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Strategic Growth Corridors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Regional Growth Hubs</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-orange" />
                  <span>Maisigandi Maisamma Temple (1 min)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-orange" />
                  <span>RRR Kadthal Interchange (10 mins)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-orange" />
                  <span>Pharma City &amp; Mucherla Future City (15 mins)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-orange" />
                  <span>RGIA Airport Shamshabad (32 mins)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-orange" />
                  <span>ORR Exit 14 Tukkuguda (25 mins)</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Corporate Office & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact &amp; Site Visits</h4>
              <p className="text-xs text-slate-400">
                Direct builder bookings with guaranteed spot registration and bank loan assistance.
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium text-left"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Request Site Desk Callback</span>
                </button>
                <a
                  href="https://wa.me/919100031199?text=Hi%2C%20I%20am%20interested%20in%20Skandha%20Group%20plots%20at%20Kadthal."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Legal Compliance & Disclaimer matching Plots99 */}
          <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-3 leading-relaxed">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span>&copy; {new Date().getFullYear()} Skandha Group. All Rights Reserved.</span>
                <span className="opacity-40">•</span>
                <a href="/" className="hover:text-slate-300 transition-colors">Main Portal</a>
                <span className="opacity-40">•</span>
                <a href="/project" className="hover:text-slate-300 transition-colors">Project Specifications</a>
                <span className="opacity-40">•</span>
                <a href="https://rerait.telangana.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">TS RERA Registry</a>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>DTCP Approved &bull; RERA Certified</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
                Legal Disclaimer
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                It is the sole responsibility of customers, owners, and marketing individuals to ensure a comprehensive review of plot dimensions and other details related to the plot and venture before proceeding. We act solely as a facilitator and are not liable for any disputes. The interactive 2D and 3D layout maps, road visualizations, plot boundaries, and metric estimates displayed on this platform represent the sanctioned DTCP master plan (TLP NO. 87/2024/H). Visual simulations are artistic impressions created for spatial orientation.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Close container-main */}
      </div>

      {/* ========================================================== */}
      {/* FLOATING AI ASSISTANT TRIGGER BUTTON (PLOTS99 EXACT MATCH) */}
      {/* ========================================================== */}
      <button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-semibold text-xs shadow-2xl transition-all duration-300 hover:scale-105 group"
        style={{
          background: 'linear-gradient(135deg, #329e4d 0%, #16a34a 50%, #6366f1 100%)',
          boxShadow: '0 8px 30px rgba(50, 158, 77, 0.45)'
        }}
        title="Chat with AI Venture Assistant"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
        </div>
        <span className="tracking-wide">Ask AI Assistant</span>
      </button>

      {/* ========================================================== */}
      {/* AI ASSISTANT MODAL DIALOG                                  */}
      {/* ========================================================== */}
      {isAIAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Skandha AI Assistant</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    Skandha Group Real Estate &amp; Master Plan Intelligence
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAIAssistantOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Questions Chips */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {[
                'Available East plots',
                'DTCP & RERA Approvals',
                'Distance from Temple & RGIA',
                'Plot sizes & dimensions',
                'Schedule site visit'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleAskAIPrompt(chip)}
                  className="px-2.5 py-1 rounded-full bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all shrink-0 whitespace-nowrap shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[380px] bg-slate-50/50">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendAIMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about plot availability, vasthu, approvals..."
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!aiInputText.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Direct WhatsApp Callout Footer */}
            <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
              <span className="font-medium">Prefer direct human assistance?</span>
              <a
                href="https://wa.me/919100031199?text=Hi%2C%20I%20am%20interested%20in%20Skandha%20Group%20plots."
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Sales Desk</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        prefilledPlot={selectedPlot}
      />

      {/* Official Flyer Schematic Route Map Modal (USER REQUIREMENT) */}
      {isRouteMapModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setIsRouteMapModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-brand-orange border border-orange-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold leading-tight">
                    Official Schematic Location Roadmap
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    From Official Project Brochure &bull; Srisailam Highway (NH 765) &bull; Kadthal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
                  <button
                    onClick={() => setRouteMapZoom((z) => Math.max(0.7, z - 0.2))}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                    title="Zoom Out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-slate-400">
                    {Math.round(routeMapZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setRouteMapZoom((z) => Math.min(2.5, z + 0.2))}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                    title="Zoom In"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {routeMapZoom !== 1 && (
                    <button
                      onClick={() => setRouteMapZoom(1)}
                      className="text-[10px] px-2 py-1 text-amber-400 hover:text-amber-300 font-bold border-l border-slate-700"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <a
                  href="/assets/skandha_flyer.pdf"
                  download="Skandha_Group_Flyer.pdf"
                  onClick={() => trackActivityEvent('brochure_downloaded', null, { label: 'Official Flyer PDF', source: 'PlotViewerStandalone' })}
                  className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Download Official Flyer PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>

                <button
                  onClick={() => setIsRouteMapModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Close Map"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 flex items-center justify-center min-h-[350px]">
              <div className="relative inline-block transition-transform duration-200 ease-out" style={{ transform: `scale(${routeMapZoom})` }}>
                <img
                  src="/assets/route_map_hd.png"
                  alt="Skandha Group Schematic Route Map"
                  className="max-h-[62vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/80"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> 1 min to Maisigandi Temple
                </span>
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Srisailam Highway (NH 765)
                </span>
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Pharma City SEZ Corridor
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://www.google.com/maps?q=16.9530689,78.4918425&z=17&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close id="main" */}
      </div>

    {/* Close containerRef */}
    </div>
  );
}
