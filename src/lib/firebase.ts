import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Ensure environment variables are available
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// Check if any required env vars are missing
const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error('Missing required Firebase configuration');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with retry logic
let app;
let retryCount = 0;
const maxRetries = 3;

const initializeFirebase = async () => {
  while (retryCount < maxRetries) {
    try {
      app = initializeApp(firebaseConfig);
      break;
    } catch (error) {
      retryCount++;
      if (retryCount === maxRetries) {
        console.error('Failed to initialize Firebase after multiple attempts:', error);
        throw error;
      }
      console.warn(`Firebase initialization attempt ${retryCount} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Create admin user if it doesn't exist (only in development)
const setupAdminUser = async () => {
  try {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Admin email not configured');
      return;
    }

    if (import.meta.env.DEV) {
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, 'Mamunnet@#13');
        console.log('Admin user created successfully');
      } catch (error: any) {
        // Only log error if it's not "email already in use"
        if (error.code !== 'auth/email-already-in-use') {
          console.error('Error creating admin user:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in setupAdminUser:', error);
  }
};

// Initialize admin user with retry logic
let adminRetryCount = 0;
const maxAdminRetries = 3;

const initializeAdminUser = async () => {
  while (adminRetryCount < maxAdminRetries) {
    try {
      await setupAdminUser();
      break;
    } catch (error) {
      adminRetryCount++;
      if (adminRetryCount === maxAdminRetries) {
        console.error('Failed to initialize admin user after multiple attempts:', error);
        break;
      }
      console.warn(`Admin user initialization attempt ${adminRetryCount} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * adminRetryCount));
    }
  }
};

initializeAdminUser();