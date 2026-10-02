import dotenv from 'dotenv';
import { checkFirebaseConnection } from './firebase';

dotenv.config();

checkFirebaseConnection()
  .then(() => {
    console.log('Firebase Firestore connection is working.');
  })
  .catch((error: unknown) => {
    console.error('Firebase Firestore connection failed:', error);
    process.exitCode = 1;
  });
