import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let database: Database | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Initialize Firebase only on client side and only if configured
if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  database = getDatabase(app);
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, database, googleProvider, isFirebaseConfigured };
