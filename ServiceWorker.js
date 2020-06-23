const CACHE_NAME = 'offline';
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', (event) => {
	event.waitUntil((async () => {
		const cache = await caches.open(CACHE_NAME);
		console.log('Service Worker installed');
		await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
	})());
});


self.addEventListener('activate', async (event) => {
	event.waitUntil((async () => {
		console.log('Service Worker activated');
	})());

	if ('navigationPreload' in self.registration) {
		await self.registration.navigationPreload.enable();
	}

	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.mode === 'navigate') {
		event.respondWith((async () => {
			try {
				const preloadResponse = await event.preloadResponse;
				if (preloadResponse) {
					return preloadResponse;
				}

				const networkResponse = await fetch(event.request);
				return networkResponse;
			} catch (error) {
				console.log('User Offline', error);

				const cache = await caches.open(CACHE_NAME);
				const cachedResponse = await cache.match(OFFLINE_URL);
				return cachedResponse;
			}
		})());
	}
});
