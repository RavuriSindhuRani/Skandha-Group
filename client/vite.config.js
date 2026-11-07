import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPA_ROUTES = [
  'plots',
  'project',
  'gallery',
  'about',
  'contact',
  'admin',
  'admin/login',
  'admin/plots',
  'admin/bookings',
  'admin/leads',
  'admin/analytics',
  'admin/settings',
  'admin/gallery',
  'admin/audit'
];

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-generator',
    closeBundle() {
      const clientDist = path.resolve(__dirname, 'dist');
      const rootDist = path.resolve(__dirname, '../dist');

      if (!fs.existsSync(clientDist)) return;

      // 1. Generate 404.html fallback
      const indexPath = path.join(clientDist, 'index.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, path.join(clientDist, '404.html'));

        // 2. Generate static route index.html entries so direct links and refreshes never 404
        for (const route of SPA_ROUTES) {
          const routeDir = path.join(clientDist, route);
          fs.mkdirSync(routeDir, { recursive: true });
          fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'));
        }
      }

      // 3. Keep fallback aliases for stale browser caches
      const assetsDir = path.join(clientDist, 'assets');
      if (fs.existsSync(assetsDir)) {
        const jsFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
        if (jsFiles.length > 0) {
          const primaryJs = jsFiles[0];
          fs.copyFileSync(path.join(assetsDir, primaryJs), path.join(assetsDir, 'index.js'));
          const legacyHashes = [
            'CayEv3ld', 'CdreyRzx', 'CSawY9_H', 'B_rC3Qaa', 'xtqlYRNn',
            'socn1bQz', 'oXh9TeoX', 'NFkrZg_E', 'kPnp6_34', 'DzHvNs81',
            'DttC5tDB', 'dobv-cJ-', 'Cx2KKVk7', 'CTWyxgkm', 'Ct11A9ly',
            'CM9lGP06', 'CADMRwOb', 'C23o8Euh', 'C0siNuOm', 'BPUSLZWY',
            'BOP0G6E2', 'BNlgCITG', 'BIwxIlhd', 'BCN0f8IJ', 'B4atAs52',
            'B1SeSEz8', 'AUDPwTrG', '2V6AuZ1t'
          ];
          for (const h of legacyHashes) {
            try {
              fs.copyFileSync(path.join(assetsDir, primaryJs), path.join(assetsDir, `index-${h}.js`));
            } catch (e) {}
          }
        }
      }

      // 4. Synchronize all generated files to root dist directory (for Hostinger package-dist.ps1)
      try {
        fs.cpSync(clientDist, rootDist, { recursive: true });
        const clientPublic = path.resolve(__dirname, 'public');
        if (fs.existsSync(path.join(clientPublic, '.htaccess'))) {
          fs.copyFileSync(path.join(clientPublic, '.htaccess'), path.join(rootDist, '.htaccess'));
        }
        if (fs.existsSync(path.join(clientPublic, 'api'))) {
          fs.cpSync(path.join(clientPublic, 'api'), path.join(rootDist, 'api'), { recursive: true });
        }
      } catch (err) {
        console.warn('[spaFallbackPlugin] Notice on sync:', err.message);
      }

      console.log(`[spaFallbackPlugin] Generated 404.html, asset aliases, route entries, and synchronized dist.`);
    }
  };
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-leaflet': ['leaflet'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
