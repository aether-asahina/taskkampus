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
  apiKey: "GANTI_DENGAN_API_KEY_KAMU",
  authDomain: "GANTI.firebaseapp.com",
  projectId: "GANTI_PROJECT_ID",
  storageBucket: "GANTI.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
