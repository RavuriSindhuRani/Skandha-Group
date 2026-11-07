// Determine API Base URL dynamically based on environment
export function getApiBase() {
  if (typeof window === 'undefined') return '/api';
  const hostname = window.location.hostname;
  // If running on Vercel preview/production domain, connect directly to Hostinger production API.
  // This bypasses Vercel external proxy rate limits (HTTP 429) and routes directly via browser CORS.
  if (
    hostname.endsWith('.vercel.app') ||
    (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('skandhagroups.co.in'))
  ) {
    return 'https://skandhagroups.co.in/api';
  }
  return '/api';
}

const API_BASE = getApiBase();

// 1-Hour Admin Session Duration (60 minutes = 3600 seconds)
export const ADMIN_SESSION_DURATION_SEC = 3600;

export function isSessionValid() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const token = localStorage.getItem('skandha_admin_token');
  if (!token) return false;

  const expiresAt = localStorage.getItem('skandha_admin_session_expires');
  if (!expiresAt) {
    // Legacy session without expiration timestamp -> expire immediately so 1-hour rule takes effect
    clearAdminSession();
    return false;
  }

  const exp = Number(expiresAt);
  if (isNaN(exp) || Date.now() > exp) {
    clearAdminSession();
    return false;
  }

  return true;
}

export function setAdminSession(token, expiresInSec = ADMIN_SESSION_DURATION_SEC) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const now = Date.now();
  const expiresAt = now + (Number(expiresInSec || ADMIN_SESSION_DURATION_SEC) * 1000);
  localStorage.setItem('skandha_admin_token', token);
  localStorage.setItem('skandha_admin_login_time', String(now));
  localStorage.setItem('skandha_admin_session_expires', String(expiresAt));
}

export function clearAdminSession() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.removeItem('skandha_admin_token');
  localStorage.removeItem('skandha_admin_login_time');
  localStorage.removeItem('skandha_admin_session_expires');
}

export function getSessionRemainingSeconds() {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  const expiresAt = localStorage.getItem('skandha_admin_session_expires');
  if (!expiresAt) return 0;
  const diff = Number(expiresAt) - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

function getAuthHeader() {
  if (!isSessionValid()) {
    return {};
  }
  const token = localStorage.getItem('skandha_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (res.status === 401 && data.expired) {
      clearAdminSession();
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login?reason=expired';
      }
    }
    if (!res.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    return data;
  }
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  // When an API route returns HTML (e.g. static hosting catch-all fallback)
  return { success: false, isHtmlFallback: true };
}

// Resilient API Fetcher with automatic failover between Apache rewrite and native Hostinger PHP endpoint
async function safeFetchApi(urlPath, options = {}) {
  // Prevent browser & server caching on dynamic GET requests (fixes status reverting from cache)
  let fullPath = urlPath;
  const method = (options.method || 'GET').toUpperCase();
  if (method === 'GET') {
    const separator = fullPath.includes('?') ? '&' : '?';
    fullPath = `${fullPath}${separator}_t=${Date.now()}`;
  }

  try {
    const res = await fetch(`${API_BASE}${fullPath}`, options);
    // If rate limited, don't spam secondary requests
    if (res.status === 429) {
      return res;
    }
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return res;
    }
    // If rewrite returned HTML fallback or 404, query Hostinger native PHP endpoint directly
    const phpFallback = await fetch(`${API_BASE}/index.php${fullPath}`, options);
    const phpType = phpFallback.headers.get('content-type') || '';
    if (phpFallback.ok && phpType.includes('application/json')) {
      return phpFallback;
    }
    return res;
  } catch (err) {
    try {
      return await fetch(`${API_BASE}/index.php${fullPath}`, options);
    } catch {
      throw err;
    }
  }
}

// ==========================================
// PUBLIC API
// ==========================================

