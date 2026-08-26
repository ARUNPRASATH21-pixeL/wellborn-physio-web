import { initializeApp } from "firebase/app";
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

export async function getFirebaseMessaging() {
  const supported = await isSupported();

  if (!supported) {
    console.warn(
      "Firebase Cloud Messaging is not supported in this browser."
    );
    return null;
  }

  return getMessaging(app);
}

export default app;