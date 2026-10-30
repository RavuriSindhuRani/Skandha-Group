import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Users,
  Activity,
  ArrowRight,
  Download,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Compass,
  Box
} from 'lucide-react';
import {
  fetchPlotStats,
  adminGetLeads,
  adminGetAnalyticsSummary,
  adminExportLeadsCsv,
  adminExportPlotsCsv,
  adminExportWebsiteVisitsCsv,
  getPlotSyncVersion
} from '../../api/client';

export default function AdminDashboard() {
  const [plotStats, setPlotStats] = useState(null);
  const [leadsData, setLeadsData] = useState({ total: 0, leads: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [statsRes, leadsRes, analyticsRes] = await Promise.all([
        fetchPlotStats(),
        adminGetLeads({ limit: 5 }),
        adminGetAnalyticsSummary()
      ]);

      if (statsRes.success) setPlotStats(statsRes.stats);
      if (leadsRes.success) setLeadsData(leadsRes);
      if (analyticsRes.success) setAnalytics(analyticsRes.summary);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Auto-sync dashboard KPI numbers every 4s
    let lastVersion = 0;
    const interval = setInterval(async () => {
      try {
        const syncRes = await getPlotSyncVersion();
        if (syncRes && syncRes.success && typeof syncRes.version === 'number') {
          if (lastVersion === 0) {
            lastVersion = syncRes.version;
          } else if (syncRes.version > lastVersion) {
            lastVersion = syncRes.version;
            loadData();
          }
        }
      } catch (e) {}
    }, 4000);

    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('skandha:plot_updated', loadData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('skandha:plot_updated', loadData);
    };
  }, []);

  const total = plotStats?.total || 96;
  const available = plotStats?.available ?? 96;
  const booked = plotStats?.booked ?? 0;
  const blocked = plotStats?.blocked ?? 0;
  const sold = plotStats?.sold ?? 0;

  const soldPercent = Math.round((sold / total) * 100);
  const availablePercent = Math.round((available / total) * 100);
  const bookedPercent = Math.round((booked / total) * 100);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Skandha Group Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time project inventory, verified customer enquiries, and visitor analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => adminExportLeadsCsv()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
            title="Download verified leads and customer contact list"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Customers List to Contact</span>
          </button>
          <button
            onClick={() => adminExportWebsiteVisitsCsv()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Download website visitor events and activity report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Website Visits Report</span>
          </button>
          <button
            onClick={() => adminExportPlotsCsv()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Download plots layout inventory status"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Plots Inventory</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Layout Inventory</span>
            <Layers className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-500">96 Approved numbered plots</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Available for Booking</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{available}</div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {availablePercent}% of total inventory available
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Customer Enquiries</span>
            <Users className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{leadsData.total}</div>
          <div className="text-[11px] text-slate-500">Verified leads captured</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Layout Impressions</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-900">{analytics?.totalEvents || 0}</div>
          <div className="text-[11px] text-slate-500">Privacy-conscious events tracked</div>
        </div>
      </div>

      {/* Inventory Progress Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Inventory Distribution</h3>
            <p className="text-xs text-slate-500">Real-time status breakdown of Skandha Group plots</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/plots?view=2d"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive 2D Map</span>
            </Link>
            <Link
              to="/admin/plots?view=3d"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-orange border border-orange-200 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              <Box className="w-3.5 h-3.5 text-brand-orange" />
              <span>3D Master Plan</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Available ({available})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> Booked ({booked})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400" /> Blocked ({blocked})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500" /> Sold Out ({sold})</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          <div style={{ width: `${(available / total) * 100}%` }} className="bg-emerald-500" title={`Available: ${available}`} />
          <div style={{ width: `${(booked / total) * 100}%` }} className="bg-amber-400" title={`Booked: ${booked}`} />
          <div style={{ width: `${(blocked / total) * 100}%` }} className="bg-sky-400" title={`Blocked: ${blocked}`} />
          <div style={{ width: `${(sold / total) * 100}%` }} className="bg-rose-500" title={`Sold Out: ${sold}`} />
        </div>
      </div>

      {/* Grid: Recent Leads & Top Viewed Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Customer Leads</h3>
              <p className="text-xs text-slate-500">Latest submissions awaiting follow-up</p>
            </div>
            <Link to="/admin/leads" className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1">
              <span>View All Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {leadsData.leads.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No customer enquiries logged yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leadsData.leads.map(lead => (
                <div key={lead._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.email} &bull; {lead.preferredContactMethod}</div>
                    {lead.plotNumber && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        Inquired for Plot #{lead.plotNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {lead.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Viewed Plots */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Most Viewed Plots</h3>
              <p className="text-xs text-slate-500">Highest interest based on clicks</p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1">
              <span>Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!analytics?.topPlots || analytics.topPlots.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No plot view clicks recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {analytics.topPlots.slice(0, 5).map(item => (
                <div key={item._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-orange-100 text-brand-orange font-bold text-xs flex items-center justify-center">
                      #{item._id}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Plot #{item._id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>{item.views}</strong> views</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/plots"
              target="_blank"
              className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Compass className="w-4 h-4 text-brand-orange" />
              <span>Open Public 2D/3D Master Plan</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
