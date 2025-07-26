import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./config";

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

// Theme Colors Management
export const getThemeColors = async (): Promise<ThemeColors | null> => {
  try {
    const docRef = doc(db, "site-config", "theme-colors");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ThemeColors;
    }
    return null;
  } catch (error) {
    console.error("Error getting theme colors:", error);
    throw error;
  }
};

export const saveThemeColors = async (colors: ThemeColors): Promise<void> => {
  try {
    await setDoc(doc(db, "site-config", "theme-colors"), colors);
  } catch (error) {
    console.error("Error saving theme colors:", error);
    throw error;
  }
};

// Banner Images Management
export const getBannerImages = async (): Promise<BannerImage[]> => {
  try {
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
    await setDoc(doc(db, "site-config", "banner-images"), { images });
  } catch (error) {
    console.error("Error saving banner images:", error);
    throw error;
  }
};

export const uploadBannerImage = async (file: File): Promise<string> => {
  try {
    const fileName = `banners/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading banner image:", error);
    throw error;
  }
};

export const deleteBannerImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `banners/${fileName}`;

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting banner image:", error);
    throw error;
  }
};

// Tile Images Management
export const getTileImages = async (): Promise<TileImage[]> => {
  try {
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
    await setDoc(doc(db, "site-config", "tile-images"), { images });
  } catch (error) {
    console.error("Error saving tile images:", error);
    throw error;
  }
};

export const uploadTileImage = async (file: File): Promise<string> => {
  try {
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
    await setDoc(doc(db, "site-config", "general-settings"), settings);
  } catch (error) {
    console.error("Error saving general settings:", error);
    throw error;
  }
};

// Get all site configuration
export const getSiteConfig = async (): Promise<SiteConfig> => {
  try {
    const [themeColors, bannerImages, tileImages, generalSettings] =
      await Promise.all([
        getThemeColors(),
        getBannerImages(),
        getTileImages(),
        getGeneralSettings(),
      ]);

    return {
      themeColors: themeColors || {
        primary: "#f97316",
        secondary: "#64748b",
        accent: "#8b5cf6",
        background: "#ffffff",
        text: "#1f2937",
        muted: "#6b7280",
      },
      bannerImages: bannerImages || [],
      tileImages: tileImages || [],
      generalSettings: generalSettings || {
        siteName: "Tripesa Safari",
        siteDescription: "AI-powered safari discovery",
        contactEmail: "info@tripesa.co",
        contactPhone: "+256 123 456 789",
      },
    };
  } catch (error) {
    console.error("Error getting site config:", error);
    throw error;
  }
};
