#!/usr/bin/env node

/**
 * 🦁 Safari Service Worker Testing Script
 * 
 * This script helps you test the offline functionality of your safari marketplace.
 * Run this after starting your development server.
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
🦁 TRIPESA SAFARI OFFLINE TESTING GUIDE
=======================================

To test your safari service worker:

1. 🚀 Start your development server:
   npm run dev

2. 🌐 Open your browser to http://localhost:3000

3. 🔧 Open Chrome DevTools (F12)

4. 📱 Test PWA Installation:
   - Go to Application tab > Manifest
   - Click "Install" if available
   - Or look for install prompt in address bar

5. 🔌 Test Offline Mode:
   - Go to Application tab > Service Workers
   - Check "Offline" checkbox
   - OR go to Network tab > throttling > Offline

6. 🦒 Test Offline Features:
   - Navigate to /tours (should show cached tours)
   - Navigate to /offline (should show safari animations)
   - Try reconnecting by unchecking offline mode

7. 📦 Test Caching:
   - Go to Application tab > Storage > Cache Storage
   - See "tripesa-safari-v1", "tripesa-tours-v1", "tripesa-images-v1"

8. 🎯 Test Background Sync:
   - Go offline, try to load tours
   - Go back online, watch console for sync messages

SAFARI FEATURES TO VERIFY:
========================
✅ Animated safari animals on offline page
✅ Safari facts rotating every 10 seconds  
✅ Connection checker with retry button
✅ Toast notifications with animal emojis
✅ Floating animal animations
✅ PWA install prompts
✅ Offline indicator in bottom-left
✅ Cached tour browsing when offline

🏕️ Happy testing, safari explorer! 🦁
`);

rl.question('\nPress Enter to open Chrome DevTools documentation...', () => {
    console.log('\n🌐 Opening Chrome DevTools Service Worker documentation...');

    const url = 'https://developer.chrome.com/docs/devtools/progressive-web-apps/';

    // Cross-platform open command
    const command = process.platform === 'win32' ? 'start' :
        process.platform === 'darwin' ? 'open' : 'xdg-open';

    exec(`${command} ${url}`, (error) => {
        if (error) {
            console.log(`\n📖 Manual link: ${url}`);
        } else {
            console.log('\n✅ Documentation opened in browser!');
        }

        console.log('\n🦁 May your safari testing be adventure-filled!');
        rl.close();
    });
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
    console.log('\n\n🏕️ Safari testing expedition ended. Until next time!');
    process.exit(0);
}); 