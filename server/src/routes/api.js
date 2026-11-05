import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { loginLimiter, leadSubmissionLimiter, analyticsLimiter } from '../middleware/rateLimiter.js';
import { validateLeadSubmission, validatePlotInput } from '../middleware/validator.js';

import * as authCtrl from '../controllers/authController.js';
import * as plotCtrl from '../controllers/plotController.js';
import * as leadCtrl from '../controllers/leadController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import * as settingsCtrl from '../controllers/settingsController.js';
import * as galleryCtrl from '../controllers/galleryController.js';
import * as auditCtrl from '../controllers/auditController.js';

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

// Settings & Project Metadata
router.get('/settings', settingsCtrl.getPublicSettings);

// Gallery
router.get('/gallery', galleryCtrl.getPublicGallery);

// Plots (Master plan & visualizer)
router.get('/plots/sync-version', plotCtrl.getPlotSyncVersion);
router.get('/plots', plotCtrl.getPlots);
router.get('/plots/stats', plotCtrl.getPlotStats);
router.get('/plots/:plotNumber', plotCtrl.getPlotDetail);

// In-memory tile cache to serve repeat requests instantly
const tileCache = new Map();

// Clean Watermark-Free Map Tile Proxy (Google Maps & OpenStreetMap, Zero API Key Required)
router.get('/tiles/:z/:x/:y.png', async (req, res) => {
  const { z, x, y } = req.params;
  const type = req.query.type || 'google';
  const cacheKey = `${type}_${z}_${x}_${y}`;

  if (tileCache.has(cacheKey)) {
    const cached = tileCache.get(cacheKey);
    res.set({
      'Content-Type': cached.contentType,
      'Cache-Control': 'public, max-age=604800, immutable',
      'Access-Control-Allow-Origin': '*'
    });
    return res.send(cached.buffer);
  }

  const urlsToTry = [];
  if (type === 'hybrid' || type === 'satellite') {
    urlsToTry.push(`https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`);
    urlsToTry.push(`https://mt2.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`);
  } else {
    // Default: Google Maps Roadmap (matches 2D view exactly)
    urlsToTry.push(`https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`);
    urlsToTry.push(`https://mt2.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`);
    urlsToTry.push(`https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`);
  }

  for (const tileUrl of urlsToTry) {
    try {
      const response = await fetch(tileUrl, {
        signal: AbortSignal.timeout(3000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/png';

        if (tileCache.size < 500) {
          tileCache.set(cacheKey, { buffer, contentType });
        }

        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800, immutable',
          'Access-Control-Allow-Origin': '*'
        });
        return res.send(buffer);
      }
    } catch {
      // Continue to next mirror
    }
  }

  res.status(500).send('Tile fetch error');
});

// Leads & Enquiry Capture
router.post('/leads', leadSubmissionLimiter, validateLeadSubmission, leadCtrl.submitLead);

// Analytics ingestion
router.post('/analytics/events', analyticsLimiter, analyticsCtrl.ingestEvent);

// Admin Auth (Public Login & One-time bootstrap)
router.post('/auth/bootstrap', authCtrl.bootstrapAdmin);
router.post('/auth/login', loginLimiter, authCtrl.login);
router.post('/auth/logout', authCtrl.logout);

// ==========================================
// 2. PROTECTED ADMIN ROUTES (Require Auth)
// ==========================================
router.use('/admin', authenticate);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.post('/auth/change-password', authenticate, authCtrl.changePassword);

// Admin Site Settings
router.get('/admin/settings', settingsCtrl.getAdminSettings);
router.put('/admin/settings', settingsCtrl.updateSettings);

// Admin Plots CRUD & Inventory Management
router.get('/admin/plots/sync-version', plotCtrl.getPlotSyncVersion);
router.get('/admin/plots', plotCtrl.getPlots);
router.post('/admin/plots', validatePlotInput, plotCtrl.createPlot);
router.post('/admin/plots/reset-all-available', plotCtrl.resetAllPlotsAvailable);
router.put('/admin/plots/:plotNumber', plotCtrl.updatePlot);
router.post('/admin/plots/:plotNumber', plotCtrl.updatePlot);
router.patch('/admin/plots/:plotNumber/status', plotCtrl.updatePlotStatus);
router.post('/admin/plots/:plotNumber/status', plotCtrl.updatePlotStatus);
router.post('/admin/plots/:plotNumber/book', plotCtrl.bookPlot);
router.delete('/admin/plots/:plotNumber', plotCtrl.deletePlot);
router.get('/admin/plots/export/csv', plotCtrl.exportPlotsCsv);
router.post('/admin/plots/import/csv', plotCtrl.importPlotsCsv);

// Admin Leads CRM
router.get('/admin/leads', leadCtrl.getLeads);
router.patch('/admin/leads/:id/status', leadCtrl.updateLeadStatus);
router.post('/admin/leads/:id/notes', leadCtrl.addFollowUpNote);
router.delete('/admin/leads/:id', leadCtrl.deleteLead);
router.get('/admin/leads/export/csv', leadCtrl.exportLeadsCsv);

// Admin Analytics & Activity
router.get('/admin/analytics', analyticsCtrl.getAnalyticsSummary);
router.get('/admin/analytics/summary', analyticsCtrl.getAnalyticsSummary);
router.get('/admin/analytics/export', analyticsCtrl.exportWebsiteVisitsCsv);
router.get('/admin/analytics/export/csv', analyticsCtrl.exportWebsiteVisitsCsv);

// Admin Gallery Management
router.get('/admin/gallery', galleryCtrl.getAdminGallery);
router.post('/admin/gallery', galleryCtrl.createGalleryItem);
router.put('/admin/gallery/:id', galleryCtrl.updateGalleryItem);
router.delete('/admin/gallery/:id', galleryCtrl.deleteGalleryItem);

// Admin Audit Logs
router.get('/admin/audit-logs', auditCtrl.getAuditLogs);

export default router;
