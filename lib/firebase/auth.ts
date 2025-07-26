import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { auth, db } from "./config";

// Configure Firebase session persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

// Configure authenticator for production
authenticator.options = {
  step: 30, // 30-second time window
  window: 1, // Allow 1 step tolerance (30 seconds before/after)
};

export interface AdminUser {
  uid: string;
  email: string;
  role: "admin" | "super-admin";
  name: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

// Admin login with 2FA support
export const adminLogin = async (
  credentials: LoginCredentials
): Promise<AdminUser> => {
  try {
    // First, authenticate with email/password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    // Check if user exists in admin collection
    const userDoc = await getDoc(
      doc(db, "admin-users", userCredential.user.uid)
    );

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("User not authorized as admin");
    }

    const adminData = userDoc.data() as AdminUser;

    if (!adminData.isActive) {
      await signOut(auth);
      throw new Error("Account is deactivated");
    }

    // Check 2FA if enabled
    if (adminData.twoFactorEnabled) {
      if (!credentials.twoFactorCode) {
        await signOut(auth);
        throw new Error("2FA code required");
      }

      // Verify 2FA code using otplib
      const isValid2FA = authenticator.verify({
        secret: adminData.twoFactorSecret!,
        token: credentials.twoFactorCode,
      });

      if (!isValid2FA) {
        await signOut(auth);
        throw new Error("Invalid 2FA code");
      }
    }

    // Update last login
    await updateDoc(doc(db, "admin-users", userCredential.user.uid), {
      lastLogin: new Date(),
    });

    return adminData;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};

// Create new admin user (only super-admin can do this)
export const createAdminUser = async (
  email: string,
  password: string,
  name: string,
  role: "admin" | "super-admin" = "admin"
): Promise<string> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create admin user document
    const adminUser: Omit<AdminUser, "uid"> = {
      email,
      role,
      name,
      twoFactorEnabled: false,
      createdAt: new Date(),
      isActive: true,
    };

    await setDoc(doc(db, "admin-users", userCredential.user.uid), adminUser);

    return userCredential.user.uid;
  } catch (error) {
    console.error("Create admin user error:", error);
    throw error;
  }
};

// Setup 2FA for admin user
export const setupTwoFactor = async (
  userId: string
): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: Array<{ code: string; used: boolean }>;
}> => {
  try {
    // Get user info to use email instead of UID
    const userDoc = await getDoc(doc(db, "admin-users", userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const userEmail = userData.email || "admin";

    // Generate TOTP secret
    const secret = authenticator.generateSecret();

    if (!secret) {
      throw new Error("Failed to generate 2FA secret");
    }

    // Generate QR code using email instead of UID for better UX and security
    const qrCode = await QRCode.toDataURL(
      authenticator.keyuri(userEmail, "Tripesa Safari Admin", secret)
    );

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Update user document with secret and backup codes (but don't enable yet)
    await updateDoc(doc(db, "admin-users", userId), {
      twoFactorSecret: secret,
      backupCodes: backupCodes,
      // Note: twoFactorEnabled remains false until verified
    });

    return { secret: secret, qrCode, backupCodes };
  } catch (error) {
    console.error("Setup 2FA error:", error);
    throw error;
  }
};

// Verify and enable 2FA
export const verifyAndEnable2FA = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    // Get user document
    const userDoc = await getDoc(doc(db, "admin-users", userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const secret = userData.twoFactorSecret;

    if (!secret) {
      throw new Error("2FA not set up");
    }

    // Ensure the code is a string and trim whitespace
    const cleanCode = String(code).trim();

    // Ensure the secret is a string and trim whitespace
    const cleanSecret = String(secret).trim();

    if (!cleanCode || !cleanSecret) {
      throw new Error("Invalid code or secret");
    }

    // Validate code format (must be 6 digits)
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new Error("Invalid code format - must be 6 digits");
    }

    // Use otplib to verify the code
    const isValid = authenticator.verify({
      secret: cleanSecret,
      token: cleanCode,
    });

    if (isValid) {
      // Enable 2FA
      await updateDoc(doc(db, "admin-users", userId), {
        twoFactorEnabled: true,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Verify 2FA error:", error);
    throw error;
  }
};

// Verify backup code
export const verifyBackupCode = async (
  userId: string,
  backupCode: string
): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "admin-users", userId));
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const backupCodes = userData.backupCodes || [];

    // Check if backup code exists and is unused
    const codeIndex = backupCodes.findIndex(
      (code: any) => code.code === backupCode && !code.used
    );

    if (codeIndex !== -1) {
      // Mark backup code as used
      backupCodes[codeIndex].used = true;
      await updateDoc(doc(db, "admin-users", userId), {
        backupCodes: backupCodes,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Verify backup code error:", error);
    return false;
  }
};

// Generate new backup codes
export const generateNewBackupCodes = async (
  userId: string
): Promise<string[]> => {
  try {
    const newBackupCodes = generateBackupCodes();

    await updateDoc(doc(db, "admin-users", userId), {
      backupCodes: newBackupCodes,
    });

    return newBackupCodes.map((code: any) => code.code);
  } catch (error) {
    console.error("Generate new backup codes error:", error);
    throw error;
  }
};

// Disable 2FA for admin user
export const disableTwoFactor = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "admin-users", userId), {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    throw error;
  }
};

// Change password
export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    await updatePassword(user, newPassword);
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

// Reset password (send email)
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

// Get current admin user
export const getCurrentAdminUser = async (): Promise<AdminUser | null> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      // User not authenticated in Firebase Auth
      return null;
    }

    const userDoc = await getDoc(doc(db, "admin-users", user.uid));

    if (!userDoc.exists()) {
      // User authenticated in Firebase Auth but not in admin collection
      console.warn("User authenticated but not found in admin collection");
      return null;
    }

    const userData = userDoc.data();

    // Check if user is active
    if (!userData.isActive) {
      console.warn("User account is deactivated");
      return null;
    }

    return {
      uid: user.uid,
      ...userData,
    } as AdminUser;
  } catch (error) {
    console.error("Get current admin user error:", error);
    return null;
  }
};

// Get all admin users (for super-admin)
export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "admin-users"));
    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as AdminUser[];
  } catch (error) {
    console.error("Get all admin users error:", error);
    throw error;
  }
};

// Deactivate admin user
export const deactivateAdminUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "admin-users", userId), {
      isActive: false,
    });
  } catch (error) {
    console.error("Deactivate admin user error:", error);
    throw error;
  }
};

// Activate admin user
export const activateAdminUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "admin-users", userId), {
      isActive: true,
    });
  } catch (error) {
    console.error("Activate admin user error:", error);
    throw error;
  }
};

// Logout
export const adminLogout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper functions
const verifyTwoFactorCode = (secret: string, code: string): boolean => {
  // Validate secret format (should be base32)
  if (!secret || typeof secret !== "string") {
    throw new Error("Invalid secret format");
  }

  // Validate code format (should be 6 digits)
  if (
    !code ||
    typeof code !== "string" ||
    code.length !== 6 ||
    !/^\d{6}$/.test(code)
  ) {
    throw new Error("Invalid code format - must be 6 digits");
  }

  try {
    // Use otplib to verify the code
    const isValid = authenticator.verify({
      secret: secret,
      token: code,
    });
    return isValid;
  } catch (error) {
    console.error("TOTP verification error:", error);
    throw new Error("Failed to verify 2FA code");
  }
};

// Helper function to generate backup codes
const generateBackupCodes = (): Array<{ code: string; used: boolean }> => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push({ code, used: false });
  }
  return codes;
};
