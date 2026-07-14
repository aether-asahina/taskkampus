import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ── AUTH ──────────────────────────────────────
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";
    else { applyTheme(); callback(user); }
  });
}
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
    else applyTheme();
  });
}
export async function logout() {
  const uid = auth.currentUser?.uid;
  if (uid) sessionStorage.removeItem(`tugas_${uid}`);
  await signOut(auth);
  window.location.href = "login.html";
}

// ── THEME ─────────────────────────────────────
export function applyTheme() {
  const theme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
}
export function toggleTheme() {
  const next = (localStorage.getItem("theme") || "dark") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  document.documentElement.setAttribute("data-theme", next);
  return next;
}

// ── DATA + CACHE ──────────────────────────────
export async function getAllTugas(uid, forceRefresh = false) {
  const key = `tugas_${uid}`;
  if (!forceRefresh) {
    try {
      const c = sessionStorage.getItem(key);
      if (c) return JSON.parse(c);
    } catch {}
  }
  const snap = await getDocs(query(collection(db, "tugas"), where("uid", "==", uid)));
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  sessionStorage.setItem(key, JSON.stringify(list));
  return list;
}
export function clearTugasCache(uid) {
  sessionStorage.removeItem(`tugas_${uid}`);
}

// ── UTILS ─────────────────────────────────────
export function sanitize(val) {
  const d = document.createElement("div"); d.textContent = val ?? ""; return d.innerHTML;
}
export function formatTanggal(date) {
  if (!date) return "-";
  const d = date instanceof Date ? date : date.toDate?.() ?? new Date(date);
  return d.toLocaleString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
export function toDate(dl) {
  if (!dl) return new Date(0);
  return dl?.toDate ? dl.toDate() : new Date(dl);
}
export function hitungStats(list) {
  const now = new Date(), s = { total:0, selesai:0, proses:0, belum:0, terlambat:0 };
  list.forEach(t => {
    s.total++;
    s[t.status] = (s[t.status]||0) + 1;
    if (toDate(t.deadline) < now && t.status !== "selesai") s.terlambat++;
  });
  return s;
}
export function getNotifikasi(list) {
  const now = new Date(), batas = new Date(now.getTime() + 3*24*3600*1000);
  return list.filter(t => { const dl=toDate(t.deadline); return t.status!=="selesai"&&dl>=now&&dl<=batas; })
    .sort((a,b) => toDate(a.deadline)-toDate(b.deadline));
}

// ── SIDEBAR (desktop) ─────────────────────────
export function renderSidebar(activePage, namaUser, jumlahNotif) {
  const el = document.getElementById("sidebar-container");
  if (!el) return;
  const theme = localStorage.getItem("theme") || "dark";
  el.innerHTML = `
    <nav class="sidebar">
      <div class="logo"><h1>Task<span>Kampus</span></h1><p>Manajemen Tugas Kuliah</p></div>
      <a href="dashboard.html"  class="nav-item ${activePage==='dashboard'?'active':''}"><span class="icon">📋</span> Dashboard</a>
      <a href="tambah.html"     class="nav-item ${activePage==='tambah'?'active':''}"><span class="icon">➕</span> Tambah Tugas</a>
      <a href="notifikasi.html" class="nav-item ${activePage==='notifikasi'?'active':''}">
        <span class="icon">🔔</span> Notifikasi
        ${jumlahNotif>0?`<span class="notif-badge">${jumlahNotif}</span>`:''}
      </a>
      <div class="sidebar-bottom">
        <button class="btn-theme" id="btn-theme">${theme==='dark'?'☀️ Mode Terang':'🌙 Mode Gelap'}</button>
        <div class="sidebar-user">
          <strong>${sanitize(namaUser)}</strong>
          <a href="#" id="btn-logout">Keluar →</a>
        </div>
      </div>
    </nav>`;
  document.getElementById("btn-logout").addEventListener("click", e => { e.preventDefault(); logout(); });
  document.getElementById("btn-theme").addEventListener("click", () => {
    const next = toggleTheme();
    document.getElementById("btn-theme").textContent = next==="dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  });
}

// ── TOP NAVBAR (mobile) ───────────────────────
export function renderTopNav(activePage, jumlahNotif) {
  const el = document.getElementById("top-nav-container");
  if (!el) return;
  const theme = localStorage.getItem("theme") || "dark";
  el.innerHTML = `
    <header class="top-nav">
      <a href="dashboard.html" class="tn-logo">Task<span>Kampus</span></a>
      <a href="dashboard.html" class="${activePage==='dashboard'?'active':''}">
        <span class="tn-icon">📋</span><span>Tugas</span>
      </a>
      <a href="tambah.html" class="${activePage==='tambah'?'active':''}">
        <span class="tn-icon">➕</span><span>Tambah</span>
      </a>
      <a href="notifikasi.html" class="${activePage==='notifikasi'?'active':''}">
        <span class="tn-icon">🔔</span>
        ${jumlahNotif>0?`<span class="notif-badge">${jumlahNotif}</span>`:''}
        <span>Notif</span>
      </a>
      <button id="tn-theme" title="Ganti tema">
        <span class="tn-icon" id="tn-theme-icon">${theme==='dark'?'☀️':'🌙'}</span>
        <span>Tema</span>
      </button>
      <a href="#" id="tn-logout">
        <span class="tn-icon">🚪</span><span>Keluar</span>
      </a>
    </header>`;
  document.getElementById("tn-logout").addEventListener("click", e => { e.preventDefault(); logout(); });
  document.getElementById("tn-theme").addEventListener("click", () => {
    const next = toggleTheme();
    document.getElementById("tn-theme-icon").textContent = next==="dark" ? "☀️" : "🌙";
  });
}
