import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let firestore: Firestore | null = null;

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

function hasApplicationDefaultCredentials() {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

export function isFirebaseConfigured() {
  return hasApplicationDefaultCredentials() || getFirebaseConfig() !== null;
}

export function getFirebaseFirestore() {
  if (firestore) {
    return firestore;
  }

  const config = getFirebaseConfig();
  const credential = hasApplicationDefaultCredentials()
    ? applicationDefault()
    : config
      ? cert(config)
      : null;

  if (!credential) {
    throw new Error('Firebase is not configured. Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file.');
  }

  const app = getApps()[0] ?? initializeApp({ credential });
  firestore = getFirestore(app);
  return firestore;
}

export async function checkFirebaseConnection() {
  const database = getFirebaseFirestore();
  await database.collection('_system').doc('health').set({ checkedAt: new Date() }, { merge: true });
  return true;
}
