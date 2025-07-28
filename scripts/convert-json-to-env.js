const fs = require('fs');

function convertJsonToEnv() {
    console.log('🔄 Converting JSON files to environment variables...\n');

    try {
        // Read Google Analytics JSON
        if (fs.existsSync('google-analytics-key.json')) {
            const gaJson = fs.readFileSync('google-analytics-key.json', 'utf8');
            const gaEnv = `GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY=${JSON.stringify(JSON.parse(gaJson))}`;

            console.log('📊 Google Analytics Environment Variable:');
            console.log('='.repeat(80));
            console.log(gaEnv);
            console.log('='.repeat(80));
            console.log('\n');
        } else {
            console.log('❌ google-analytics-key.json not found');
        }

        // Read Firebase JSON
        if (fs.existsSync('firebase-service-account-key.json')) {
            const fbJson = fs.readFileSync('firebase-service-account-key.json', 'utf8');
            const fbEnv = `FIREBASE_SERVICE_ACCOUNT_KEY=${JSON.stringify(JSON.parse(fbJson))}`;

            console.log('🔥 Firebase Environment Variable:');
            console.log('='.repeat(80));
            console.log(fbEnv);
            console.log('='.repeat(80));
            console.log('\n');
        } else {
            console.log('❌ firebase-service-account-key.json not found');
        }

        console.log('✅ Copy these lines to your .env.local file');
        console.log('💡 Make sure to remove the JSON files after adding these to .env.local');

    } catch (error) {
        console.error('❌ Error converting JSON files:', error.message);
    }
}

convertJsonToEnv(); 