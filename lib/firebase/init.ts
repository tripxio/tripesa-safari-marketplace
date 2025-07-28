import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Global variables to store Firebase instances
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

// Check if we're running on the client side
const isClient = typeof window !== "undefined";

// Initialize Firebase with proper error handling
export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Auth (only on client side)
    if (!auth && isClient) {
      auth = getAuth(app);
      // Configure auth persistence to LOCAL (survives browser restarts)
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error("Error setting auth persistence:", error);
      });
    }

    // Initialize Firestore with proper error handling
    if (!db) {
      try {
        // Try to get existing Firestore instance first
        db = getFirestore(app);
      } catch (error) {
        // If getFirestore fails, initialize with persistent cache (client-side only)
        if (isClient) {
          db = initializeFirestore(app, {
            localCache: persistentLocalCache(),
          });
        } else {
          // For server-side, use regular getFirestore
          db = getFirestore(app);
        }
      }

      // Enable IndexedDB persistence for offline capabilities (client-side only)
      if (isClient) {
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === "failed-precondition") {
            console.warn(
              "Multiple tabs open, persistence can only be enabled in one tab at a time."
            );
          } else if (err.code === "unimplemented") {
            console.warn(
              "The current browser does not support all of the features required to enable persistence"
            );
          }
        });
      }
    }

    // Initialize Storage
    if (!storage) {
      storage = getStorage(app);
    }

    // Initialize Analytics (only on client side)
    if (!analytics && isClient) {
      analytics = getAnalytics(app);
    }

    return { app, auth, db, storage, analytics };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
};

// Get Firebase instances (initialize if needed)
export const getFirebaseInstances = () => {
  if (!app || !auth || !db || !storage) {
    return initializeFirebase();
  }
  return { app, auth, db, storage, analytics };
};

// Check if analytics is supported
export const isAnalyticsSupported = async () => {
  if (typeof window === "undefined") return false;
  return await isSupported();
};

// Export individual instances
export const getFirebaseApp = () => {
  if (!app) {
    initializeFirebase();
  }
  return app;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

export const getFirebaseDB = () => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};

export const getFirebaseStorage = () => {
  if (!storage) {
    initializeFirebase();
  }
  return storage;
};

export const getFirebaseAnalytics = () => {
  if (!analytics && typeof window !== "undefined") {
    initializeFirebase();
  }
  return analytics;
};
