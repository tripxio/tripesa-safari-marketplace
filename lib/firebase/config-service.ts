import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseDB, getFirebaseStorage, getFirebaseApp } from "./init"; // Assuming you have this init file

// Site Configuration Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface BannerImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  description?: string;
  order: number;
  createdAt: Date;
  isUploaded?: boolean; // true for Firebase Storage, false for external links
  storagePath?: string; // Firebase Storage path for uploaded images
}

export interface BannerText {
  mainTitle: string;
  subtitle: string;
  description: string;
}

export interface BannerSettings {
  transitionDuration: number; // in seconds
  autoplay: boolean;
  autoplayInterval: number; // in seconds
  showIndicators: boolean;
  showArrows: boolean;
}

export interface BannerConfig {
  images: BannerImage[];
  text: BannerText;
  settings: BannerSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface BannerVersion {
  id: string;
  images: BannerImage[];
  text: BannerText;
  settings: BannerSettings;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  version: number;
  description?: string | null;
  isActive: boolean;
}

export interface TileImage {
  id: string;
  url: string;
  alt: string;
  title: string;
  description: string;
  category: string;
  link: string;
  order: number;
  createdAt: Date;
}

export interface SiteConfig {
  themeColors: ThemeColors;
  bannerImages: BannerImage[];
  tileImages: TileImage[];
  generalSettings: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
  };
}

export interface ThemeConfig {
  light: ThemeColors;
  dark: ThemeColors;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface ThemeVersion {
  id: string;
  light: ThemeColors;
  dark: ThemeColors;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  version: number;
  description?: string;
  isActive: boolean;
}

// -----------------------------------------------------------------------------
// Featured Destinations Configuration
// -----------------------------------------------------------------------------

export interface FeaturedDestination {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  order: number;
  isUploaded?: boolean;
  storagePath?: string;
}

/**
 * Retrieves the featured destinations configuration.
 * @returns A promise that resolves to an array of featured destinations or null if not found.
 */
export const getFeaturedDestinations = async (): Promise<
  FeaturedDestination[] | null
> => {
  const db = getFirebaseDB();
  const docRef = doc(db, "site-config", "featured-destinations");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Assuming the destinations are stored in a 'destinations' field.
    return (data.destinations as FeaturedDestination[]).sort(
      (a, b) => a.order - b.order
    );
  }
  return null;
};

/**
 * Saves the featured destinations configuration.
 * @param destinations - The array of featured destinations to save.
 * @param userId - The ID of the user performing the action.
 */
export const saveFeaturedDestinations = async (
  destinations: FeaturedDestination[],
  userId: string
): Promise<void> => {
  const db = getFirebaseDB();
  const docRef = doc(db, "site-config", "featured-destinations");

  const data = {
    destinations,
    updatedAt: new Date(),
    updatedBy: userId,
  };

  await setDoc(docRef, data, { merge: true });
};

/**
 * Uploads an image for a featured destination to Firebase Storage.
 * @param file - The image file to upload.
 * @returns A promise that resolves to the public URL and storage path of the uploaded image.
 */
