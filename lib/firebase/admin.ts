import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK for server-side operations
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // Check if we have service account credentials from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Use service account key from environment variable
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Use default credentials (for local development or when deployed)
      // This will use Application Default Credentials
      try {
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } catch (error) {
        console.error("Firebase Admin SDK initialization failed:", error);
        throw new Error(
          "Firebase Admin SDK requires proper credentials. Please set up FIREBASE_SERVICE_ACCOUNT_KEY environment variable."
        );
      }
    }
  }
  return getApps()[0];
};

// Get Firebase Admin instances
export const getFirebaseAdminApp = () => {
  try {
    return initializeFirebaseAdmin();
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
};

export const getFirebaseAdminAuth = () => {
  try {
    return getAuth(getFirebaseAdminApp());
  } catch (error) {
    console.error("Error getting Firebase Admin Auth:", error);
    throw error;
  }
};

export const getFirebaseAdminDB = () => {
  try {
    return getFirestore(getFirebaseAdminApp());
  } catch (error) {
    console.error("Error getting Firebase Admin DB:", error);
    throw error;
  }
};
