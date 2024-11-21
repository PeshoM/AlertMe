import { initializeApp, FirebaseApp } from "firebase/app";
import {
  FIREBASE_APP_API_KEY,
  FIREBASE_APP_AUTH_DOMAIN,
  FIREBASE_APP_PROJECT_ID,
  FIREBASE_APP_STORAGE_BUCKET,
  FIREBASE_APP_MESSAGING_SENDER_ID,
  FIREBASE_APP_APP_ID,
  FIREBASE_APP_MEASUREMENT_ID,
} from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_APP_API_KEY,
  authDomain: FIREBASE_APP_AUTH_DOMAIN,
  projectId: FIREBASE_APP_PROJECT_ID,
  storageBucket: FIREBASE_APP_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_APP_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_APP_ID,
  measurementId: FIREBASE_APP_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export { app };