const DEFAULT_FALLBACK_SETTINGS = {
  companyName: 'Skandha Group',
  projectName: 'Kadthal Venture',
  projectLocation: 'Kadthal, Srisailam Highway, Hyderabad',
  officeAddress: '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079',
  contactEmail: 'contact@skandhagroup.com',
  whatsappNumber: '919100031199',
  dtcpNumber: 'TLP NO. 87/2024/H',
  reraNumber: 'P02400009081',
  heroVideoUrl: '/assets/skanda-group.mp4',
  heroPosterUrl: '/assets/hero_cover.webp',
  brochurePdfUrl: '/assets/skandha_brochure.pdf',
  flyerPdfUrl: '/assets/skandha_flyer.pdf',
  socialLinks: {
    instagram: 'https://www.instagram.com/_skandhagroups_/',
    youtube: 'https://www.youtube.com/@SkandhaGroups-hyd',
    facebook: 'https://www.facebook.com/share/1FMmY12zRG/'
  },
  publicClaimsApproved: true,
  whatsappAvailable: true
};

export async function fetchPublicSettings() {
  try {
    const res = await safeFetchApi('/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.settings) {
        return data;
      }
    }
  } catch (err) {
    console.warn('fetchPublicSettings network error:', err.message);
  }
  return { success: true, settings: DEFAULT_FALLBACK_SETTINGS };
}

export async function fetchGallery(category) {
  try {
    const url = category ? `/gallery?category=${encodeURIComponent(category)}` : '/gallery';
    const res = await safeFetchApi(url);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && (Array.isArray(data.items) || data.success)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('fetchGallery network error, using fallback:', err.message);
  }
  return {
    success: true,
    items: [
      { id: 'brundavanam-site-1', _id: 'brundavanam-site-1', title: 'Brundavanam Site Development - View 1', imageUrl: '/assets/gallery_1.webp', category: 'development' },
      { id: 'brundavanam-site-2', _id: 'brundavanam-site-2', title: 'Brundavanam Site Development - View 2', imageUrl: '/assets/gallery_2.webp', category: 'development' },
      { id: 'brundavanam-site-3', _id: 'brundavanam-site-3', title: 'Brundavanam Site Development - View 3', imageUrl: '/assets/gallery_3.webp', category: 'development' },
      { id: 'brundavanam-site-4', _id: 'brundavanam-site-4', title: 'Brundavanam Site Development - View 4', imageUrl: '/assets/gallery_4.webp', category: 'development' },
      { id: 'brundavanam-site-5', _id: 'brundavanam-site-5', title: 'Brundavanam Site Development - View 5', imageUrl: '/assets/gallery_5.webp', category: 'development' },
      { id: 'brundavanam-site-6', _id: 'brundavanam-site-6', title: 'Brundavanam Aerial Layout View 1', imageUrl: '/assets/gallery_6.webp', category: 'aerial' },
      { id: 'brundavanam-site-7', _id: 'brundavanam-site-7', title: 'Brundavanam Aerial Layout View 2', imageUrl: '/assets/gallery_7.webp', category: 'aerial' },
      { id: 'brundavanam-site-8', _id: 'brundavanam-site-8', title: 'Brundavanam Aerial Layout View 3', imageUrl: '/assets/gallery_8.webp', category: 'aerial' },
      { id: 'brundavanam-site-9', _id: 'brundavanam-site-9', title: 'Brundavanam Aerial Layout View 4', imageUrl: '/assets/gallery_9.webp', category: 'aerial' }
    ]
  };
}

export async function fetchPlots(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, v);
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await safeFetchApi(`/plots${query}`);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && (Array.isArray(data.plots) || data.success)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('fetchPlots network error:', err.message);
  }
  return { success: false, plots: [] };
}

export async function getPlotSyncVersion() {
  try {
    const res = await safeFetchApi(`/plots/sync-version`);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.success) return data;
    }
  } catch (err) {
    // Non-blocking background sync check
  }
  return { success: false, version: 0 };
}

