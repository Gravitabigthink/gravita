// Firebase Configuration
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
    }
} else {
    console.warn('Firebase not configured - using mock data mode');
}

export { app, db, auth, isFirebaseConfigured };
