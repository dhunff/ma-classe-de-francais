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

/* Thời gian tương đối, tiếng Việt. Cho bảng thông báo.
 *
 * Vì sao KHÔNG dùng `Intl.RelativeTimeFormat`: giao diện đã có công tắc ngôn
 * ngữ riêng, còn API của trình duyệt lấy theo ngôn ngữ hệ điều hành. Người chọn
 * Tiếng Việt trên máy cài tiếng Anh sẽ đọc "2 hours ago" giữa một trang tiếng
 * Việt — cùng lý do đã khiến tên thứ và tháng được viết tay trong i18n.
 *
 * Mốc "vừa xong" là 60 giây. Dưới ngưỡng đó mà hiện "0 phút trước" thì vừa
 * đúng vừa vô nghĩa.
 *
 * Quá 7 ngày thì trả ngày tháng: "12 phút trước" hữu ích, "43 ngày trước" thì
 * không — người đọc phải tự tính ngược ra ngày. */
const thoiGianTuongDoi = (ts) => {
  const t = typeof ts === "number" ? ts : Date.parse(ts);
  if (!t || Number.isNaN(t)) return "";
  const giay = Math.floor((Date.now() - t) / 1000);
  /* Đồng hồ máy người dùng có thể chạy nhanh hơn máy chủ vài giây, và khi đó
     `giay` âm. "Vừa xong" đúng hơn là "-3 giây trước". */
  if (giay < 60) return "Vừa xong";
  const phut = Math.floor(giay / 60);
  if (phut < 60) return phut + " phút trước";
  const gio = Math.floor(phut / 60);
  if (gio < 24) return gio + " giờ trước";
  const ngay = Math.floor(gio / 24);
  if (ngay <= 7) return ngay + " ngày trước";
  return new Date(t).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

export { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen, thoiGianTuongDoi };
