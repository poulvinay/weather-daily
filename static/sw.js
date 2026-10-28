const CACHE_NAME = 'weather-dashboard-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/static/style.css',
  '/static/js/config.js',
  '/static/js/utils.js',
  '/static/js/theme.js',
  '/static/js/map_service.js',
  '/static/js/chart_service.js',
  '/static/js/weather_api.js',
  '/static/js/weather_ui.js',
  '/static/js/app.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css',
  'https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.error("Cache addAll failed:", err);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle Mapbox events/telemetry with a silent 204 response
  if (event.request.url.includes('events.mapbox.com')) {
    event.respondWith(new Response(null, { status: 204, statusText: 'No Content' }));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request).then((response) => {
        if (response) return response;
        return new Response('The dashboard is unavailable offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(err => {
        // Silently handle fetch failures for background assets
        if (event.request.mode === 'navigate') {
          // Could return a fallback offline page here if needed
        }
        return null;
      });
    })
  );
});
