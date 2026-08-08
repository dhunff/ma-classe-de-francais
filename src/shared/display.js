/* Tiện ích hiển thị dùng chung giữa các màn hình. */

/* ================= 📂 Dossier de l'élève (vue prof) ================= */
const AVA_COLORS = ["#5B4B9E", "#41608F", "#2C7573", "#327654", "#8F5E22", "#9B3D66"];
const avaColor = (n) => AVA_COLORS[[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVA_COLORS.length];
const fmtDateFR = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d.toLocaleDateString("fr-FR"); };
const fmtDuration = (ms) => {
  if (!ms || ms < 1000) return "—";
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};

const targetedAccounts = (ex, accounts) => (ex.assignedTo && ex.assignedTo.length ? accounts.filter((a) => ex.assignedTo.includes(a.name)) : accounts);
const fileNameFromUrl = (u) => {
  try { return decodeURIComponent((u || "").split("/").pop().split("?")[0]) || "fichier"; }
  catch { return "fichier"; }
};

/* 🟢 Trạng thái online : quy đổi timestamp → nhãn tiếng Pháp */
function formatLastSeen(ts) {
  if (!ts) return { online: false, label: "Jamais connecté" };
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 5) return { online: true, label: "En ligne" };
  if (mins < 60) return { online: false, label: `Il y a ${mins} min` };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { online: false, label: `Il y a ${hours} heure${hours > 1 ? "s" : ""}` };
  const days = Math.floor(hours / 24);
  return { online: false, label: `Il y a ${days} jour${days > 1 ? "s" : ""}` };
}

export { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen };
