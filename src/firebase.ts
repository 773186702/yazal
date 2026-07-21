import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork } from 'firebase/firestore';
import { getPerformance, trace } from 'firebase/performance';
import jsonConfig from '../firebase-applet-config.json';

const env = (import.meta as any).env || {};

// Construct Firebase configuration with Vercel/Vite environment variable priority & fallback to applet json
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || jsonConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || jsonConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || jsonConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || jsonConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || jsonConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || jsonConfig.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || jsonConfig.measurementId || '',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (jsonConfig as any).firestoreDatabaseId || ''
};

// Initialize the Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined); /* CRITICAL: The app will break without this line */
enableNetwork(db).catch((err) => console.warn("Firestore enableNetwork warning (likely offline):", err));
export const auth = getAuth(app);

// Initialize Firebase Performance Monitoring
export let perf: any = null;
try {
  if (typeof window !== 'undefined') {
    perf = getPerformance(app);
    console.log("Firebase Performance Monitoring initialized successfully.");
  }
} catch (error) {
  console.warn("Firebase Performance Monitoring is not supported in this environment:", error);
}

/**
 * Start a custom performance trace by name.
 * Returns an object with a safe stop method to prevent double-stopping errors.
 */
export function startPerformanceTrace(traceName: string) {
  if (!perf) return null;
  try {
    const t = trace(perf, traceName);
    t.start();
    let stopped = false;
    return {
      stop: () => {
        if (!stopped) {
          stopped = true;
          try {
            t.stop();
          } catch (err) {
            console.warn(`Safe Performance Warning: Could not stop trace '${traceName}':`, err);
          }
        }
      },
      innerTrace: t
    };
  } catch (err) {
    console.error(`Failed to start performance trace ${traceName}:`, err);
    return null;
  }
}

/**
 * Measure the performance of a given async function block with a trace.
 */
export async function measurePerformance<T>(traceName: string, fn: () => Promise<T>): Promise<T> {
  const t = startPerformanceTrace(traceName);
  try {
    return await fn();
  } finally {
    if (t) {
      t.stop();
    }
  }
}

// Start app load trace as early as possible
export const appLoadTrace = startPerformanceTrace('app_load_time');

// Operational types for structured Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Structured Firestore error handler conforming precisely to zero-trust skill guidelines.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
