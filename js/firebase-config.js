// =============================================
// KONFIGURASI FIREBASE
// =============================================
// Ambil dari: Firebase Console -> Project Settings -> General
// -> scroll ke "Your apps" -> Web app -> SDK setup and configuration
//
// CATATAN: config ini AMAN untuk public/GitHub, beda dengan password
// database SQL. Firebase apiKey bukan secret — keamanan data diatur
// lewat Firestore Security Rules (lihat firestore.rules), bukan
// dengan menyembunyikan config ini.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXzPdaTb54WUm71P6CduE9fAum0zurzIc",
  authDomain: "taskkampus-2a3ab.firebaseapp.com",
  projectId: "taskkampus-2a3ab",
  storageBucket: "taskkampus-2a3ab.firebasestorage.app",
  messagingSenderId: "391052843338",
  appId: "1:391052843338:web:3b9c3312879acf36c189b3",
  measurementId: "G-S7F96Q5KLJ"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
