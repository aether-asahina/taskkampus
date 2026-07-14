// =============================================
// PUSH NOTIFICATION HELPER
// Pakai Firebase Cloud Messaging (FCM)
// =============================================
import { auth } from "./firebase-config.js";
import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// VAPID Key: ambil dari Firebase Console ->
// Project Settings -> Cloud Messaging -> Web Push certificates -> Key pair
const VAPID_KEY = "GANTI_DENGAN_VAPID_KEY_KAMU";

export async function requestNotifPermission(user) {
  if (!("Notification" in window)) return null;
  if (!("serviceWorker" in navigator)) return null;

  // Register service worker
  const reg = await navigator.serviceWorker.register("/sw.js");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const { getMessaging, getToken } = await import(
      "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging.js"
    );
    const { initializeApp, getApps } = await import(
      "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js"
    );

    const apps = getApps();
    const messaging = getMessaging(apps[0]);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg,
    });

    if (token) {
      // Simpan token ke Firestore supaya bisa dikirim notif nanti
      await setDoc(doc(db, "fcm_tokens", user.uid), {
        token,
        updatedAt: new Date(),
      });
    }
    return token;
  } catch (err) {
    console.warn("FCM token error:", err);
    return null;
  }
}

// Cek deadline dalam X jam ke depan, tampilkan notif lokal
export function scheduleLocalNotif(tugasList) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  const batas24 = new Date(now.getTime() + 24 * 3600 * 1000);

  tugasList.forEach(t => {
    const dl = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline);
    if (t.status !== "selesai" && dl > now && dl <= batas24) {
      const sisaJam = Math.ceil((dl - now) / 3600000);
      new Notification("⏰ TaskKampus — Deadline Mendekat!", {
        body: `"${t.judul}" deadline dalam ${sisaJam} jam lagi!`,
        icon: "/icon.png",
      });
    }
  });
}