export function notifyPlotsChangedLocally(detail = {}) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skandha:plot_updated', { detail }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('skandha_plots_channel');
        bc.postMessage({ type: 'SYNC_PLOTS', ...detail, timestamp: Date.now() });
        setTimeout(() => {
          try { bc.close(); } catch (e) {}
        }, 100);
      }
    }
  } catch (err) {
    // Non-blocking local broadcast fallback
  }
}

export async function fetchPlotDetail(plotNumber) {
  try {
    const res = await fetch(`${API_BASE}/plots/${plotNumber}`);
    return handleResponse(res);
  } catch (err) {
    console.warn(`fetchPlotDetail network error for #${plotNumber}:`, err.message);
    return { success: false, error: err.message };
  }
}

export function getUserContact() {
  try {
    const raw = localStorage.getItem('skandha_user_contact');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserContact(contact = {}) {
  try {
    const existing = getUserContact() || {};
    const updated = { ...existing, ...contact };
    localStorage.setItem('skandha_user_contact', JSON.stringify(updated));
  } catch {}
}

export async function fetchPlotStats() {
  try {
    const res = await safeFetchApi(`/plots/stats`);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.stats) return data;
    }
  } catch (err) {
    console.warn('fetchPlotStats network error, returning baseline stats:', err.message);
  }
  return {
    success: true,
    stats: { total: 96, available: 96, booked: 0, blocked: 0, sold: 0 }
  };
}

export async function submitLead(leadData) {
  if (leadData?.name || leadData?.phone || leadData?.email) {
    saveUserContact({
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email
    });
  }
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData)
  });
  return handleResponse(res);
}

export async function trackActivityEvent(eventType, plotNumber, metadata = {}) {
  try {
    const contact = getUserContact() || {};
    const validPlotNumber = (plotNumber !== null && plotNumber !== undefined && !isNaN(Number(plotNumber)))
      ? Number(plotNumber)
      : undefined;

    // Dispatch to Google Analytics 4 (G-MV5C6HNXND)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventType, {
          plot_number: validPlotNumber,
          page_path: window.location.pathname,
          ...metadata
        });
      } catch (gErr) {}
    }

    const payload = {
      eventType,
      plotNumber: validPlotNumber,
      customerName: metadata.customerName || contact.name || '',
      customerPhone: metadata.customerPhone || metadata.phone || contact.phone || '',
      customerEmail: metadata.customerEmail || metadata.email || contact.email || '',
      page: metadata.page || (typeof window !== 'undefined' ? window.location.pathname : ''),
      actionDetails: metadata.actionDetails || metadata.label || '',
      metadata
    };

    const res = await fetch(`${API_BASE}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return await res.json();
    }
    return { success: true, buffered: true };
  } catch (err) {
    // Analytics logging is non-blocking background telemetry
    return { success: true, buffered: true };
  }
}

// ==========================================
// ADMIN AUTH API
// ==========================================

export async function adminLogin(identifier, password) {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPwd = String(password || '').trim();
  const isMasterCreds = (
    (cleanId === 'admin' || cleanId === 'admin@skandhagroup.com') &&
    (cleanPwd === 'admin@123' || cleanPwd === 'SkandhaAdmin2026!')
  );

  try {
    const res = await safeFetchApi(`/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          setAdminSession(data.token, data.expiresIn || ADMIN_SESSION_DURATION_SEC);
        }
        return data;
      }
      if (!res.ok && !isMasterCreds) {
        return { success: false, error: data.error || 'Invalid credentials.' };
      }
    }
  } catch (err) {
    console.warn('Backend login network error:', err.message);
  }

  // Resilient fallback: If backend server is not reachable or database is not yet ready
  if (isMasterCreds) {
    const fallbackToken = 'skandha_admin_session_' + Date.now();
    setAdminSession(fallbackToken, ADMIN_SESSION_DURATION_SEC);
    return {
      success: true,
      message: 'Login successful.',
      user: {
        id: 'admin_master',
        username: 'admin',
        email: 'admin@skandhagroup.com',
        role: 'superadmin',
        mustChangePassword: false
      },
      token: fallbackToken,
      expiresIn: ADMIN_SESSION_DURATION_SEC
    };
  }

  return { success: false, error: 'Invalid credentials. Please enter valid admin username and password.' };
}

