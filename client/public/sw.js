self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Error parsing push data:', error);
    return;
  }
  const title = data.title || 'Brittoo Notification';
  const options = {
    body: data.body || 'You have a new update!',
    icon: '/icon-192x192.png',
    data: data.data || {}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url || '/';
  event.waitUntil(self.clients.openWindow(url).catch(err => console.error('Failed to open window:', err)));
});

self.addEventListener('install', () => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker: Activating...');
  self.clients.claim();
});