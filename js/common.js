// =============================================
// HELPER UMUM (dipakai di semua halaman)
// =============================================
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Wajib login untuk akses halaman ini. Panggil di tiap halaman app.
// callback(user) dijalankan setelah user dipastikan login.
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      callback(user);
    }
  });
}

// Kalau sudah login tapi buka halaman login/register, redirect ke dashboard.
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
  });
}

export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}

export function sanitize(val) {
  const div = document.createElement("div");
  div.textContent = val ?? "";
  return div.innerHTML;
}

export function formatTanggal(date) {
  if (!date) return "-";
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// Ambil SEMUA tugas milik user (filter/sort dilakukan di JS, bukan di query,
// supaya tidak kena batasan composite index Firestore)
export async function getAllTugas(uid) {
  const q = query(collection(db, "tugas"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function hitungStats(tugasList) {
  const now = new Date();
  const stats = { total: 0, selesai: 0, proses: 0, belum: 0, terlambat: 0 };
  tugasList.forEach(t => {
    stats.total++;
    if (t.status === "selesai") stats.selesai++;
    if (t.status === "proses") stats.proses++;
    if (t.status === "belum") stats.belum++;
    const dl = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline);
    if (dl < now && t.status !== "selesai") stats.terlambat++;
  });
  return stats;
}

export function getNotifikasi(tugasList) {
  const now = new Date();
  const batas = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return tugasList
    .filter(t => {
      const dl = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline);
      return t.status !== "selesai" && dl >= now && dl <= batas;
    })
    .sort((a, b) => toDate(a.deadline) - toDate(b.deadline));
}

export function toDate(deadline) {
  return deadline?.toDate ? deadline.toDate() : new Date(deadline);
}

// Render sidebar navigasi ke dalam elemen #sidebar-container
export function renderSidebar(activePage, namaUser, jumlahNotif) {
  const el = document.getElementById("sidebar-container");
  if (!el) return;
  el.innerHTML = `
    <nav class="sidebar">
      <div class="logo">
        <h1>Task<span>Kampus</span></h1>
        <p>Manajemen Tugas Kuliah</p>
      </div>
      <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
        <span class="icon">📋</span> Dashboard
      </a>
      <a href="tambah.html" class="nav-item ${activePage === 'tambah' ? 'active' : ''}">
        <span class="icon">➕</span> Tambah Tugas
      </a>
      <a href="notifikasi.html" class="nav-item ${activePage === 'notifikasi' ? 'active' : ''}">
        <span class="icon">🔔</span> Notifikasi
        ${jumlahNotif > 0 ? `<span class="notif-badge">${jumlahNotif}</span>` : ''}
      </a>
      <div class="sidebar-user">
        <strong>${sanitize(namaUser)}</strong>
        <a href="#" id="btn-logout">Keluar →</a>
      </div>
    </nav>
  `;
  document.getElementById("btn-logout").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}
