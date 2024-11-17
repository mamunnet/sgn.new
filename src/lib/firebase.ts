import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Create admin user if it doesn't exist
const setupAdminUser = async () => {
  try {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Admin email not configured');
      return;
    }

    // Only attempt to create admin in development
    if (import.meta.env.DEV) {
      await createUserWithEmailAndPassword(auth, adminEmail, 'Mamunnet@#13');
      console.log('Admin user created successfully');
    }
  } catch (error: any) {
    // If error code is 'auth/email-already-in-use', that's fine - admin already exists
    if (error.code !== 'auth/email-already-in-use') {
      console.error('Error creating admin user:', error);
    }
  }
};

setupAdminUser();