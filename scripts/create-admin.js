const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser(email, password, name, role = 'super-admin') {
    try {
        console.log('Creating admin user...');

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ User created in Firebase Auth:', user.uid);

        // Create admin user document in Firestore
        const adminUser = {
            email: email,
            role: role,
            name: name,
            twoFactorEnabled: false,
            createdAt: new Date(),
            isActive: true,
        };

        await setDoc(doc(db, 'admin-users', user.uid), adminUser);

        console.log('✅ Admin user document created in Firestore');
        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('User Details:');
        console.log('- Email:', email);
        console.log('- Name:', name);
        console.log('- Role:', role);
        console.log('- UID:', user.uid);
        console.log('');
        console.log('You can now log in to the admin dashboard at: /admin/login');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);

        if (error.code === 'auth/email-already-in-use') {
            console.log('This email is already registered. You may need to add the user to the admin collection manually.');
        }
    }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('Usage: node scripts/create-admin.js <email> <password> <name> [role]');
    console.log('');
    console.log('Example:');
    console.log('node scripts/create-admin.js admin@tripesa.co mypassword "Admin User" super-admin');
    console.log('');
    console.log('Roles: admin, super-admin (default: super-admin)');
    process.exit(1);
}

const [email, password, name, role = 'super-admin'] = args;

// Validate email
if (!email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
}

// Validate password
if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
}

// Validate role
if (!['admin', 'super-admin'].includes(role)) {
    console.error('❌ Invalid role. Must be "admin" or "super-admin"');
    process.exit(1);
}

console.log('Creating admin user with the following details:');
console.log('- Email:', email);
console.log('- Name:', name);
console.log('- Role:', role);
console.log('');

createAdminUser(email, password, name, role); 