export const uploadFeaturedDestinationImage = async (
  file: File
): Promise<{ url: string; storagePath: string }> => {
  const storage = getFirebaseStorage();
  const storagePath = `site-assets/featured-destinations/${Date.now()}-${file.name.replace(
    /\s/g,
    "_"
  )}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return { url: downloadURL, storagePath };
};

/**
 * Deletes an image for a featured destination from Firebase Storage.
 * @param storagePath - The storage path of the image to delete.
 */
export const deleteFeaturedDestinationImage = async (
  storagePath: string
): Promise<void> => {
  if (!storagePath) return;
  const storage = getFirebaseStorage();
  const imageRef = ref(storage, storagePath);
  try {
    await deleteObject(imageRef);
  } catch (error: any) {
    // It's okay if the file doesn't exist, we can ignore that error.
    if (error.code !== "storage/object-not-found") {
      console.error("Error deleting featured destination image:", error);
      throw error;
    }
  }
};

// -----------------------------------------------------------------------------
// Banner Configuration
// -----------------------------------------------------------------------------

export const getBannerConfig = async (): Promise<BannerConfig | null> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "banner-config");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BannerConfig;
    }
    return null;
  } catch (error) {
    console.error("Error getting banner config:", error);
    throw error;
  }
};

export const saveBannerConfig = async (
  config: Omit<BannerConfig, "createdAt" | "updatedAt" | "version">,
  userId: string,
  userName: string,
  description?: string
): Promise<void> => {
  try {
    const currentConfig = await getBannerConfig();
    const newVersion = (currentConfig?.version || 0) + 1;

    const newConfig: BannerConfig = {
      ...config,
      version: newVersion,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save current config
    await setDoc(
      doc(getFirebaseDB(), "site-config", "banner-config"),
      newConfig
    );

    // Save version history
    const versionDoc: Omit<BannerVersion, "id"> = {
      images: config.images,
      text: config.text,
      settings: config.settings,
      createdAt: new Date(),
      createdBy: userId,
      createdByName: userName,
      version: newVersion,
      description: description || null, // Ensure description is never undefined
      isActive: true,
    };

    await addDoc(collection(getFirebaseDB(), "banner-versions"), versionDoc);

    // Deactivate previous versions
    if (currentConfig) {
      const versionsQuery = query(
        collection(getFirebaseDB(), "banner-versions"),
        where("isActive", "==", true),
        where("version", "!=", newVersion)
      );
      const versionsSnapshot = await getDocs(versionsQuery);

      const batch = writeBatch(getFirebaseDB());
      versionsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isActive: false });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error("Error saving banner config:", error);
    throw error;
  }
};

export const getBannerVersions = async (
  limitCount: number = 10
): Promise<BannerVersion[]> => {
  try {
    const db = getFirebaseDB();
    const versionsQuery = query(
      collection(db, "banner-versions"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(versionsQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as BannerVersion[];
  } catch (error) {
    console.error("Error getting banner versions:", error);
    throw error;
  }
};

export const rollbackBannerToVersion = async (
  versionId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const versionDoc = await getDoc(doc(db, "banner-versions", versionId));
    if (!versionDoc.exists()) {
      throw new Error("Version not found");
    }

    const versionData = versionDoc.data() as BannerVersion;
    const newConfig = {
      images: versionData.images,
      text: versionData.text,
      settings: versionData.settings,
      isActive: true,
      createdBy: userId,
    };

    await saveBannerConfig(
      newConfig,
      userId,
      userName,
      `Rollback to version ${versionData.version}`
    );
  } catch (error) {
    console.error("Error rolling back banner version:", error);
    throw error;
  }
};

// Enhanced image upload with Firebase Storage
export const uploadBannerImage = async (
  file: File
): Promise<{ url: string; storagePath: string }> => {
  try {
    const storage = getFirebaseStorage();
    const fileName = `banners/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      url: downloadURL,
      storagePath: fileName,
    };
  } catch (error) {
    console.error("Error uploading banner image:", error);
    throw error;
  }
};

export const deleteBannerImage = async (
  imageUrl: string,
  storagePath?: string
): Promise<void> => {
  try {
    if (storagePath) {
      // Delete from Firebase Storage
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    }
    // Note: External links can't be deleted, so we just return
  } catch (error) {
    console.error("Error deleting banner image:", error);
    throw error;
  }
};

// Banner Images Management
export const getBannerImages = async (): Promise<BannerImage[]> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "banner-images");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.images || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting banner images:", error);
    throw error;
  }
};

export const saveBannerImages = async (
  images: BannerImage[]
): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "banner-images");
    await setDoc(docRef, { images });
  } catch (error) {
    console.error("Error saving banner images:", error);
    throw error;
  }
};

// Tile Images Management
export const getTileImages = async (): Promise<TileImage[]> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "tile-images");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.images || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting tile images:", error);
    throw error;
  }
};

export const saveTileImages = async (images: TileImage[]): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "tile-images");
    await setDoc(docRef, { images });
  } catch (error) {
    console.error("Error saving tile images:", error);
    throw error;
  }
};

