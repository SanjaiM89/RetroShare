import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
// import { getFirestore } from 'firebase/firestore'; // If you use Firestore
// import { getAnalytics } from "firebase/analytics"; // If you want to use Firebase Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2IC7-V6DRvUbHdYBowtSQVRxzRkVunuY",
  authDomain: "lunar-alpha-419201.firebaseapp.com",
  projectId: "lunar-alpha-419201",
  storageBucket: "lunar-alpha-419201.appspot.com",
  messagingSenderId: "671509211557",
  appId: "1:671509211557:web:e792b3f731f31d29b0204c",
  measurementId: "G-NS6MTZJ4N8" // Optional
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Log the configuration being used by the app instance for diagnostics
if (typeof window !== 'undefined') { // Log only on client-side
    // Use JSON.parse(JSON.stringify()) for a clean loggable object, as app.options might have complex structure
    try {
        console.log("Firebase App Initialized. Active configuration:", JSON.parse(JSON.stringify(app.options)));
    } catch (e) {
        console.error("Could not stringify app.options for logging:", e);
        console.log("Firebase App Initialized. app.options (raw):", app.options);
    }
}

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);
// const db = getFirestore(app); // If you use Firestore
// const analytics = getAnalytics(app); // If you want to use Firebase Analytics

export { app, auth, storage /*, db, analytics */ };
