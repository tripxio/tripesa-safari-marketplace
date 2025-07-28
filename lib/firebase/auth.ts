import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
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
import { getFirebaseAuth, getFirebaseDB } from "./init";

// Configure Firebase session persistence (only on client side)
if (typeof window !== "undefined") {
  setPersistence(getFirebaseAuth(), browserLocalPersistence).catch((error) => {
    console.error("Error setting persistence:", error);
  });
}

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
  backupCodes?: Array<{ code: string; used: boolean }>;
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
      getFirebaseAuth(),
      credentials.email,
      credentials.password
    );

    // Check if user exists in admin collection
    const userDoc = await getDoc(
      doc(getFirebaseDB(), "admin-users", userCredential.user.uid)
    );

    if (!userDoc.exists()) {
      await signOut(getFirebaseAuth());
      throw new Error("User not authorized as admin");
    }

    const adminData = userDoc.data() as AdminUser;

    if (!adminData.isActive) {
      await signOut(getFirebaseAuth());
      throw new Error("Account is deactivated");
    }

    // Check 2FA if enabled
    if (adminData.twoFactorEnabled) {
      if (!credentials.twoFactorCode) {
        await signOut(getFirebaseAuth());
        throw new Error("2FA code required");
      }

      // Verify 2FA code using otplib
      const isValid2FA = authenticator.verify({
        secret: adminData.twoFactorSecret!,
        token: credentials.twoFactorCode,
      });

      if (!isValid2FA) {
        await signOut(getFirebaseAuth());
        throw new Error("Invalid 2FA code");
      }
    }

    // Update last login
    await updateDoc(
      doc(getFirebaseDB(), "admin-users", userCredential.user.uid),
      {
        lastLogin: new Date(),
      }
    );

    return {
      uid: userCredential.user.uid,
      email: adminData.email,
      role: adminData.role,
      name: adminData.name,
      twoFactorEnabled: adminData.twoFactorEnabled,
      twoFactorSecret: adminData.twoFactorSecret,
      createdAt: adminData.createdAt,
      lastLogin: new Date(),
      isActive: adminData.isActive,
    };
  } catch (error: any) {
    console.error("Admin login error:", error);
    throw new Error(error.message || "Login failed");
  }
};

// Create admin user (client-side only - no email sending)
export const createAdminUser = async (
  email: string,
  name: string,
  role: "admin" | "super-admin" = "admin"
): Promise<{ uid: string; password: string }> => {
  try {
    // Generate a secure password
    const password = generateSecurePassword();

    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );

    // Create admin user document
    const adminUserData: Omit<AdminUser, "uid"> = {
      email: email.toLowerCase(),
      role,
      name,
      twoFactorEnabled: false,
      createdAt: new Date(),
      isActive: true,
    };

    await setDoc(
      doc(getFirebaseDB(), "admin-users", userCredential.user.uid),
      adminUserData
    );

    return {
      uid: userCredential.user.uid,
      password,
    };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    throw new Error(error.message || "Failed to create admin user");
  }
};

// Generate secure password (moved from email service)
const generateSecurePassword = (): string => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each category
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special character

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Setup 2FA for a user
export const setupTwoFactor = async (
  userId: string
): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: Array<{ code: string; used: boolean }>;
}> => {
  try {
    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(
      authenticator.keyuri("admin@tripesa.co", "Tripesa Safari Admin", secret)
    );

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Update user document with 2FA info
    await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
      twoFactorSecret: secret,
      twoFactorEnabled: false, // Will be enabled after verification
    });

    return {
      secret,
      qrCode,
      backupCodes,
    };
  } catch (error: any) {
    console.error("Error setting up 2FA:", error);
    throw new Error("Failed to setup 2FA");
  }
};

// Verify and enable 2FA
export const verifyAndEnable2FA = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    // Get user document
    const userDoc = await getDoc(doc(getFirebaseDB(), "admin-users", userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data() as AdminUser;
    const secret = userData.twoFactorSecret;

    if (!secret) {
      throw new Error("2FA not set up");
    }

    // Verify the code
    const isValid = authenticator.verify({
      secret,
      token: code,
    });

    if (isValid) {
      // Enable 2FA
      await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
        twoFactorEnabled: true,
      });
      return true;
    }

    return false;
  } catch (error: any) {
    console.error("Error verifying 2FA:", error);
    throw new Error("Failed to verify 2FA");
  }
};

