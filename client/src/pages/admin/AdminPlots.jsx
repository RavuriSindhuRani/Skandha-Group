import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Minus,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Layers,
  Box,
  Compass,
  RotateCcw,
  Eye,
  Sparkles,
  MapPin,
  CheckCircle2,
  Sliders,
  Maximize2,
  User,
  UserCheck,
  UserPlus,
  Phone,
  Calendar,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import {
  adminGetPlots,
  adminCreatePlot,
  adminUpdatePlot,
  adminUpdatePlotStatus,
  adminResetAllPlotsAvailable,
  adminBookPlot,
  adminDeletePlot,
  adminExportPlotsCsv,
  adminImportPlotsCsv,
  getPlotSyncVersion,
  notifyPlotsChangedLocally
} from '../../api/client';
import { getEnrichedPlots, statusColors } from '../../visualizer/masterPlanData';
import LayoutMasterView from '../../visualizer/LayoutMasterView';

// Local storage override helpers to guarantee plot and booking data persistence
const getLocalOverrides = () => {
  try {
    const raw = localStorage.getItem('skandha_plots_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const saveLocalOverride = (plotNumber, data) => {
  try {
    const current = getLocalOverrides();
    current[plotNumber] = { ...(current[plotNumber] || {}), ...data };
    localStorage.setItem('skandha_plots_overrides', JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save plot override:', e);
  }
};

const getEnrichedPlotsWithOverrides = (serverPlots = null) => {
  if (serverPlots && serverPlots.length > 0) {
    return getEnrichedPlots(serverPlots);
  }
  const overrides = getLocalOverrides();
  const base = getEnrichedPlots();
  return base.map(p => {
    const ov = overrides[p.plotNumber];
    return ov ? { ...p, ...ov } : p;
  });
};

export default function AdminPlots() {
  const [viewMode, setViewMode] = useState('table'); // 'table' | '2d' | '3d'
  const [plots, setPlots] = useState(() => getEnrichedPlotsWithOverrides().slice(0, 20));
  const [allPlots, setAllPlots] = useState(() => getEnrichedPlotsWithOverrides());
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(96);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [facingFilter, setFacingFilter] = useState('');
  const [adminCameraPreset, setAdminCameraPreset] = useState('overview');
  const [animateVehicles, setAnimateVehicles] = useState(true);
  const layout2DRef = useRef(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editPlot, setEditPlot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    plotNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingAmount: '',
    bookingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'token_paid',
    notes: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    plotNumber: '',
    block: '',
    areaSqYds: 183,
    dimensions: "50' x 33'",
    facing: 'North-East',
    roadWidth: "33'-0\"",
    isCorner: false,
    status: 'available',
    basePricePerSqYd: 12500,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingDate: '',
    bookingAmount: '',
    paymentStatus: 'unpaid',
    notes: ''
  });

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Check URL query parameters for default view mode e.g. /admin/plots?view=2d or ?view=3d
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === '2d' || viewParam === '3d') {
      setViewMode(viewParam);
    }
    const plotParam = params.get('plot');
    if (plotParam) {
      setSearch(plotParam);
    }
  }, []);

  useEffect(() => {
    loadPlots();
  }, [page, search, statusFilter, facingFilter]);

  useEffect(() => {
    loadAllPlots();
  }, []);

  // Filter local plots fallback guaranteeing 96 actual plots always display
  const applyLocalPlots = () => {
    let all = getEnrichedPlotsWithOverrides();
    // Filter by search (plot number, buyer name, phone, notes)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const numQ = search.replace(/\D/g, '');
      all = all.filter(p => {
        const matchesNum = numQ && String(p.plotNumber) === numQ;
        const matchesText =
          String(p.plotNumber).includes(q) ||
          (p.customerName && p.customerName.toLowerCase().includes(q)) ||
          (p.customerPhone && p.customerPhone.toLowerCase().includes(q)) ||
          (p.customerEmail && p.customerEmail.toLowerCase().includes(q)) ||
          (p.facing && p.facing.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q));
        return matchesNum || matchesText;
      });
    }
    // Filter by status
    if (statusFilter) {
      if (statusFilter === 'booked') {
        all = all.filter(p => p.status === 'booked' || p.status === 'reserved');
      } else {
        all = all.filter(p => p.status === statusFilter);
      }
    }
    // Filter by facing
    if (facingFilter) {
      all = all.filter(p => p.facing === facingFilter);
    }
    setTotal(all.length);
    const start = (page - 1) * 20;
    setPlots(all.slice(start, start + 20));
    setLoading(false);
  };

  const loadPlots = async () => {
    setLoading(true);
    try {
      const res = await adminGetPlots({
        page,
        limit: 20,
        search,
        status: statusFilter
      });
      if (res && res.success && Array.isArray(res.plots) && res.plots.length > 0) {
        setPlots(res.plots);
        setTotal(res.total);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Failed to load paginated plots from API, falling back to local master dataset:', err);
    }
    applyLocalPlots();
  };

  const loadAllPlots = async () => {
    try {
      const res = await adminGetPlots({ all: 'true' });
      if (res && res.success && Array.isArray(res.plots) && res.plots.length > 0) {
        setAllPlots(getEnrichedPlots(res.plots));
        return;
      }
    } catch (err) {
      console.warn('Failed to load all plots for visualizer, using fallback enriched:', err);
    }
    setAllPlots(getEnrichedPlotsWithOverrides());
  };

  // Real-time Multi-Device, Multi-Admin Synchronization Engine
  const syncVersionRef = useRef(0);
  const isSyncingRef = useRef(false);

  const checkSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    try {
      isSyncingRef.current = true;
      const res = await getPlotSyncVersion();
      if (res && res.success && typeof res.version === 'number') {
        if (syncVersionRef.current === 0) {
          syncVersionRef.current = res.version;
        } else if (res.version > syncVersionRef.current) {
          console.log(`[AdminPlots Sync] Remote update detected: version ${syncVersionRef.current} -> ${res.version}. Syncing plots across devices...`);
          syncVersionRef.current = res.version;
          await Promise.all([loadAllPlots(), loadPlots()]);
        }
      }
    } catch (e) {
      // Non-blocking sync check
    } finally {
      isSyncingRef.current = false;
    }
  }, [page, search, statusFilter, facingFilter]);

  useEffect(() => {
    // 1. Initial version check
    checkSync();

    // 2. Poll every 3 seconds for updates made by another admin or on another device
    const pollTimer = setInterval(() => {
      checkSync();
    }, 3000);

    // 3. Immediate sync on window focus or visibility change (e.g. switching back to tab/phone)
    const handleFocus = () => checkSync();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkSync();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Same-device cross-tab instantaneous sync via BroadcastChannel
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

    const handleCustomSync = () => checkSync();
    window.addEventListener('skandha:plot_updated', handleCustomSync);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('skandha:plot_updated', handleCustomSync);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, [checkSync]);

  const [searchNotFound, setSearchNotFound] = useState(false);

  const handleAdminExecuteSearch = (e) => {
    e?.preventDefault();
    const clean = search.trim();
    if (!clean) {
      setSearchNotFound(false);
      return;
    }
    let found = allPlots.find(p => String(p.plotNumber) === clean);
    if (!found) {
      const digits = clean.replace(/\D/g, '');
      if (digits) {
        found = allPlots.find(p => String(p.plotNumber) === digits);
      }
    }
    if (found) {
      setSearchNotFound(false);
      setSelectedPlot(found);
      if (viewMode === '3d' && adminCameraPreset === 'park') {
        setAdminCameraPreset('overview');
      }
    } else {
      setSearchNotFound(true);
      setTimeout(() => setSearchNotFound(false), 3000);
    }
  };

  // Inventory stats computed across all plots: available, booked, blocked, sold
  const invStats = React.useMemo(() => {
    const totalCount = allPlots.length || total || 96;
    let avail = 0;
    let sold = 0;
    let booked = 0;
    let blocked = 0;
    allPlots.forEach(p => {
      if (p.status === 'sold') sold++;
      else if (p.status === 'blocked') blocked++;
      else if (p.status === 'booked' || p.status === 'reserved') booked++;
      else avail++;
    });
    return {
      total: totalCount,
      available: avail,
      booked,
      blocked,
      sold
    };
  }, [allPlots, total]);

  const openBookingModal = (plot = null) => {
    setBookingData({
      plotNumber: plot ? String(plot.plotNumber) : '',
      customerName: plot?.customerName || '',
      customerPhone: plot?.customerPhone || '',
      customerEmail: plot?.customerEmail || '',
      bookingAmount: plot?.bookingAmount || '',
      bookingDate: plot?.bookingDate ? plot.bookingDate.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentStatus: plot?.paymentStatus || 'token_paid',
      notes: plot?.notes || ''
    });
    setIsBookModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    const targetNum = Number(bookingData.plotNumber);
    if (!targetNum || isNaN(targetNum)) {
      setFeedbackError('Please select a valid plot number.');
      return;
    }
    if (!bookingData.customerName?.trim() || !bookingData.customerPhone?.trim()) {
      setFeedbackError('Customer Name and Mobile Phone Number are required.');
      return;
    }

    const bookingPayload = {
      ...bookingData,
      plotNumber: targetNum,
      status: 'booked'
    };

    // Save locally first to guarantee instant UI response
    saveLocalOverride(targetNum, bookingPayload);

    // Immediately update state so table, 2D/3D map, KPI counts, and drawer update with zero lag
    setPlots(prev => prev.map(p => p.plotNumber === targetNum ? { ...p, ...bookingPayload } : p));
    setAllPlots(prev => prev.map(p => p.plotNumber === targetNum ? { ...p, ...bookingPayload } : p));
    if (selectedPlot && selectedPlot.plotNumber === targetNum) {
      setSelectedPlot(prev => ({ ...prev, ...bookingPayload }));
    }

    // Dispatch global plot update event across tabs and components
    notifyPlotsChangedLocally({ plotNumber: targetNum, ...bookingPayload });

    try {
      const res = await adminBookPlot(targetNum, bookingData);
      if (res && res.success && res.plot) {
        saveLocalOverride(targetNum, res.plot);
        setPlots(prev => prev.map(p => p.plotNumber === targetNum ? { ...p, ...res.plot } : p));
        setAllPlots(prev => prev.map(p => p.plotNumber === targetNum ? { ...p, ...res.plot } : p));
        if (selectedPlot && selectedPlot.plotNumber === targetNum) {
          setSelectedPlot(prev => ({ ...prev, ...res.plot }));
        }
      }
    } catch (err) {
      console.warn('Backend booking API failed, plot saved to local session:', err);
    }

    setFeedbackMsg(`Plot ${targetNum} successfully booked for ${bookingData.customerName}!`);
    setIsBookModalOpen(false);
    loadPlots();
    loadAllPlots();
    checkSync();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleQuickStatusChange = async (plotNumber, newStatus) => {
    // Keep 'blocked' and 'booked' distinct
    let norm = (newStatus || '').toLowerCase().trim();
    if (norm === 'block') norm = 'blocked';
    if (norm === 'reserved' || norm === 'resv') norm = 'booked';

    // When admin wants to change plot status to booked, customer details MUST be captured
    if (norm === 'booked') {
      const targetPlot = allPlots.find(p => p.plotNumber === plotNumber) || (selectedPlot?.plotNumber === plotNumber ? selectedPlot : null) || { plotNumber };
      openBookingModal(targetPlot);
      return;
    }

    const payload = {
      status: norm,
      ...(norm === 'available' ? {
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        bookingAmount: 0,
        bookingDate: '',
        paymentStatus: 'unpaid',
        notes: ''
      } : {})
    };

    saveLocalOverride(plotNumber, payload);
    setPlots(prev => prev.map(p => p.plotNumber === plotNumber ? { ...p, ...payload } : p));
    setAllPlots(prev => prev.map(p => p.plotNumber === plotNumber ? { ...p, ...payload } : p));
    if (selectedPlot && selectedPlot.plotNumber === plotNumber) {
      setSelectedPlot(prev => ({ ...prev, ...payload }));
    }

    // Broadcast globally to update 2D map, 3D visualizer, and drawers simultaneously across devices
    notifyPlotsChangedLocally({ plotNumber, ...payload });

    const label = norm === 'blocked' ? 'BLOCKED' : norm === 'booked' ? 'BOOKED' : norm.toUpperCase();
    setFeedbackMsg(`Plot ${plotNumber} status updated to ${label} across entire layout!`);
    setTimeout(() => setFeedbackMsg(''), 3000);

    try {
      await adminUpdatePlotStatus(plotNumber, norm);
      checkSync();
    } catch (err) {
      console.warn('Backend status update failed, kept in local session:', err);
    }
  };

  const handleResetAllPlotsToAvailable = async () => {
    if (!window.confirm('Reset ALL 96 layout plots to AVAILABLE? This will clear all mock bookings across 2D map, 3D model, and tables.')) {
      return;
    }
    setLoading(true);
    try {
      localStorage.removeItem('skandha_plots_overrides');
      await adminResetAllPlotsAvailable();
    } catch (e) {
      console.warn('Backend reset call:', e);
    }

    const freshPlots = getEnrichedPlots();
    setAllPlots(freshPlots);
    setPlots(freshPlots.slice(0, 20));
    if (selectedPlot) {
      setSelectedPlot(prev => ({
        ...prev,
        status: 'available',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        bookingAmount: 0,
        bookingDate: '',
        paymentStatus: 'unpaid',
        notes: ''
      }));
    }

    notifyPlotsChangedLocally({ resetAll: true });
    checkSync();

    setLoading(false);
    setFeedbackMsg('All 96 plots have been successfully reset to Available!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleSavePlot = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    const targetPlotNum = editPlot ? editPlot.plotNumber : Number(formData.plotNumber);
    const savePayload = {
      ...formData,
      plotNumber: targetPlotNum,
      areaSqYds: Number(formData.areaSqYds)
    };
    saveLocalOverride(targetPlotNum, savePayload);

    try {
      if (editPlot) {
        await adminUpdatePlot(editPlot.plotNumber, formData);
      } else {
        await adminCreatePlot(savePayload);
      }
      notifyPlotsChangedLocally({ plotNumber: targetPlotNum, ...savePayload });
      checkSync();
    } catch (err) {
      console.warn('Backend save plot failed, saved locally:', err);
    }

    setFeedbackMsg(`Plot ${targetPlotNum} saved successfully.`);
    if (editPlot) setEditPlot(null);
    else setIsAddOpen(false);
    loadPlots();
    loadAllPlots();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminDeletePlot(deleteTarget.plotNumber);
      if (res.success) {
        setFeedbackMsg(`Plot ${deleteTarget.plotNumber} deleted.`);
        notifyPlotsChangedLocally({ plotNumber: deleteTarget.plotNumber, deleted: true });
        setDeleteTarget(null);
        if (selectedPlot?.plotNumber === deleteTarget.plotNumber) {
          setSelectedPlot(null);
        }
        loadPlots();
        loadAllPlots();
        checkSync();
      }
    } catch (err) {
      setFeedbackError(err.message);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await adminImportPlotsCsv(parsed);
      if (res.success) {
        setFeedbackMsg(res.message);
        setIsImportOpen(false);
        loadPlots();
        loadAllPlots();
      }
    } catch (err) {
      setFeedbackError('Invalid JSON format for import. Expected array of plot objects.');
    }
  };

  const openEditModal = (plot) => {
    setEditPlot(plot);
    setFormData({
      plotNumber: plot.plotNumber,
      block: plot.block || '',
      areaSqYds: plot.areaSqYds,
      dimensions: plot.dimensions,
      facing: plot.facing,
      roadWidth: plot.roadWidth,
      isCorner: plot.isCorner,
      status: plot.status,
      basePricePerSqYd: plot.basePricePerSqYd || 12500,
      customerName: plot.customerName || '',
      customerPhone: plot.customerPhone || '',
      customerEmail: plot.customerEmail || '',
      bookingDate: plot.bookingDate || '',
      bookingAmount: plot.bookingAmount || '',
      paymentStatus: plot.paymentStatus || 'unpaid',
      notes: plot.notes || ''
    });
  };

  const openAddModal = () => {
    setEditPlot(null);
    setFormData({
      plotNumber: '',
      block: '',
      areaSqYds: 183,
      dimensions: "50' x 33'",
      facing: 'East',
      roadWidth: "33'-0\"",
      isCorner: false,
      status: 'available',
      basePricePerSqYd: 12500,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      bookingDate: '',
      bookingAmount: '',
      paymentStatus: 'unpaid',
      notes: ''
    });
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions (Four Fields: 2D Map, 3D Master Plan, Book Plot for Customer, Export CSV) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2.5">
        {/* Back to Website Button */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 hover:border-slate-900 group shadow-2xs shrink-0"
          title="Return to main public website"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Website</span>
        </a>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* View Mode Switcher: 2D Map & 3D Master Plan */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => {
              setViewMode(viewMode === '2d' ? 'table' : '2d');
              if (allPlots.length === 0) loadAllPlots();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>2D Map</span>
          </button>

          <button
            onClick={() => {
              setViewMode(viewMode === '3d' ? 'table' : '3d');
              if (allPlots.length === 0) loadAllPlots();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-white text-brand-orange shadow-xs ring-1 ring-orange-500/30'
                : 'text-slate-600 hover:text-brand-orange'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-brand-orange" />
            <span>3D Master Plan</span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Book Plot for Customer */}
        <button
          onClick={() => openBookingModal(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-2xs"
          title="Book a plot directly for customer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Book Plot for Customer</span>
        </button>

        {/* Export CSV */}
        <button
          onClick={() => adminExportPlotsCsv()}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          title="Download CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>

        {/* Reset All to Available Button */}
        <button
          onClick={handleResetAllPlotsToAvailable}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all shadow-2xs ml-auto"
          title="Reset all 96 layout plots to Available"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Make All Plots Available</span>
        </button>
      </div>

      {/* KPI Inventory Status Bar - 4 Real-Estate States: Available, Booked, Blocked, Sold Out */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Units</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{invStats.total}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
            96
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Available</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{invStats.available}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            {Math.round((invStats.available / invStats.total) * 100)}%
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Booked</div>
            <div className="text-xl font-black text-amber-700 mt-0.5">{invStats.booked}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
            {Math.round((invStats.booked / invStats.total) * 100)}%
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-sky-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Blocked</div>
            <div className="text-xl font-black text-sky-700 mt-0.5">{invStats.blocked}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
            {Math.round((invStats.blocked / invStats.total) * 100)}%
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Sold Out</div>
            <div className="text-xl font-black text-rose-700 mt-0.5">{invStats.sold}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
            {Math.round((invStats.sold / invStats.total) * 100)}%
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {feedbackError && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW MODE 1: 2D CARTOGRAPHIC MAP VIEW                      */}
      {/* VIEW MODE 2: 3D THREE.JS WEBGL MASTER PLAN VIEW            */}
      {/* ========================================================== */}
      {(viewMode === '2d' || viewMode === '3d') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative">
          {/* Visualizer Toolbar */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Plot with explicit Search Button */}
              <form
                onSubmit={handleAdminExecuteSearch}
                className="relative flex items-center gap-1.5"
              >
                <div className="relative w-36 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search plot..."
                    value={search}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearch(val);
                      const clean = val.trim();
                      if (!clean) {
                        setSearchNotFound(false);
                        return;
                      }
                      const digits = clean.replace(/\D/g, '');
                      const found = plots.find(p => String(p.plotNumber) === clean || (digits && String(p.plotNumber) === digits));
                      if (found) {
                        setSearchNotFound(false);
                        setSelectedPlot(found);
                      }
                    }}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-semibold text-slate-900"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setSelectedPlot(null);
                        setSearchNotFound(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {searchNotFound && (
                  <div className="absolute top-10 left-0 bg-red-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg animate-fadeIn whitespace-nowrap z-50">
                    Plot not found (1-96)
                  </div>
                )}
              </form>

              {/* Status Quick Filter Buttons */}
              <div className="flex items-center gap-1">
                {[
                  { key: '', label: 'All' },
                  { key: 'available', label: 'Available' },
                  { key: 'booked', label: 'Booked' },
                  { key: 'blocked', label: 'Blocked' },
                  { key: 'sold', label: 'Sold Out' }
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(statusFilter === st.key ? '' : st.key)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize transition-all border ${
                      statusFilter === st.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Facing Filter */}
              <select
                value={facingFilter}
                onChange={(e) => setFacingFilter(e.target.value)}
                className="text-[11px] font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 outline-none"
              >
                <option value="">All Facings</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>

            {/* Mode-Specific Actions */}
            <div className="flex items-center gap-2">
              {viewMode === '3d' && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setAdminCameraPreset('overview')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      adminCameraPreset === 'overview'
                        ? 'bg-brand-orange text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setAdminCameraPreset('topDown')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      adminCameraPreset === 'topDown'
                        ? 'bg-brand-orange text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Top-Down
                  </button>
                  <button
                    onClick={() => setAdminCameraPreset('park')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      adminCameraPreset === 'park'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Park View
                  </button>
                  <button
                    onClick={() => setAnimateVehicles(!animateVehicles)}
                    className={`px-2 py-1 rounded-lg font-semibold text-[11px] border transition-colors ${
                      animateVehicles
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                    title="Toggle vehicle traffic"
                  >
                    Cars {animateVehicles ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}

              {viewMode === '2d' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => layout2DRef.current?.zoomIn()}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Zoom In"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => layout2DRef.current?.zoomOut()}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Zoom Out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => layout2DRef.current?.reset()}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
                    title="Reset Fit"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setViewMode('table')}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                title="Close Visualizer & Return to Table View"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Map</span>
              </button>
            </div>
          </div>

          {/* Interactive Visualizer Map Canvas */}
          <div className="w-full h-[680px] relative bg-slate-900">
            <LayoutMasterView
              ref={layout2DRef}
              viewMode={viewMode}
              plots={allPlots}
              selectedPlot={selectedPlot}
              onSelectPlot={(p) => setSelectedPlot(p)}
              cameraPreset={adminCameraPreset}
              searchTerm={search}
              filterStatus={statusFilter}
              filterFacing={facingFilter}
              animateVehicles={animateVehicles}
            />

            {/* Floating Plot Quick Inspector Card (When clicked in 2D or 3D) */}
            {selectedPlot && (
              <div className="absolute top-4 right-4 z-30 w-80 sm:w-92 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 space-y-3.5 animate-fadeIn max-h-[90%] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        selectedPlot.status === 'sold'
                          ? 'bg-[#F87171]'
                          : selectedPlot.status === 'blocked'
                          ? 'bg-[#38BDF8]'
                          : selectedPlot.status === 'booked' || selectedPlot.status === 'reserved'
                          ? 'bg-[#FACC15]'
                          : 'bg-[#4ADE80]'
                      }`}
                    />
                    <span className="font-bold text-slate-900 text-base">
                      Plot #{selectedPlot.plotNumber}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      ({selectedPlot.block || 'Layout'})
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      selectedPlot.status === 'sold'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : selectedPlot.status === 'blocked'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : selectedPlot.status === 'booked' || selectedPlot.status === 'reserved'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {selectedPlot.status === 'sold'
                        ? 'Sold Out'
                        : selectedPlot.status === 'blocked'
                        ? 'Blocked'
                        : selectedPlot.status === 'booked' || selectedPlot.status === 'reserved'
                        ? 'Booked'
                        : 'Available'}
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

                {/* Direct One-Click Status Updater (4 options: Available, Booked, Blocked, Sold Out) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Instant Status Update:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'available', label: 'Avail', bg: 'bg-emerald-600', text: 'text-white' },
                      { key: 'booked', label: 'Book', bg: 'bg-amber-500', text: 'text-slate-950' },
                      { key: 'blocked', label: 'Block', bg: 'bg-sky-500', text: 'text-white' },
                      { key: 'sold', label: 'Sold', bg: 'bg-rose-600', text: 'text-white' }
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => handleQuickStatusChange(selectedPlot.plotNumber, st.key)}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                          selectedPlot.status === st.key || (st.key === 'booked' && selectedPlot.status === 'reserved')
                            ? `${st.bg} ${st.text} ring-2 ring-offset-1 ring-slate-900 shadow-xs`
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specifications Key-Values (Clean Plot Specifications matching Plots API) */}
                <div className="py-2 space-y-1.5 text-xs border-y border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Vasthu Facing</span>
                    <strong className="text-slate-900 font-semibold">{selectedPlot.facing} Facing</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Plot Area</span>
                    <strong className="text-slate-900 font-semibold">
                      {selectedPlot.areaSqYds} Sq.Yds ({Math.round(selectedPlot.areaSqYds * 9)} Sq.Ft)
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Dimensions</span>
                    <strong className="text-slate-900 font-semibold">{selectedPlot.dimensions}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Adjoining Road</span>
                    <strong className="text-slate-900 font-semibold">{selectedPlot.roadWidth || "33'-0\""} Wide Road</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Plot Type</span>
                    <span className={`text-[11px] font-bold ${selectedPlot.isCorner ? 'text-amber-600' : 'text-slate-600'}`}>
                      {selectedPlot.isCorner ? 'Corner Plot (Vasthu Prime)' : 'Standard Villa Plot'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Approvals</span>
                    <span className="text-[10px] font-bold text-emerald-700">DTCP Approved &bull; TS RERA</span>
                  </div>
                </div>

                {/* Google Maps Exact Venture Location Pin */}
                <div className="pt-2">
                  <a
                    href="https://www.google.com/maps?q=16.9530689,78.4918425&z=17&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Venture on Google Maps</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VIEW MODE 3: TABULAR INVENTORY TABLE VIEW                  */}
      {/* ========================================================== */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Plot..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="blocked">Blocked</option>
                <option value="sold">Sold Out</option>
              </select>

              <select
                value={facingFilter}
                onChange={(e) => { setFacingFilter(e.target.value); setPage(1); }}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none"
              >
                <option value="">All Facings</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Total Filtered: <strong>{total}</strong> plots
            </div>
          </div>

          {/* Plots Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Plot No</th>
                    <th className="px-5 py-3.5">Area (Sq.Yds)</th>
                    <th className="px-5 py-3.5">Dimensions</th>
                    <th className="px-5 py-3.5">Facing</th>
                    <th className="px-5 py-3.5">Road Width</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">Loading plots inventory...</td>
                    </tr>
                  ) : plots.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">No plots found matching filters.</td>
                    </tr>
                  ) : (
                    plots.map(plot => {
                      const meta = statusColors[plot.status] || statusColors.available;
                      return (
                        <tr key={plot.plotNumber} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3 font-bold text-slate-900 text-sm">
                            {plot.plotNumber}
                          </td>
                          <td className="px-5 py-3 font-semibold">{plot.areaSqYds} yd²</td>
                          <td className="px-5 py-3 text-slate-500">{plot.dimensions}</td>
                          <td className="px-5 py-3">
                            <span className="font-semibold text-slate-900">{plot.facing}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-600 font-medium">{plot.roadWidth || '33ft'}</td>
                          <td className="px-5 py-3">
                            <select
                              value={plot.status}
                              onChange={(e) => handleQuickStatusChange(plot.plotNumber, e.target.value)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${meta.badge}`}
                            >
                              <option value="available">Available</option>
                              <option value="booked">Booked</option>
                              <option value="blocked">Blocked</option>
                              <option value="sold">Sold Out</option>
                            </select>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(plot)}
                                title="Edit Plot Details"
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-brand-orange transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(plot)}
                                title="Delete Plot"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>Page {page} of {Math.ceil(total / 20) || 1}</div>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  disabled={page * 20 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Plot Modal */}
      {(isAddOpen || editPlot) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {editPlot ? `Edit Plot ${editPlot.plotNumber}` : 'Add New Plot'}
              </h3>
              <button
                onClick={() => { setIsAddOpen(false); setEditPlot(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plot Number *</label>
                  <input
                    type="number"
                    required
                    disabled={!!editPlot}
                    value={formData.plotNumber}
                    onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area (Sq. Yards) *</label>
                  <input
                    type="number"
                    required
                    value={formData.areaSqYds}
                    onChange={(e) => setFormData({ ...formData, areaSqYds: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dimensions *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50' x 33'"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vasthu Facing *</label>
                  <select
                    value={formData.facing}
                    onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Road Width</label>
                  <input
                    type="text"
                    placeholder="e.g. 33'-0&quot;"
                    value={formData.roadWidth}
                    onChange={(e) => setFormData({ ...formData, roadWidth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-bold"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="sold">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price / Sq.Yd (₹)</label>
                  <input
                    type="number"
                    value={formData.basePricePerSqYd}
                    onChange={(e) => setFormData({ ...formData, basePricePerSqYd: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCorner}
                      onChange={(e) => setFormData({ ...formData, isCorner: e.target.checked })}
                      className="rounded text-brand-orange focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-700">Prime Corner Plot</span>
                  </label>
                </div>
              </div>

              {/* Customer & Booking Information */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    Buyer &amp; Booking Details
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium">For Reserved / Sold Plots</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Customer / Buyer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="buyer@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Booking / Token Date</label>
                    <input
                      type="date"
                      value={formData.bookingDate ? formData.bookingDate.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Token Paid (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100000"
                      value={formData.bookingAmount}
                      onChange={(e) => setFormData({ ...formData, bookingAmount: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none font-medium"
                    >
                      <option value="unpaid">Unpaid / In Discussion</option>
                      <option value="token_paid">Token Paid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="fully_paid">Fully Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Admin Comments</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditPlot(null); }}
                  className="flex-1 py-2 font-bold border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-2 rounded-xl transition-colors"
                >
                  {editPlot ? 'Save Changes' : 'Create Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Confirm Plot Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>Plot {deleteTarget.plotNumber}</strong>? This operation will be permanently logged in the audit trail.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-bold border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl"
              >
                Delete Plot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Bulk Import Plots (JSON)
              </h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Paste JSON array containing plot objects (e.g. <code>[{`{"plotNumber":1,"areaSqYds":241,...}`}]</code>). Existing plot numbers will be safely updated without duplicates.
            </p>
            <textarea
              rows="8"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="[{ ... }]"
              className="w-full font-mono text-xs p-3 border border-slate-300 rounded-xl outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsImportOpen(false)}
                className="flex-1 py-2 text-xs font-bold border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold py-2 rounded-xl"
              >
                Process Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Plot For Customer Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <span>Book Plot for Customer</span>
                </h3>
                <p className="text-xs text-slate-500">Record customer advance booking and lock plot status</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Plot Number *</label>
                <select
                  required
                  value={bookingData.plotNumber}
                  onChange={(e) => {
                    const chosen = allPlots.find(p => String(p.plotNumber) === e.target.value);
                    setBookingData({
                      ...bookingData,
                      plotNumber: e.target.value,
                      customerName: chosen?.customerName || bookingData.customerName,
                      customerPhone: chosen?.customerPhone || bookingData.customerPhone,
                      customerEmail: chosen?.customerEmail || bookingData.customerEmail,
                      bookingAmount: chosen?.bookingAmount || bookingData.bookingAmount,
                      bookingDate: chosen?.bookingDate ? chosen.bookingDate.split('T')[0] : bookingData.bookingDate,
                      paymentStatus: chosen?.paymentStatus || bookingData.paymentStatus,
                      notes: chosen?.notes || bookingData.notes
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-bold text-slate-900"
                >
                  <option value="">-- Choose Plot Number (1 to 96) --</option>
                  {(allPlots.length > 0 ? allPlots : plots).map(p => (
                    <option key={p.plotNumber} value={p.plotNumber}>
                      Plot {p.plotNumber} ({p.areaSqYds} yd², {p.facing}) [{p.status.toUpperCase()}]{p.customerName ? ` - ${p.customerName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="buyer@example.com"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booking Date</label>
                  <input
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booking Amount / Advance Paid (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={bookingData.bookingAmount}
                    onChange={(e) => setBookingData({ ...bookingData, bookingAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={bookingData.paymentStatus}
                    onChange={(e) => setBookingData({ ...bookingData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="token_paid">Token Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                    <option value="unpaid">Unpaid / In Discussion</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-2.5 font-bold border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-xs"
                >
                  Confirm &amp; Book Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
