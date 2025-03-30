import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHOJtKIGyBEy6oY9RtqU8W1vvtToIS2ao",
  authDomain: "empyrean-surge-453502-k6.firebaseapp.com",
  projectId: "empyrean-surge-453502-k6",
  storageBucket: "empyrean-surge-453502-k6.firebasestorage.app",
  messagingSenderId: "1048387947782",
  appId: "1:1048387947782:web:47f517fb00521024a72287",
  measurementId: "G-P23FN7S8VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;