export const uploadTileImage = async (file: File): Promise<string> => {
  try {
    const storage = getFirebaseStorage();
    const fileName = `tiles/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading tile image:", error);
    throw error;
  }
};

export const deleteTileImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `tiles/${fileName}`;

    const storage = getFirebaseStorage();
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting tile image:", error);
    throw error;
  }
};

// General Settings Management
export const getGeneralSettings = async (): Promise<{
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
} | null> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "general-settings");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        siteName: data.siteName || "Tripesa Safari",
        siteDescription: data.siteDescription || "AI-powered safari discovery",
        contactEmail: data.contactEmail || "info@tripesa.co",
        contactPhone: data.contactPhone || "+256 123 456 789",
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting general settings:", error);
    throw error;
  }
};

export const saveGeneralSettings = async (settings: {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
}): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const docRef = doc(db, "site-config", "general-settings");
    await setDoc(docRef, settings);
  } catch (error) {
    console.error("Error saving general settings:", error);
    throw error;
  }
};

// Admin user management
export const createAdminUser = async (
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const userRef = doc(db, "admin-users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        name: userName,
        email: "", // You can add email if available
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Admin user created:", userId);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

// Get all site configuration
export const getSiteConfig = async (): Promise<SiteConfig> => {
  try {
    const db = getFirebaseDB();
    // This is a simplified example. You'd likely fetch individual configs.
    const themeColors = (await getThemeConfig())?.light || getDefaultColors();
    const bannerImages = (await getBannerImages()) || [];
    const tileImages = (await getTileImages()) || [];
    const generalSettings = (await getGeneralSettings()) || {
      siteName: "Tripesa Safari",
      siteDescription: "AI-powered safari discovery",
      contactEmail: "info@tripesa.co",
      contactPhone: "+256 123 456 789",
    };

    return {
      themeColors: themeColors,
      bannerImages: bannerImages,
      tileImages: tileImages,
      generalSettings: generalSettings,
    };
  } catch (error) {
    console.error("Error getting site config:", error);
    throw error;
  }
};

export const getThemeVersions = async (
  limitCount: number = 10
): Promise<ThemeVersion[]> => {
  try {
    const db = getFirebaseDB();
    const versionsQuery = query(
      collection(db, "theme-versions"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(versionsQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as ThemeVersion[];
  } catch (error) {
    console.error("Error getting theme versions:", error);
    throw error;
  }
};

export const getThemeConfig = async (): Promise<ThemeConfig | null> => {
  const db = getFirebaseDB();
  const docRef = doc(db, "site-config", "theme-config");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as ThemeConfig;
  }

  return null;
};

export const saveThemeConfig = async (
  config: Omit<ThemeConfig, "createdAt" | "updatedAt" | "version">,
  userId: string,
  userName: string,
  description?: string
): Promise<void> => {
  const db = getFirebaseDB();
  const currentConfig = await getThemeConfig();
  const newVersion = (currentConfig?.version || 0) + 1;

  const newConfig: ThemeConfig = {
    ...config,
    version: newVersion,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
  };

  await setDoc(doc(db, "site-config", "theme-config"), newConfig);

  const versionDoc: Omit<ThemeVersion, "id"> = {
    light: config.light,
    dark: config.dark,
    createdAt: new Date(),
    createdBy: userId,
    createdByName: userName,
    version: newVersion,
    description,
    isActive: true,
  };

  await addDoc(collection(db, "theme-versions"), versionDoc);
};

export const getDefaultColors = (): ThemeColors => ({
  primary: "#f97316",
  secondary: "#64748b",
  accent: "#8b5cf6",
  background: "#ffffff",
  text: "#1f2937",
  muted: "#6b7280",
});

export const getDefaultDarkColors = (): ThemeColors => ({
  primary: "#f97316",
  secondary: "#94a3b8",
  accent: "#a78bfa",
  background: "#0f172a",
  text: "#f1f5f9",
  muted: "#64748b",
});

export const rollbackToVersion = async (
  versionId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const db = getFirebaseDB();
    const versionDoc = await getDoc(doc(db, "theme-versions", versionId));
    if (!versionDoc.exists()) {
      throw new Error("Version not found");
    }

    const versionData = versionDoc.data() as ThemeVersion;
    const newConfig = {
      light: versionData.light,
      dark: versionData.dark,
      isActive: true,
      createdBy: userId,
    };

    await saveThemeConfig(
      newConfig,
      userId,
      userName,
      `Rollback to version ${versionData.version}`
    );
  } catch (error) {
    console.error("Error rolling back theme version:", error);
    throw error;
  }
};
