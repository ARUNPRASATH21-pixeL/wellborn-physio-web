import { getMessaging, getToken, isSupported } from "firebase/messaging";
import app from "./firebase";

const VAPID_KEY =
  "BAF0St3VesDY2GO8975tJrG0PkzbdzPXz1Ugm5h0NSrD5rvhr-oMy8jHTdDQgocyZEssV8MxPrQc502MKe_x7QU";

export const requestAdminNotificationPermission = async () => {
  try {
    // ============================================================
    // CHECK BROWSER NOTIFICATION SUPPORT
    // ============================================================

    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications.");
      return null;
    }

    // ============================================================
    // CHECK SERVICE WORKER SUPPORT
    // ============================================================

    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker is not supported.");
      return null;
    }

    // ============================================================
    // CHECK FIREBASE MESSAGING SUPPORT
    // ============================================================

    const supported = await isSupported();

    if (!supported) {
      console.warn(
        "Firebase Cloud Messaging is not supported in this browser."
      );
      return null;
    }

    // ============================================================
    // CHECK / REQUEST NOTIFICATION PERMISSION
    // ============================================================

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("Notification permission was not granted.");
      return null;
    }

    console.log("✅ Notification permission granted.");

    // ============================================================
    // GET FIREBASE MESSAGING INSTANCE
    // ============================================================

    const messaging = getMessaging(app);

    // ============================================================
    // REGISTER FIREBASE MESSAGING SERVICE WORKER
    // ============================================================

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log("✅ Firebase Messaging Service Worker registered.");

    // ============================================================
    // WAIT UNTIL SERVICE WORKER IS READY
    // ============================================================

    await navigator.serviceWorker.ready;

    // ============================================================
    // GENERATE FCM TOKEN
    // ============================================================

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("FCM token was not generated.");
      return null;
    }

    console.log("🔥 FCM Token generated successfully.");

    return token;

  } catch (error) {
    console.error(
      "❌ FCM notification setup error:",
      error
    );

    return null;
  }
};