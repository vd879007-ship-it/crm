import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDhcI9IZKzvOMFY3zJar-jHtehhykyVLcs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'crm-software-27816.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'crm-software-27816',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'crm-software-27816.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '139854306461',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:139854306461:web:2d259c5707fc0398108874'
};

// Initialize Firebase safely without duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface TelephonyCallRecord {
  id?: string;
  callId?: string;
  providerCallId?: string;
  contactName: string;
  phoneNumber: string;
  direction: 'Outbound' | 'Inbound';
  durationSeconds: number;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';
  agentName: string;
  sentiment?: string;
  notes?: string;
  tags?: string[];
  hasRecording?: boolean;
  recordingUrl?: string | null;
  recordingSid?: string | null;
  recordingDuration?: number;
  timestamp?: string;
  createdAt?: any;
  updatedAt?: any;
}

const CALLS_COLLECTION = 'telephony_calls';

/**
 * Save a new telephony call record to Firebase Firestore (writes to both telephony_calls and call_logs)
 */
export async function saveCallRecordToFirebase(callData: TelephonyCallRecord): Promise<string> {
  try {
    const docData = {
      ...callData,
      durationSeconds: Number(callData.durationSeconds) || 0,
      hasRecording: Boolean(callData.hasRecording || callData.recordingUrl),
      recordingUrl: callData.recordingUrl || null,
      timestamp: callData.timestamp || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 1. Save to telephony_calls
    if (callData.callId) {
      await setDoc(doc(db, 'telephony_calls', callData.callId), docData, { merge: true });
    } else {
      await addDoc(collection(db, 'telephony_calls'), docData);
    }

    // 2. Also save to call_logs for cross-compatibility
    try {
      if (callData.callId) {
        await setDoc(doc(db, 'call_logs', callData.callId), docData, { merge: true });
      } else {
        await addDoc(collection(db, 'call_logs'), docData);
      }
    } catch (e) {}

    return callData.callId || '';
  } catch (error: any) {
    console.warn('Firebase Firestore write notice (Check Firestore Rules):', error.message);
    return '';
  }
}

/**
 * Update call recording & status in Firebase Firestore
 */
export async function updateCallRecordingInFirebase(
  providerCallId: string, 
  recordingUrl: string, 
  recordingSid?: string,
  durationSeconds?: number
): Promise<void> {
  const updatePayload = {
    hasRecording: true,
    recordingUrl,
    recordingSid: recordingSid || null,
    durationSeconds: durationSeconds || 0,
    status: 'completed',
    updatedAt: serverTimestamp()
  };

  try {
    // Update in telephony_calls
    const snap1 = await getDocs(collection(db, 'telephony_calls'));
    const target1 = snap1.docs.find(d => d.data().providerCallId === providerCallId || d.id === providerCallId);
    if (target1) {
      await updateDoc(doc(db, 'telephony_calls', target1.id), updatePayload);
    }

    // Update in call_logs
    const snap2 = await getDocs(collection(db, 'call_logs'));
    const target2 = snap2.docs.find(d => d.data().providerCallId === providerCallId || d.id === providerCallId);
    if (target2) {
      await updateDoc(doc(db, 'call_logs', target2.id), updatePayload);
    }
  } catch (err: any) {
    console.warn('Firebase Firestore update notice:', err.message);
  }
}

/**
 * Real-time listener for call records from Firebase Firestore
 */
export function subscribeToCallRecords(callback: (calls: TelephonyCallRecord[]) => void): () => void {
  try {
    const q = query(collection(db, CALLS_COLLECTION), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const list: TelephonyCallRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          callId: data.callId || docSnap.id,
          providerCallId: data.providerCallId || '',
          contactName: data.contactName || 'Customer Prospect',
          phoneNumber: data.phoneNumber || '',
          direction: data.direction || 'Outbound',
          durationSeconds: Number(data.durationSeconds) || 0,
          status: data.status || 'completed',
          agentName: data.agentName || 'Super Admin',
          sentiment: data.sentiment || 'Positive',
          notes: data.notes || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          hasRecording: Boolean(data.hasRecording || data.recordingUrl),
          recordingUrl: data.recordingUrl || null,
          recordingSid: data.recordingSid || null,
          recordingDuration: Number(data.recordingDuration) || 0,
          timestamp: data.timestamp || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      callback(list);
    }, (error) => {
      console.warn('Firebase onSnapshot notice (falling back to API):', error.message);
    });
  } catch (err) {
    console.warn('Firebase subscription error:', err);
    return () => {};
  }
}

export default app;
