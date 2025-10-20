// Service Worker for Bethlehem Medical Center - Offline Support
// Critical for medical centers - internet can fail
// Offline data access for medical staff
// Cached patient information
// Better reliability

const CACHE_NAME = 'bethlehem-medical-v20';
const OFFLINE_CACHE_NAME = 'bethlehem-medical-offline-v20';
const API_CACHE_NAME = 'bethlehem-medical-api-v20';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/main.tsx',
    '/favicon.svg',
    '/manifest.json',
    '/offline.html'
];

// API endpoints that should be cached for offline access
const CACHEABLE_API_PATTERNS = [
    '/api/users',
    '/api/patients',
    '/api/appointments',
    '/api/doctors',
    '/api/clinics',
    '/api/patient-health',
    '/api/payments',
    '/api/auth',
    '/api/login'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    console.log('🏥 Service Worker installing for Bethlehem Medical Center');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching critical medical resources');
                // Try to cache each resource individually to avoid failing on missing files
                return Promise.allSettled(
                    CRITICAL_RESOURCES.map(resource =>
                        cache.add(resource).catch(err => {
                            console.warn(`⚠️ Failed to cache ${resource}:`, err);
                            return null;
                        })
                    )
                );
            })
            .then(() => {
                console.log('✅ Critical resources caching completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to cache critical resources:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🏥 Service Worker activating for Bethlehem Medical Center');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME &&
                            cacheName !== OFFLINE_CACHE_NAME &&
                            cacheName !== API_CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // For development mode, be more permissive with caching
    if (url.hostname === 'localhost') {
        event.respondWith(handleDevelopmentRequest(request));
        return;
    }

    // Handle API requests with network-first strategy
    if (isAPIRequest(url)) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle static assets with cache-first strategy
    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }

    // Handle navigation requests with network-first strategy
    if (isNavigationRequest(request)) {
        event.respondWith(handleNavigationRequest(request));
        return;
    }
});

