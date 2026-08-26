// public/firebase-messaging-sw.js
// Service Worker for handling background push notifications

// Import Firebase modules (using CDN)
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// ⚠️ IMPORTANT: Replace with your Firebase config
// Get these from: Firebase Console → Project Settings → General Tab
const firebaseConfig = {
   apiKey: "AIzaSyDqfBdSG-2uCRL1gB2MnLUQIe8LiAA8Nyc",
  authDomain: "wellborn-physio.firebaseapp.com",
  projectId: "wellborn-physio",
  storageBucket: "wellborn-physio.firebasestorage.app",
  messagingSenderId: "718125870856",
  appId: "1:718125870856:web:dd51fd5530cc398be786bd",
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('✅ Service Worker initialized with Firebase');

/**
 * Handle background notifications
 * This runs when the app is closed or in background
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[Background Message] Received:', payload);

  const notificationTitle = payload.notification?.title || 'Wellborn Physio';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/assets/wellborn-physio-logo.png',
    badge: '/assets/wellborn-physio-badge.png',
    tag: payload.data?.type || 'wellborn-notification',
    data: payload.data || {},
    requireInteraction: true, // Keep notification visible until user interacts
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/assets/wellborn-physio-logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/close-icon.png'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click
 * This runs when user clicks on a notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Notification Click]', event.notification.tag);

  // Close the notification
  event.notification.close();

  // Handle different action types
  if (event.action === 'close') {
    // User clicked close button, do nothing
    return;
  }

  // Determine where to navigate based on notification type
  let targetUrl = '/';

  if (event.notification.data?.type) {
    switch (event.notification.data.type) {
      case 'APPOINTMENT_CONFIRMED':
        targetUrl = '/user/appointment';
        break;
      case 'APPOINTMENT_CANCELLED':
        targetUrl = '/user/appointment';
        break;
      case 'APPOINTMENT_REMINDER':
        targetUrl = '/user/appointment';
        break;
      case 'APPOINTMENT_COMPLETED':
        targetUrl = '/user/appointment';
        break;
      default:
        targetUrl = '/user/home';
    }
  }

  // Open the app and navigate to target page
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((clientList) => {
        // Check if app window already exists
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          
          // If app is already open, focus it and navigate
          if (client.url === '/' && 'focus' in client) {
            // Post message to client to navigate
            client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl
            });
            return client.focus();
          }
        }

        // If app not open, open new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * Handle notification close
 * This runs when notification is dismissed by the system
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Notification Closed]', event.notification.tag);
  // Optional: Send analytics or update status
});

/**
 * Handle messages from the main app thread
 * The app can send messages to the service worker using this
 */
self.addEventListener('message', (event) => {
  console.log('[Message from App]', event.data);

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    
    self.registration.showNotification(title, {
      icon: '/assets/wellborn-physio-logo.png',
      badge: '/assets/wellborn-physio-badge.png',
      ...options
    });
  }
});

// Log service worker activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
});

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installed');
  self.skipWaiting();
});