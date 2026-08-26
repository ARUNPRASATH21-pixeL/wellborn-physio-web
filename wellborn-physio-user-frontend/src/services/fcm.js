import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

// 1. Get Device/Browser FCM Token Safely
export const getUserFcmToken = async () => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const currentToken = await getToken(messaging, {
      vapidKey: "BAF0St3VesDY2GO8975tJrG0PkzbdzPXz1Ugm5h0NSrD5rvhr-oMy8jHTdDQgocyZEssV8MxPrQc502MKe_x7QU"
    });
    
    return currentToken || null;
  } catch (error) {
    console.error("FCM Token error: ", error);
    return null;
  }
};

// 2. Foreground Message Listener
export const onForegroundMessage = async (callback) => {
  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log("Foreground message received: ", payload);
        if (callback) callback(payload);
      });
    }
  } catch (error) {
    console.error("Foreground message listener error: ", error);
  }
};