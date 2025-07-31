import {
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

// Enhanced Theme Colors Management
export const getThemeConfig = async (): Promise<ThemeConfig | null> => {
  try {
    const docRef = doc(db, "site-config", "theme-config");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ThemeConfig;
    }
    return null;
  } catch (error) {
    console.error("Error getting theme config:", error);
    throw error;
  }
};

export const getThemeColors = async (
  mode: "light" | "dark" = "light"
): Promise<ThemeColors | null> => {
  try {
    const config = await getThemeConfig();
    if (config) {
      return config[mode];
    }
    return null;
  } catch (error) {
    console.error("Error getting theme colors:", error);
    throw error;
  }
};

export const saveThemeConfig = async (
  config: Omit<ThemeConfig, "createdAt" | "updatedAt" | "version">,
  userId: string,
  userName: string,
  description?: string
): Promise<void> => {
  try {
    const currentConfig = await getThemeConfig();
    const newVersion = (currentConfig?.version || 0) + 1;

    const newConfig: ThemeConfig = {
      ...config,
      version: newVersion,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save current config
    await setDoc(doc(db, "site-config", "theme-config"), newConfig);

    // Save version history
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

    // Deactivate previous versions
    if (currentConfig) {
      const versionsQuery = query(
        collection(db, "theme-versions"),
        where("isActive", "==", true),
        where("version", "!=", newVersion)
      );
      const versionsSnapshot = await getDocs(versionsQuery);

      const batch = writeBatch(db);
      versionsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isActive: false });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error("Error saving theme config:", error);
    throw error;
  }
};

export const saveThemeColors = async (
  colors: ThemeColors,
  mode: "light" | "dark" = "light",
  userId: string,
  userName: string,
  description?: string
): Promise<void> => {
  try {
    const currentConfig = await getThemeConfig();
    const newConfig = {
      light:
        mode === "light" ? colors : currentConfig?.light || getDefaultColors(),
      dark:
        mode === "dark"
          ? colors
          : currentConfig?.dark || getDefaultDarkColors(),
      isActive: true,
      createdBy: userId,
    };

    await saveThemeConfig(newConfig, userId, userName, description);
  } catch (error) {
    console.error("Error saving theme colors:", error);
    throw error;
  }
};

