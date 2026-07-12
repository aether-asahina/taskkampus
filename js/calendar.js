// =============================================
// CALENDAR HELPER — Generate file .ics
// =============================================

function padZ(n) { return String(n).padStart(2, "0"); }

function toICSDate(date) {
  const d = date instanceof Date ? date : date.toDate?.() ?? new Date(date);
  return `${d.getFullYear()}${padZ(d.getMonth()+1)}${padZ(d.getDate())}T${padZ(d.getHours())}${padZ(d.getMinutes())}00`;
}

function escICS(str) {
  return (str||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
}

export function generateICS(t) {
  const dl = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline);
  const start = new Date(dl.getTime() - 3600000);
  const now = new Date();
  return [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//TaskKampus//ID","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:taskkampus-${t.id}@app`,
    `DTSTAMP:${toICSDate(now)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(dl)}`,
    `SUMMARY:📌 ${escICS(t.judul)} — ${escICS(t.mataKuliah)}`,
    `DESCRIPTION:Mata Kuliah: ${escICS(t.mataKuliah)}\\nPrioritas: ${escICS(t.prioritas)}\\n${escICS(t.deskripsi||"")}`,
    "BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY",`DESCRIPTION:⏰ Deadline besok: ${escICS(t.judul)}`,"END:VALARM",
    "BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY",`DESCRIPTION:⏰ 1 jam lagi: ${escICS(t.judul)}`,"END:VALARM",
    "END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
}

export function downloadICS(tugas) {
  const blob = new Blob([generateICS(tugas)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tugas.judul.replace(/[^a-zA-Z0-9]/g,"_")}.ics`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export function googleCalendarUrl(t) {
  const dl = t.deadline?.toDate ? t.deadline.toDate() : new Date(t.deadline);
  const start = new Date(dl.getTime() - 3600000);
  const fmt = d => d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
  return "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE",
    text: `📌 ${t.judul} — ${t.mataKuliah}`,
    dates: `${fmt(start)}/${fmt(dl)}`,
    details: `Mata Kuliah: ${t.mataKuliah}\nPrioritas: ${t.prioritas}\n${t.deskripsi||""}`,
    sf: "true"
  });
}
