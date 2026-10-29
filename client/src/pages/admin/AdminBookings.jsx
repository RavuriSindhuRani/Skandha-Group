import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  adminGetPlots,
  adminBookPlot,
  adminUpdatePlotStatus,
  adminUpdatePlot
} from '../../api/client';
import { getEnrichedPlots } from '../../visualizer/masterPlanData';

// Local storage override helpers
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
  const overrides = getLocalOverrides();
  const base = getEnrichedPlots(serverPlots);
  return base.map(p => {
    const ov = overrides[p.plotNumber];
    return ov ? { ...p, ...ov } : p;
  });
};

export default function AdminBookings() {
  const [allPlots, setAllPlots] = useState(() => getEnrichedPlotsWithOverrides());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [releaseTarget, setReleaseTarget] = useState(null);
  const [bookingData, setBookingData] = useState({
    plotNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingAmount: '200000',
    bookingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'token_paid',
    notes: ''
  });

  useEffect(() => {
    loadBookingsData();
  }, []);

  const loadBookingsData = async () => {
    setLoading(true);
    try {
      const res = await adminGetPlots({ all: 'true' });
      if (res && res.success && Array.isArray(res.plots) && res.plots.length > 0) {
        setAllPlots(getEnrichedPlotsWithOverrides(res.plots));
      } else {
        setAllPlots(getEnrichedPlotsWithOverrides());
      }
    } catch (err) {
      console.warn('Failed to load plots from API, falling back to local master dataset:', err);
      setAllPlots(getEnrichedPlotsWithOverrides());
    } finally {
      setLoading(false);
    }
  };

  // Filter only plots that have booking or customer details
  const bookings = React.useMemo(() => {
    let list = allPlots.filter(p =>
      p.status === 'booked' ||
      p.status === 'reserved' ||
      p.status === 'sold' ||
      !!p.customerName
    );

    // Apply text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const numQ = search.replace(/\D/g, '');
      list = list.filter(p => {
        const matchesNum = numQ && String(p.plotNumber) === numQ;
        const matchesName = p.customerName && p.customerName.toLowerCase().includes(q);
        const matchesPhone = p.customerPhone && p.customerPhone.toLowerCase().includes(q);
        const matchesEmail = p.customerEmail && p.customerEmail.toLowerCase().includes(q);
        const matchesNotes = p.notes && p.notes.toLowerCase().includes(q);
        return matchesNum || matchesName || matchesPhone || matchesEmail || matchesNotes;
      });
    }

    // Apply payment status filter
    if (statusFilter) {
      list = list.filter(p => (p.paymentStatus || 'token_paid') === statusFilter);
    }

    // Sort by plot number ascending
    return list.sort((a, b) => Number(a.plotNumber) - Number(b.plotNumber));
  }, [allPlots, search, statusFilter]);

  // Analytics stats
  const stats = React.useMemo(() => {
    const totalBookings = allPlots.filter(p =>
      p.status === 'booked' || p.status === 'reserved' || p.status === 'sold' || !!p.customerName
    );
    let totalAdvance = 0;
    let fullyPaidCount = 0;
    let tokenPaidCount = 0;

    totalBookings.forEach(p => {
      const amt = Number(p.bookingAmount) || 0;
      totalAdvance += amt;
      if (p.paymentStatus === 'fully_paid' || p.status === 'sold') {
        fullyPaidCount++;
      } else {
        tokenPaidCount++;
      }
    });

    return {
      total: totalBookings.length,
      totalAdvance,
      fullyPaid: fullyPaidCount,
      tokenPaid: tokenPaidCount
    };
  }, [allPlots]);

  const openNewBookingModal = () => {
    setEditingPlot(null);
    setBookingData({
      plotNumber: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      bookingAmount: '200000',
      bookingDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'token_paid',
      notes: ''
    });
    setIsBookModalOpen(true);
  };

  const openEditBookingModal = (plot) => {
    setEditingPlot(plot);
    setBookingData({
      plotNumber: String(plot.plotNumber),
      customerName: plot.customerName || '',
      customerPhone: plot.customerPhone || '',
      customerEmail: plot.customerEmail || '',
      bookingAmount: plot.bookingAmount || '',
      bookingDate: plot.bookingDate ? plot.bookingDate.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentStatus: plot.paymentStatus || 'token_paid',
      notes: plot.notes || ''
    });
    setIsBookModalOpen(true);
  };

  const handleSaveBooking = async (e) => {
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

    const payload = {
      ...bookingData,
      plotNumber: targetNum,
      status: bookingData.paymentStatus === 'fully_paid' ? 'sold' : 'booked'
    };

    saveLocalOverride(targetNum, payload);

    try {
      const res = await adminBookPlot(targetNum, payload);
      if (res && res.success) {
        saveLocalOverride(targetNum, res.plot || payload);
      }
    } catch (err) {
      console.warn('Backend booking API error, saved locally:', err);
    }

    setFeedbackMsg(`Booking for Plot ${targetNum} (${bookingData.customerName}) saved successfully!`);
    setIsBookModalOpen(false);
    loadBookingsData();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleReleaseBooking = async () => {
    if (!releaseTarget) return;
    const targetNum = releaseTarget.plotNumber;
    const releasedPayload = {
      status: 'available',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      bookingAmount: 0,
      bookingDate: '',
      paymentStatus: 'unpaid',
      notes: ''
    };

    saveLocalOverride(targetNum, releasedPayload);

    try {
      await adminUpdatePlot(targetNum, releasedPayload);
      await adminUpdatePlotStatus(targetNum, 'available');
    } catch (err) {
      console.warn('Backend release failed, released locally:', err);
    }

    setFeedbackMsg(`Plot ${targetNum} booking released back to available status.`);
    setReleaseTarget(null);
    loadBookingsData();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Plot Number',
      'Area SqYds',
      'Facing',
      'Customer Name',
      'Phone Number',
      'Email',
      'Booking Date',
      'Advance Amount (INR)',
      'Payment Status',
      'Plot Status',
      'Notes'
    ];

    const rows = bookings.map(p => [
      p.plotNumber,
      p.areaSqYds,
      p.facing,
      `"${(p.customerName || '').replace(/"/g, '""')}"`,
      `"${p.customerPhone || ''}"`,
      `"${p.customerEmail || ''}"`,
      p.bookingDate ? p.bookingDate.split('T')[0] : '',
      p.bookingAmount || 0,
      p.paymentStatus || 'token_paid',
      p.status,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skandha_booking_details_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              Booking Details
            </h1>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
              {stats.total} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customer plot bookings, advance token records, buyer contact information, and registration tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Download CSV report of all bookings"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openNewBookingModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book Plot for Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Booked</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Out of 96 total plots</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Advance Collected</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{(stats.totalAdvance / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
            ₹{stats.totalAdvance.toLocaleString()} total
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fully Paid / Registered</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.fullyPaid}</div>
          <div className="text-[11px] text-blue-600 mt-0.5 font-medium">Registrations completed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Token Advance</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.tokenPaid}</div>
          <div className="text-[11px] text-amber-600 mt-0.5 font-medium">Awaiting final payment</div>
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

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[260px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer Name, Phone, Email, or Plot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none font-medium"
          >
            <option value="">All Payment Statuses</option>
            <option value="token_paid">Token Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="unpaid">Unpaid / In Discussion</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{bookings.length}</strong> booked plots
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-5 py-3.5">Plot No</th>
                <th className="px-5 py-3.5 min-w-[200px]">Customer / Buyer Name</th>
                <th className="px-5 py-3.5">Phone Number</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Booking Date</th>
                <th className="px-5 py-3.5">Token / Advance Paid</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">Loading booking details...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    <div className="space-y-2">
                      <p>No bookings found matching filters.</p>
                      <button
                        onClick={openNewBookingModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Book a Plot for Customer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map(b => {
                  const paymentBadge =
                    b.paymentStatus === 'fully_paid' || b.status === 'sold'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : b.paymentStatus === 'partially_paid'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                  return (
                    <tr key={b.plotNumber} className="hover:bg-slate-50/80 transition-colors">
                      {/* Plot & Dimensions */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">
                          Plot {b.plotNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.areaSqYds} yd² • {b.facing}
                        </div>
                        {b.isCorner && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Corner
                          </span>
                        )}
                      </td>

                      {/* Customer Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{b.customerName || '(Name Not Recorded)'}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5">
                        {b.customerPhone ? (
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-brand-orange underline underline-offset-2 decoration-slate-300"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{b.customerPhone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5">
                        {b.customerEmail ? (
                          <a
                            href={`mailto:${b.customerEmail}`}
                            className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-brand-orange"
                            title="Send email"
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{b.customerEmail}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Booking Date */}
                      <td className="px-5 py-3.5">
                        {b.bookingDate ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{b.bookingDate.split('T')[0]}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Token Amount */}
                      <td className="px-5 py-3.5">
                        {b.bookingAmount ? (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            ₹{Number(b.bookingAmount).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">₹0</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${paymentBadge}`}>
                          {(b.paymentStatus || 'token_paid').replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Booking */}
                          <button
                            onClick={() => openEditBookingModal(b)}
                            className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700 hover:text-amber-900 transition-colors"
                            title="Edit Booking Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Release Booking */}
                          <button
                            onClick={() => setReleaseTarget(b)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Release Booking"
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
      </div>

      {/* Book / Edit Booking Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  <span>{editingPlot ? `Edit Booking - Plot ${editingPlot.plotNumber}` : 'Book Plot for Customer'}</span>
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

            <form onSubmit={handleSaveBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Plot Number *</label>
                <select
                  required
                  disabled={!!editingPlot}
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
                  {allPlots.map(p => (
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
                  <label className="block font-bold text-slate-700 mb-1">Token / Advance Paid (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250000"
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
                  {editingPlot ? 'Save Changes' : 'Confirm & Book Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Release Booking Confirmation Modal */}
      {releaseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Release Plot Booking</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to release the booking for <strong>Plot {releaseTarget.plotNumber}</strong> ({releaseTarget.customerName || 'Customer'})? The plot status will revert back to <strong>Available</strong>.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReleaseTarget(null)}
                className="flex-1 py-2 text-xs font-bold border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseBooking}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
