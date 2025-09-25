import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCZzezT2nbjRbSfCquzORX_p6BrcReAKh0",
  authDomain: "ai-internship-11537.firebaseapp.com",
  projectId: "ai-internship-11537",
  storageBucket: "ai-internship-11537.firebasestorage.app",
  messagingSenderId: "79717909178",
  appId: "1:79717909178:web:ca7dbfc871192ac8113883",
  measurementId: "G-MR4K5Z6GSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