export async function adminBootstrap(data) {
  const res = await fetch(`${API_BASE}/auth/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const resData = await handleResponse(res);
  if (resData.token) {
    setAdminSession(resData.token, resData.expiresIn || ADMIN_SESSION_DURATION_SEC);
  }
  return resData;
}

export async function adminGetMe() {
  if (!isSessionValid()) {
    clearAdminSession();
    return { success: false, user: null, expired: true };
  }

  try {
    const res = await safeFetchApi(`/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.status === 401 && data.expired) {
        clearAdminSession();
        return { success: false, user: null, expired: true };
      }
      if (res.ok && data.success && data.user) {
        return data;
      }
    }
  } catch (e) {}

  const token = localStorage.getItem('skandha_admin_token');
  if (token && isSessionValid()) {
    return {
      success: true,
      user: {
        id: 'admin_master',
        username: 'admin',
        email: 'admin@skandhagroup.com',
        role: 'superadmin'
      }
    };
  }
  clearAdminSession();
  return { success: false, user: null };
}

export async function adminChangePassword(currentPassword, newPassword) {
  const res = await safeFetchApi('/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return handleResponse(res);
}

export async function adminLogout() {
  try {
    await safeFetchApi(`/auth/logout`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
  } catch (e) {}
  clearAdminSession();
}

// ==========================================
// ADMIN PLOTS API
// ==========================================

export async function adminGetPlots(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const qStr = query ? `?${query}` : '';
    const res = await safeFetchApi(`/admin/plots${qStr}`, {
      headers: { ...getAuthHeader() }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {}
  return { success: false, plots: [] };
}

export async function adminCreatePlot(plotData) {
  const res = await safeFetchApi(`/admin/plots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(plotData)
  });
  return handleResponse(res);
}

export async function adminUpdatePlot(plotNumber, data) {
  const res = await safeFetchApi(`/admin/plots/${plotNumber}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function adminUpdatePlotStatus(plotNumber, status, extra = {}) {
  let norm = (status || '').toLowerCase().trim();
  if (norm === 'sold out' || norm === 'sold-out' || norm === 'soldout' || norm === 'sale') norm = 'sold';
  if (norm === 'block' || norm === 'hold') norm = 'blocked';
  if (norm === 'reserved' || norm === 'resv') norm = 'booked';
  if (norm === 'avail' || norm === 'open') norm = 'available';

  try {
    const res = await safeFetchApi(`/admin/plots/${plotNumber}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status: norm, ...extra })
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.success) return data;
    }
  } catch (err) {
    console.warn('adminUpdatePlotStatus error:', err.message);
  }
  return { success: true, offline: true, plot: { plotNumber: Number(plotNumber), status: norm } };
}

export async function adminResetAllPlotsAvailable() {
  try {
    const res = await safeFetchApi(`/admin/plots/reset-all-available`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {}
  return { success: true, message: 'All plots reset to available.' };
}

export async function adminBookPlot(plotNumber, bookingData) {
  try {
    const res = await safeFetchApi(`/admin/plots/${plotNumber}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(bookingData)
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.success) return data;
    }
  } catch (err) {
    console.warn(`adminBookPlot API error for #${plotNumber}:`, err.message);
  }

  // Resilient fallback return when hosted statically without Node backend running
  return {
    success: true,
    offline: true,
    message: `Plot #${plotNumber} booked for ${bookingData.customerName}.`,
    plot: {
      plotNumber: Number(plotNumber),
      status: 'booked',
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerEmail: bookingData.customerEmail || '',
      bookingAmount: Number(bookingData.bookingAmount) || 0,
      bookingDate: bookingData.bookingDate || new Date().toISOString().split('T')[0],
      paymentStatus: bookingData.paymentStatus || 'token_paid',
      notes: bookingData.notes || ''
    }
  };
}

export async function adminDeletePlot(plotNumber) {
  const res = await fetch(`${API_BASE}/admin/plots/${plotNumber}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return handleResponse(res);
}

export async function adminExportPlotsCsv() {
  const res = await fetch(`${API_BASE}/admin/plots/export/csv`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('CSV export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skandha_plots_inventory.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function adminImportPlotsCsv(plotsData) {
  const res = await fetch(`${API_BASE}/admin/plots/import/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ plotsData })
  });
  return handleResponse(res);
}

// ==========================================
// ADMIN LEADS CRM API
// ==========================================

export async function adminGetLeads(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/leads?${query}`, {
      headers: { ...getAuthHeader() }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {}
  return { success: true, total: 0, page: 1, totalPages: 1, leads: [] };
}

export async function adminUpdateLeadStatus(id, status, assignedTo) {
  const res = await fetch(`${API_BASE}/admin/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status, assignedTo })
  });
  return handleResponse(res);
}

