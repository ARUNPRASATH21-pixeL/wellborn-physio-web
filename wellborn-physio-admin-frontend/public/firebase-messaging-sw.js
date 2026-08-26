importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// ============================================================
// FIREBASE INITIALIZATION
// ============================================================

firebase.initializeApp({
  apiKey: "AIzaSyDqfBdSG-2uCRL1gB2MnLUQIe8LiAA8Nyc",
  authDomain: "wellborn-physio.firebaseapp.com",
  projectId: "wellborn-physio",
  storageBucket: "wellborn-physio.firebasestorage.app",
  messagingSenderId: "718125870856",
  appId: "1:718125870856:web:dd51fd5530cc398be786bd"
});

const messaging = firebase.messaging();

// ============================================================
// BACKGROUND MESSAGE
// ============================================================

messaging.onBackgroundMessage((payload) => {

  console.log("🔥 FCM background message:", payload);

  // ==========================================================
  // WEBSITE NAME
  // ==========================================================

  const websiteName = "Wellborn Physio";

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const message =
    payload.data?.message ||
    payload.notification?.body ||
    "You have a new notification.";

  // ==========================================================
  // NOTIFICATION TYPE
  // ==========================================================

  const type =
    payload.data?.type ||
    "GENERAL";

  // ==========================================================
  // NOTIFICATION OPTIONS
  // ==========================================================

  const notificationOptions = {

    body: message,

    icon: "/assets/wellborn physio.jpg",

    badge: "/favicon.ico",

    data: {
      type: type,

      // Optional navigation information
      url: payload.data?.url || "/"
    }

  };

  // ==========================================================
  // SHOW NOTIFICATION
  // ==========================================================

  self.registration.showNotification(
    websiteName,
    notificationOptions
  );

});