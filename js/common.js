// =============================================
// HELPER UMUM v2
// =============================================
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";
    else callback(user);
  });
}

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
  const d = date instanceof Date ? date : date.toDate?.() ?? new Date(date);
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export function toDate(deadline) {
  if (!deadline) return new Date(0);
  return deadline?.toDate ? deadline.toDate() : new Date(deadline);
}

export async function getAllTugas(uid) {
  const q = query(collection(db, "tugas"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function hitungStats(list) {
  const now = new Date();
  const s = { total: 0, selesai: 0, proses: 0, belum: 0, terlambat: 0 };
  list.forEach(t => {
    s.total++;
    s[t.status] = (s[t.status] || 0) + 1;
    const dl = toDate(t.deadline);
    if (dl < now && t.status !== "selesai") s.terlambat++;
  });
  return s;
}

export function getNotifikasi(list) {
  const now = new Date();
  const batas = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
  return list
    .filter(t => {
      const dl = toDate(t.deadline);
      return t.status !== "selesai" && dl >= now && dl <= batas;
    })
    .sort((a, b) => toDate(a.deadline) - toDate(b.deadline));
}

export function renderSidebar(activePage, namaUser, jumlahNotif) {
  const el = document.getElementById("sidebar-container");
  if (!el) return;
  el.innerHTML = `
    <nav class="sidebar">
      <div class="logo">
        <h1>Task<span>Kampus</span></h1>
        <p>Manajemen Tugas Kuliah</p>
      </div>
      <a href="dashboard.html" class="nav-item ${activePage==='dashboard'?'active':''}">
        <span class="icon">📋</span> Dashboard
      </a>
      <a href="tambah.html" class="nav-item ${activePage==='tambah'?'active':''}">
        <span class="icon">➕</span> Tambah Tugas
      </a>
      <a href="notifikasi.html" class="nav-item ${activePage==='notifikasi'?'active':''}">
        <span class="icon">🔔</span> Notifikasi
        ${jumlahNotif > 0 ? `<span class="notif-badge">${jumlahNotif}</span>` : ''}
      </a>
      <div class="sidebar-user">
        <strong>${sanitize(namaUser)}</strong>
        <a href="#" id="btn-logout">Keluar →</a>
      </div>
    </nav>
  `;
  document.getElementById("btn-logout").addEventListener("click", e => {
    e.preventDefault(); logout();
  });
}

export function renderBottomNav(activePage, jumlahNotif) {
  const el = document.getElementById("bottom-nav-container");
  if (!el) return;
  el.innerHTML = `
    <nav class="bottom-nav">
      <a href="dashboard.html" class="${activePage==='dashboard'?'active':''}">
        <span class="bn-icon">📋</span>
        <span>Tugas</span>
      </a>
      <a href="tambah.html" class="${activePage==='tambah'?'active':''}">
        <span class="bn-icon">➕</span>
        <span>Tambah</span>
      </a>
      <a href="notifikasi.html" class="${activePage==='notifikasi'?'active':''}">
        <span class="bn-icon">🔔</span>
        ${jumlahNotif > 0 ? `<span class="notif-badge">${jumlahNotif}</span>` : ''}
        <span>Notifikasi</span>
      </a>
      <a href="#" id="bn-logout">
        <span class="bn-icon">🚪</span>
        <span>Keluar</span>
      </a>
    </nav>
  `;
  document.getElementById("bn-logout").addEventListener("click", e => {
    e.preventDefault(); logout();
  });
}
