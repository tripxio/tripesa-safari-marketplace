import { getFirebaseInstances } from "./init";

// Get Firebase instances using the singleton pattern
const { app, auth, db, storage, analytics } = getFirebaseInstances();

// Export the instances
export { app, auth, db, storage, analytics };

// Check if analytics is supported
export const isAnalyticsSupported = async () => {
  if (typeof window === "undefined") return false;
  const { isSupported } = await import("firebase/analytics");
  return await isSupported();
};

export default app;