// Verify backup code
export const verifyBackupCode = async (
  userId: string,
  backupCode: string
): Promise<boolean> => {
  try {
    // Get user document
    const userDoc = await getDoc(doc(getFirebaseDB(), "admin-users", userId));
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data() as AdminUser;
    const backupCodes = userData.backupCodes || [];

    // Find and mark backup code as used
    const codeIndex = backupCodes.findIndex(
      (code) => code.code === backupCode && !code.used
    );

    if (codeIndex === -1) {
      return false;
    }

    // Mark code as used
    backupCodes[codeIndex].used = true;
    await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
      backupCodes,
    });

    return true;
  } catch (error: any) {
    console.error("Error verifying backup code:", error);
    return false;
  }
};

// Generate new backup codes
export const generateNewBackupCodes = async (
  userId: string
): Promise<string[]> => {
  try {
    const backupCodes = generateBackupCodes();
    await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
      backupCodes,
    });
    return backupCodes.map((code) => code.code);
  } catch (error: any) {
    console.error("Error generating backup codes:", error);
    throw new Error("Failed to generate backup codes");
  }
};

// Disable 2FA
export const disableTwoFactor = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
    });
  } catch (error: any) {
    console.error("Error disabling 2FA:", error);
    throw new Error("Failed to disable 2FA");
  }
};

// Change password
export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user logged in");
    }

    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error("Error changing password:", error);
    throw new Error("Failed to change password");
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (error: any) {
    console.error("Error resetting password:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Get current admin user
export const getCurrentAdminUser = async (): Promise<AdminUser | null> => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    const userDoc = await getDoc(doc(getFirebaseDB(), "admin-users", user.uid));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as AdminUser;

    // Convert Firestore Timestamps to Date objects
    return {
      ...userData,
      uid: user.uid,
      createdAt:
        userData.createdAt instanceof Date
          ? userData.createdAt
          : (userData.createdAt as any)?.toDate?.() || new Date(),
      lastLogin:
        userData.lastLogin instanceof Date
          ? userData.lastLogin
          : (userData.lastLogin as any)?.toDate?.() || undefined,
    };
  } catch (error: any) {
    console.error("Error getting current admin user:", error);
    return null;
  }
};

// Get all admin users
export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const q = query(collection(getFirebaseDB(), "admin-users"));
    const querySnapshot = await getDocs(q);

    const users: AdminUser[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as AdminUser;

      // Convert Firestore Timestamps to Date objects
      users.push({
        ...userData,
        uid: doc.id,
        createdAt:
          userData.createdAt instanceof Date
            ? userData.createdAt
            : (userData.createdAt as any)?.toDate?.() || new Date(),
        lastLogin:
          userData.lastLogin instanceof Date
            ? userData.lastLogin
            : (userData.lastLogin as any)?.toDate?.() || undefined,
      });
    });

    return users;
  } catch (error: any) {
    console.error("Get all admin users error:", error);
    throw new Error("Failed to get admin users");
  }
};

// Deactivate admin user (removed - now handled by API route)
export const deactivateAdminUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
      isActive: false,
    });
  } catch (error: any) {
    console.error("Deactivate admin user error:", error);
    throw new Error("Failed to deactivate user");
  }
};

// Activate admin user (removed - now handled by API route)
export const activateAdminUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(getFirebaseDB(), "admin-users", userId), {
      isActive: true,
    });
  } catch (error: any) {
    console.error("Activate admin user error:", error);
    throw new Error("Failed to activate user");
  }
};

// Admin logout
export const adminLogout = async (): Promise<void> => {
  try {
    await signOut(getFirebaseAuth());
  } catch (error: any) {
    console.error("Admin logout error:", error);
    throw new Error("Failed to logout");
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(getFirebaseAuth(), callback);
};

// Helper function to verify 2FA code
const verifyTwoFactorCode = (secret: string, code: string): boolean => {
  try {
    return authenticator.verify({
      secret,
      token: code,
    });
  } catch (error) {
    console.error("Error verifying 2FA code:", error);
    return false;
  }
};

// Helper function to generate backup codes
const generateBackupCodes = (): Array<{ code: string; used: boolean }> => {
  const codes: Array<{ code: string; used: boolean }> = [];

  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push({ code, used: false });
  }

  return codes;
};