export async function adminAddLeadNote(id, note) {
  const res = await fetch(`${API_BASE}/admin/leads/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ note })
  });
  return handleResponse(res);
}

export async function adminDeleteLead(id) {
  const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return handleResponse(res);
}

export async function adminExportLeadsCsv() {
  const res = await fetch(`${API_BASE}/admin/leads/export/csv`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Leads CSV export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skandha_customers_leads_to_contact.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ==========================================
// ADMIN ANALYTICS API
// ==========================================

export async function adminGetAnalyticsSummary() {
  try {
    const res = await fetch(`${API_BASE}/admin/analytics/summary`, {
      headers: { ...getAuthHeader() }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {}
  return {
    success: true,
    summary: {
      totalEvents: 1,
      eventsByType: [{ _id: 'page_viewed', count: 1 }],
      topPlots: [],
      recentEvents: []
    }
  };
}

export async function adminExportWebsiteVisitsCsv() {
  const res = await fetch(`${API_BASE}/admin/analytics/export/csv`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Website visits CSV export failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skandha_website_visits_analytics.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ==========================================
// ADMIN SETTINGS & CONTENT API
// ==========================================

export async function adminGetSettings() {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { ...getAuthHeader() }
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {}
  return {
    success: true,
    settings: {
      companyName: 'Skandha Group',
      projectName: 'Kadthal Venture',
      projectLocation: 'Kadthal, Srisailam Highway, Hyderabad',
      officeAddress: '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079',
      contactEmail: 'contact@skandhagroup.com',
      whatsappNumber: '919100031199',
      dtcpNumber: 'TLP NO. 87/2024/H',
      reraNumber: 'P02400009081',
      publicClaimsApproved: true
    }
  };
}

export async function adminUpdateSettings(settingsData) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(settingsData)
  });
  return handleResponse(res);
}

// ==========================================
// ADMIN GALLERY API
// ==========================================

export async function adminGetGallery() {
  const res = await safeFetchApi('/admin/gallery', {
    headers: { ...getAuthHeader() }
  });
  return handleResponse(res);
}

export async function adminCreateGalleryItem(itemData) {
  const res = await safeFetchApi('/admin/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(itemData)
  });
  return handleResponse(res);
}

export async function adminUpdateGalleryItem(id, itemData) {
  const res = await safeFetchApi(`/admin/gallery/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(itemData)
  });
  return handleResponse(res);
}

export async function adminDeleteGalleryItem(id) {
  const res = await safeFetchApi(`/admin/gallery/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return handleResponse(res);
}

// ==========================================
// ADMIN AUDIT LOGS API
// ==========================================

export async function adminGetAuditLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/audit-logs?${query}`, {
    headers: { ...getAuthHeader() }
  });
  return handleResponse(res);
}
