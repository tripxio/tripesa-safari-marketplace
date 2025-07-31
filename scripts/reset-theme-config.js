// Script to reset Firebase theme configuration to new defaults
// Run this in your browser console or as a Node.js script

import { getDefaultColors, getDefaultDarkColors, saveThemeConfig } from './lib/firebase/config-service.js';

async function resetThemeConfig() {
    try {
        const newConfig = {
            light: getDefaultColors(),
            dark: getDefaultDarkColors(),
            isActive: true,
            createdBy: "system",
        };

        await saveThemeConfig(newConfig, "system", "System", "Reset to new default colors");
        console.log("Theme configuration reset successfully!");
    } catch (error) {
        console.error("Error resetting theme config:", error);
    }
}

// Uncomment to run:
// resetThemeConfig(); 