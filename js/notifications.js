// =============================================
// PUSH NOTIFICATION HELPER
// =============================================
import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function requestNotifPermission(user) {
  if (!("Notification" in window)) return null;
  if (!("serviceWorker" in navigator)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    // Path relatif — works di GitHub Pages maupun domain custom
    const reg = await navigator.serviceWorker.register("sw.js");
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.warn("Service worker error:", err);
    return null;
  }
}

// Notif lokal — tampilkan kalau ada tugas deadline dalam 24 jam
export function scheduleLocalNotif(tugasList) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date();
  const batas = new Date(now.getTime() + 24 * 3600 * 1000);
  tugasList.forEach(t => {
    const dl = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline);
    if (t.status !== "selesai" && dl > now && dl <= batas) {
      const sisaJam = Math.ceil((dl - now) / 3600000);
      new Notification("⏰ TaskKampus — Deadline Mendekat!", {
        body: `"${t.judul}" deadline dalam ${sisaJam} jam lagi!`,
      });
    }
  });
}
