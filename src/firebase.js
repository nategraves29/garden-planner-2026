import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzahuQPThYJLkIx9ZSIQhOlJK-5Ls_d5o",
  authDomain: "garden-planner-2026.firebaseapp.com",
  projectId: "garden-planner-2026",
  storageBucket: "garden-planner-2026.firebasestorage.app",
  messagingSenderId: "870905095059",
  appId: "1:870905095059:web:4750697145cf99e1defe66"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