export const getThemeVersions = async (
  limitCount: number = 10
): Promise<ThemeVersion[]> => {
  try {
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

export const rollbackToVersion = async (
  versionId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
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

export const getDefaultColors = (): ThemeColors => ({
  primary: "#171717", // 0 0% 9% - matches --primary in light mode
  secondary: "#f5f5f5", // 0 0% 96.1% - matches --secondary in light mode
  accent: "#f5f5f5", // 0 0% 96.1% - matches --accent in light mode
  background: "#F4F3F2", // Updated from pure white to warm off-white
  text: "#0a0a0a", // 0 0% 3.9% - matches --foreground in light mode
  muted: "#737373", // 0 0% 45.1% - matches --muted-foreground in light mode
});

export const getDefaultDarkColors = (): ThemeColors => ({
  primary: "#fafafa", // 0 0% 98% - matches --primary in dark mode
  secondary: "#262626", // 0 0% 14.9% - matches --secondary in dark mode
  accent: "#262626", // 0 0% 14.9% - matches --accent in dark mode
  background: "#0a0a0a", // 0 0% 3.9% - matches --background in dark mode
  text: "#fafafa", // 0 0% 98% - matches --foreground in dark mode
  muted: "#a3a3a3", // 0 0% 63.9% - matches --muted-foreground in dark mode
});

// Enhanced Banner Management
export const getBannerConfig = async (): Promise<BannerConfig | null> => {
  try {
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
    await setDoc(doc(db, "site-config", "banner-config"), newConfig);

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

    await addDoc(collection(db, "banner-versions"), versionDoc);

    // Deactivate previous versions
    if (currentConfig) {
      const versionsQuery = query(
        collection(db, "banner-versions"),
        where("isActive", "==", true),
        where("version", "!=", newVersion)
      );
      const versionsSnapshot = await getDocs(versionsQuery);

      const batch = writeBatch(db);
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
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    }
    // Note: External links can't be deleted, so we just return
  } catch (error) {
    console.error("Error deleting banner image:", error);
    throw error;
  }
};

export const getDefaultBannerConfig = (): Omit<
  BannerConfig,
  "createdAt" | "updatedAt" | "version"
> => ({
  images: [
    {
      id: "1",
      url: "https://ik.imagekit.io/54hg3nvcfg/zdenek-machacek-UxHol6SwLyM-unsplash.jpg?updatedAt=1752094873385",
      alt: "Safari landscape",
      title: "Discover Africa's Greatest Adventures",
      description:
        "AI-powered safari discovery that connects you to unforgettable experiences",
      order: 1,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "2",
      url: "https://ik.imagekit.io/54hg3nvcfg/redcharlie-xtvo0ffGKlI-unsplash.jpg?updatedAt=1752094873358",
      alt: "Wildlife photography",
      title: "Unforgettable Wildlife Encounters",
      description:
        "Experience the magic of African wildlife in their natural habitat",
      order: 2,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "3",
      url: "https://ik.imagekit.io/54hg3nvcfg/max-christian-sMjVNtvYkD0-unsplash.jpg?updatedAt=1752095287325",
      alt: "African wildlife",
      title: "Explore the Wild",
      description: "Journey through Africa's most spectacular landscapes",
      order: 3,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "4",
      url: "https://ik.imagekit.io/54hg3nvcfg/photos-by-beks-B3fLaAAy6nU-unsplash.jpg?updatedAt=1752095287350",
      alt: "Safari adventure",
      title: "Adventure Awaits",
      description: "Discover the thrill of authentic safari experiences",
      order: 4,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "5",
      url: "https://ik.imagekit.io/54hg3nvcfg/deon-de-villiers-7HRHhcueqZ8-unsplash.jpg?updatedAt=1752095287743",
      alt: "African plains",
      title: "Vast Landscapes",
      description: "Experience the breathtaking beauty of Africa's open plains",
      order: 5,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "6",
      url: "https://ik.imagekit.io/54hg3nvcfg/sutirta-budiman-PdiOj8kRy28-unsplash.jpg?updatedAt=1752095287980",
      alt: "Wildlife safari",
      title: "Wildlife Wonders",
      description: "Get up close with Africa's most magnificent creatures",
      order: 6,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "7",
      url: "https://ik.imagekit.io/54hg3nvcfg/clinton-mwebaze-bFDRtkC9Hmw-unsplash.jpg?updatedAt=1752095582636",
      alt: "Safari experience",
      title: "Unforgettable Moments",
      description: "Create memories that will last a lifetime",
      order: 7,
      createdAt: new Date(),
      isUploaded: false,
    },
    {
      id: "8",
      url: "https://ik.imagekit.io/54hg3nvcfg/nathan-cima-k3iU3W5QkBQ-unsplash.jpg?updatedAt=1752095583994",
      alt: "African adventure",
      title: "Epic Journeys",
      description: "Embark on the adventure of a lifetime across Africa",
      order: 8,
      createdAt: new Date(),
      isUploaded: false,
    },
  ],
  text: {
    mainTitle: "Discover Africa's",
    subtitle: "Greatest Adventures",
    description:
      "AI-powered safari discovery that connects you to unforgettable experiences across the African continent",
  },
  settings: {
    transitionDuration: 5,
    autoplay: true,
    autoplayInterval: 5,
    showIndicators: true,
    showArrows: true,
  },
  isActive: true,
  createdBy: "system",
});

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

// Admin user management
export const createAdminUser = async (
  userId: string,
  userName: string
): Promise<void> => {
  try {
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
