/**
 * Service Worker pour la PWA
 * Gère le cache offline et les mises à jour
 */

const CACHE_NAME = 'simulateur-placement-v1';
const RUNTIME_CACHE = 'simulateur-runtime-v1';

// Fichiers à mettre en cache lors de l'installation
const PRECACHE_ASSETS = [
	'/',
	'/manifest.json',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png'
];

// Stratégie de cache : Cache First pour les assets statiques
const CACHE_FIRST_PATTERNS = [
	/\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/,
	/\/icons\//,
	/\/fonts\//
];

// Stratégie de cache : Network First pour les données dynamiques
const NETWORK_FIRST_PATTERNS = [
	/\/api\//,
	/\.json$/
];

// Installation du service worker
self.addEventListener('install', (event) => {
	console.log('[Service Worker] Installation...');
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('[Service Worker] Mise en cache des assets');
			return cache.addAll(PRECACHE_ASSETS);
		})
	);
	self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activation...');
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((cacheName) => {
						return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
					})
					.map((cacheName) => {
						console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
						return caches.delete(cacheName);
					})
			);
		})
	);
	self.clients.claim();
});

// Gestion des requêtes
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Ignorer les requêtes non-GET et les requêtes vers d'autres domaines
	if (request.method !== 'GET' || url.origin !== location.origin) {
		return;
	}

	// Stratégie Cache First pour les assets statiques
	if (CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// Stratégie Network First pour les données dynamiques
	if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
		event.respondWith(networkFirst(request));
		return;
	}

	// Stratégie Stale While Revalidate pour les pages HTML
	event.respondWith(staleWhileRevalidate(request));
});

// Stratégie Cache First : vérifie le cache d'abord, puis le réseau
async function cacheFirst(request) {
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.error('[Service Worker] Erreur réseau:', error);
		// Retourner une réponse par défaut si disponible
		const cachedResponse = await caches.match('/');
		return cachedResponse || new Response('Offline', { status: 503 });
	}
}

// Stratégie Network First : essaie le réseau d'abord, puis le cache
async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.log('[Service Worker] Réseau indisponible, utilisation du cache');
		const cachedResponse = await caches.match(request);
		return cachedResponse || new Response('Offline', { status: 503 });
	}
}

// Stratégie Stale While Revalidate : retourne le cache immédiatement et met à jour en arrière-plan
async function staleWhileRevalidate(request) {
	const cache = await caches.open(RUNTIME_CACHE);
	const cachedResponse = await cache.match(request);

	const fetchPromise = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				cache.put(request, networkResponse.clone());
			}
			return networkResponse;
		})
		.catch(() => {
			// En cas d'erreur réseau, retourner le cache si disponible
			return cachedResponse || new Response('Offline', { status: 503 });
		});

	return cachedResponse || fetchPromise;
}

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	if (event.data && event.data.type === 'CACHE_URLS') {
		event.waitUntil(
			caches.open(CACHE_NAME).then((cache) => {
				return cache.addAll(event.data.urls);
			})
		);
	}
});

