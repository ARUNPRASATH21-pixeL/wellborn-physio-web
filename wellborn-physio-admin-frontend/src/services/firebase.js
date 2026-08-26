import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDqfBdSG-2uCRL1gB2MnLUQIe8LiAA8Nyc",
  authDomain: "wellborn-physio.firebaseapp.com",
  projectId: "wellborn-physio",
  storageBucket: "wellborn-physio.firebasestorage.app",
  messagingSenderId: "718125870856",
  appId: "1:718125870856:web:dd51fd5530cc398be786bd",
  measurementId: "G-8M8KZV4LWR",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

let messaging = null;

const initializeMessaging = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.warn("Firebase Cloud Messaging is not supported in this browser.");
      return null;
    }

    messaging = getMessaging(app);

    return messaging;
  } catch (error) {
    console.error("Failed to initialize Firebase Messaging:", error);
    return null;
  }
};

export {
  app,
  auth,
  messaging,
  initializeMessaging,
  isSupported,
};

export default app;