self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || 'Wellborn Physio';
    const options = {
        body: data.message || 'You have a new notification.',
        icon: '/assets/wellborn.physio.jpg', 
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'whatsapp-style-alert',
        renotify: true,
        requireInteraction: true 
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification mela click panna web app open aagurathuku
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') 
    );
});