// Handle development requests (localhost)
async function handleDevelopmentRequest(request) {
    const url = new URL(request.url);

    try {
        // Try network first for development
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('🌐 Development network failed, trying cache:', request.url);

        // Try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('✅ Serving cached development file:', request.url);
            return cachedResponse;
        }

        // Special handling for Auth.tsx when offline
        if (url.pathname.includes('Auth.tsx')) {
            console.log('🔒 Offline Auth.tsx request - serving offline login fallback');
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Offline Login - Bethlehem Medical Center</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .title { text-align: center; color: #2563eb; margin-bottom: 20px; }
                        .message { text-align: center; color: #666; margin-bottom: 20px; }
                        .button { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
                        .button:hover { background: #1d4ed8; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="title">🏥 Offline Login</h1>
                        <p class="message">You are currently offline. Please check your internet connection and try again.</p>
                        <button class="button" onclick="window.location.reload()">Retry Connection</button>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // For Vite dev files, try to serve from cache or return minimal responses
        if (url.pathname.includes('@vite/client') ||
            url.pathname.includes('@react-refresh') ||
            url.pathname.includes('main.tsx') ||
            url.pathname.includes('App.tsx') ||
            url.pathname.includes('LanguageContext.tsx') ||
            url.pathname.includes('i18n.ts') ||
            url.pathname.includes('env.mjs')) {
            console.log('🔄 Handling Vite dev file:', request.url);

            // Try to serve from cache first
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log('✅ Serving cached Vite dev file:', request.url);
                return cachedResponse;
            }

            // Return minimal response to prevent errors
            return new Response('', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }

        // For manifest.json, return a basic manifest
        if (url.pathname.includes('manifest.json')) {
            console.log('🔄 Returning basic manifest for offline');
            return new Response(JSON.stringify({
                name: "Bethlehem Medical Center",
                short_name: "Bethlehem Med",
                start_url: "/",
                display: "standalone",
                background_color: "#ffffff",
                theme_color: "#3b82f6"
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // For navigation requests, try to serve index.html
        if (request.mode === 'navigate') {
            console.log('🔄 Handling navigation request:', request.url);

            // Try to serve index.html from cache
            const indexResponse = await caches.match('/index.html');
            if (indexResponse) {
                console.log('✅ Serving cached index.html');
                return indexResponse;
            }

            // Try to serve root path
            const rootResponse = await caches.match('/');
            if (rootResponse) {
                console.log('✅ Serving cached root path');
                return rootResponse;
            }

            // Return a basic HTML response for development
            console.log('🔄 Returning basic HTML for offline navigation');
            return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bethlehem Medical Center - Offline</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
              <h1>🏥 Bethlehem Medical Center</h1>
              <p>You are currently offline. Please check your internet connection.</p>
              <p>If you have cached data, try refreshing the page.</p>
            </div>
          </body>
        </html>
      `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        console.log('❌ Development file not available offline:', request.url);
        return new Response('Development file not available offline', { status: 404 });
    }
}

// Check if request is for API endpoint
function isAPIRequest(url) {
    return CACHEABLE_API_PATTERNS.some(pattern =>
        url.pathname.includes(pattern) ||
        url.pathname.startsWith('/api/')
    );
}

// Check if request is for static asset
function isStaticAsset(url) {
    return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
        url.pathname.includes('@vite') ||
        url.pathname.includes('@react-refresh') ||
        url.pathname.includes('main.tsx') ||
        url.pathname.includes('manifest.json');
}

// Check if request is navigation request
function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
    const url = new URL(request.url);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        // If successful, cache the response
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(request, networkResponse.clone());

            // Notify client that we're online
            notifyClients('online', { url: url.pathname });
        }

        return networkResponse;
    } catch (error) {
        console.log('🌐 Network failed, trying cache for:', url.pathname);

        // Network failed, try cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('✅ Serving from cache:', url.pathname);

            // Notify client that we're serving offline data
            notifyClients('offline', {
                url: url.pathname,
                cached: true,
                timestamp: new Date().toISOString()
            });

            return cachedResponse;
        }

        // No cache available, return offline page or error
        console.log('❌ No cache available for:', url.pathname);

        notifyClients('offline', {
            url: url.pathname,
            cached: false,
            error: 'No offline data available'
        });

        return new Response(
            JSON.stringify({
                error: 'Offline - No cached data available',
                offline: true,
                timestamp: new Date().toISOString()
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('✅ Serving cached static asset:', request.url);
            return cachedResponse;
        }

        // Cache miss, fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            console.log('💾 Cached static asset:', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.log('❌ Failed to fetch static asset:', request.url);

        // Try to serve from cache even if network failed
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('✅ Serving cached asset after network failure:', request.url);
            return cachedResponse;
        }

        // For Vite development files, try to serve a basic response
        if (request.url.includes('@vite/client') || request.url.includes('@react-refresh')) {
            console.log('🔄 Serving fallback for Vite dev file:', request.url);
            return new Response('// Vite dev file not available offline', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }

        // For main.tsx, try to serve index.html instead
        if (request.url.includes('main.tsx')) {
            const indexResponse = await caches.match('/index.html');
            if (indexResponse) {
                console.log('🔄 Serving index.html for main.tsx request');
                return indexResponse;
            }
        }

        return new Response('Asset not available offline', { status: 404 });
    }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('🌐 Network failed for navigation, trying cache...');

        // Network failed, try cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('✅ Serving cached navigation response');
            return cachedResponse;
        }

        // Try to serve index.html for any navigation request
        const indexResponse = await caches.match('/index.html');
        if (indexResponse) {
            console.log('✅ Serving cached index.html');
            return indexResponse;
        }

        // No cache, return offline page
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            console.log('✅ Serving offline page');
            return offlineResponse;
        }

        // Last resort - return a simple offline message
        return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Bethlehem Medical Center</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 500px; margin: 0 auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #3b82f6; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🏥</div>
            <h1>Bethlehem Medical Center</h1>
            <p>You're currently offline. Please check your internet connection and try again.</p>
            <p>Critical medical data may still be available from cache.</p>
          </div>
        </body>
      </html>
    `, {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Notify clients about connection status
function notifyClients(type, data) {
    console.log(`📤 notifyClients called: type=${type}, data=`, data);

    // Try multiple methods to find clients
    Promise.all([
        self.clients.matchAll({ includeUncontrolled: true }),
        self.clients.matchAll({ type: 'window' }),
        self.clients.matchAll({ type: 'all' })
    ]).then(([uncontrolledClients, windowClients, allClients]) => {
        const clients = [...new Set([...uncontrolledClients, ...windowClients, ...allClients])];
        console.log(`📤 Found ${clients.length} clients to notify (uncontrolled: ${uncontrolledClients.length}, window: ${windowClients.length}, all: ${allClients.length})`);

        if (clients.length === 0) {
            console.log('⚠️ No clients found, trying to get all clients...');
            return self.clients.matchAll();
        }

        clients.forEach(client => {
            console.log(`📤 Sending message to client:`, client.url);
            client.postMessage({
                type: type,
                data: data,
                timestamp: new Date().toISOString()
            });
        });
    }).catch(error => {
        console.error('❌ Error notifying clients:', error);
    });
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);

    if (event.tag === 'offline-data-sync') {
        event.waitUntil(syncOfflineData());
    }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
    try {
        console.log('🚀 Starting optimized sync...');

        // Set a much shorter timeout for faster failure detection
        const syncTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Sync timeout')), 2000); // Reduced to 2 seconds
        });

        const syncPromise = performOptimizedSync();

        // Race between sync and timeout
        let result;
        try {
            result = await Promise.race([syncPromise, syncTimeout]);
        } catch (timeoutError) {
            // If timeout occurred, result will be undefined
            result = { synced: 0 };
        }

        console.log('✅ Optimized sync completed');
        console.log('📤 Sending sync-complete message to clients...');
        notifyClients('sync-complete', { synced: result?.synced || 0, timestamp: new Date().toISOString() });
        console.log('📤 Sync-complete message sent');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        notifyClients('sync-complete', { synced: false, error: error.message });
    }
}

// Optimized sync with batching and timeout
async function performOptimizedSync() {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();

    if (!offlineData || offlineData.length === 0) {
        console.log('📭 No offline data to sync');
        return { synced: 0 };
    }

    console.log(`📦 Syncing ${offlineData.length} records in batches...`);

    // Process in larger batches for faster sync
    const batchSize = 10; // Increased from 3 to 10
    let syncedCount = 0;

    for (let i = 0; i < offlineData.length; i += batchSize) {
        const batch = offlineData.slice(i, i + batchSize);

        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(offlineData.length / batchSize)}`);

        // Process batch with timeout
        const batchPromises = batch.map(async (record) => {
            try {
                await syncRecord(record);
                await removeOfflineRecord(record.id);
                return true;
            } catch (error) {
                console.error('❌ Failed to sync record:', record.id, error);
                return false;
            }
        });

        const results = await Promise.allSettled(batchPromises);
        const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
        syncedCount += successful;

        console.log(`✅ Batch completed: ${successful}/${batch.length} records synced`);

        // Minimal delay between batches (reduced for speed)
        if (i + batchSize < offlineData.length) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Reduced from 200ms to 50ms
        }
    }

    console.log(`🎉 Sync completed: ${syncedCount}/${offlineData.length} records synced`);

    // Return the synced count for the main sync function
    return { synced: syncedCount };
}

// Get offline data from IndexedDB
async function getOfflineData() {
    return new Promise((resolve) => {
        const request = indexedDB.open('BethlehemMedicalOfflineDB', 2);

        request.onsuccess = () => {
            const db = request.result;

            // Check if the object store exists
            if (!db.objectStoreNames.contains('offlineData')) {
                console.log('📦 No offlineData store found, returning empty array');
                resolve([]);
                return;
            }

            const transaction = db.transaction(['offlineData'], 'readonly');
            const store = transaction.objectStore('offlineData');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result || []);
            };

            getAllRequest.onerror = () => {
                console.log('⚠️ Error reading offline data, returning empty array');
                resolve([]);
            };
        };

        request.onerror = () => {
            console.log('⚠️ Error opening database, returning empty array');
            resolve([]);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineData')) {
                db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Sync individual record
async function syncRecord(record) {
    const response = await fetch(record.url, {
        method: record.method,
        headers: record.headers,
        body: record.body
    });

    if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
    }

    return response;
}

// Remove synced record from offline storage
async function removeOfflineRecord(id) {
    return new Promise((resolve) => {
        const request = indexedDB.open('BethlehemMedicalOfflineDB', 2);

        request.onsuccess = () => {
            const db = request.result;

            // Check if the object store exists
            if (!db.objectStoreNames.contains('offlineData')) {
                console.log('📦 No offlineData store found, cannot remove record');
                resolve();
                return;
            }

            const transaction = db.transaction(['offlineData'], 'readwrite');
            const store = transaction.objectStore('offlineData');
            store.delete(id);
            resolve();
        };

        request.onerror = () => {
            console.log('⚠️ Error opening database for removing record');
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineData')) {
                db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'CACHE_MEDICAL_DATA':
            cacheMedicalData(data);
            break;
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
        case 'CLEAR_CACHE':
            clearCache().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        case 'SKIP_WAITING':
            console.log('⏭️ Skipping waiting - activating new Service Worker');
            self.skipWaiting();
            break;
    }
});

// Cache medical data for offline access
async function cacheMedicalData(data) {
    try {
        const cache = await caches.open(API_CACHE_NAME);

        // Cache different types of medical data
        if (data.patients) {
            const patientsResponse = new Response(JSON.stringify(data.patients), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put('/api/patients', patientsResponse);
        }

        if (data.appointments) {
            const appointmentsResponse = new Response(JSON.stringify(data.appointments), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put('/api/appointments', appointmentsResponse);
        }

        if (data.doctors) {
            const doctorsResponse = new Response(JSON.stringify(data.doctors), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put('/api/doctors', doctorsResponse);
        }

        if (data.clinics) {
            const clinicsResponse = new Response(JSON.stringify(data.clinics), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put('/api/clinics', clinicsResponse);
        }

        console.log('✅ Medical data cached for offline access');
    } catch (error) {
        console.error('❌ Failed to cache medical data:', error);
    }
}

// Get cache status
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {};

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            status[cacheName] = keys.length;
        }

        return status;
    } catch (error) {
        console.error('❌ Failed to get cache status:', error);
        return {};
    }
}

// Clear all caches
async function clearCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ All caches cleared');
    } catch (error) {
        console.error('❌ Failed to clear caches:', error);
    }
}

console.log('🏥 Bethlehem Medical Center Service Worker loaded');
