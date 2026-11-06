/* Lỗi trong bài viết, đếm từ và yêu cầu của đề (06/11, giai đoạn 1 chấm AI chuyên sâu).
 *
 * JS thuần, dùng chung cho Edge Function `cham-pe` VÀ trình duyệt (import thẳng như soCau.js),
 * để cả hai bên tách chữ, đếm từ và tìm đoạn lỗi theo ĐÚNG một cách. `npm run check:champe` gọi
 * thẳng vào đây.
 *
 * ══ LỖI LƯU BẰNG ĐOẠN TRÍCH, KHÔNG BẰNG VỊ TRÍ ══
 * Cùng lý do với neo đáp án: vị trí trôi im lặng, đoạn trích thì hoặc khớp hoặc không. Máy chủ
 * BỎ mọi lỗi có đoạn trích không nằm nguyên văn trong bài: mô hình không được « tìm ra » một lỗi
 * mà học sinh không hề viết. Trình duyệt dựng lại vị trí bằng `chiaDoan` trên cùng chuỗi `chuThuan`. */

/* Bài làm (HTML của KhungViet, hoặc chữ thường) → chữ thuần, chuẩn hoá dấu nháy và khoảng trắng.
   Giữ xuống dòng giữa các đoạn để hiện lại được bố cục bài. */
export function chuThuan(raw) {
  return String(raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[ \t  ]+/g, " ")
    .split("\n").map((d) => d.trim()).join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* Đếm từ kiểu DELF: mọi cụm ký tự nằm giữa hai khoảng trắng là MỘT từ (« l'homme »,
   « c'est-à-dire » đều là 1). Cụm chỉ có dấu câu (« : », « ! », « - ») không tính. */
export function demTu(van) {
  return String(van ?? "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/* Số từ đề yêu cầu, đọc từ câu chữ của đề: « 60 mots minimum », « au moins 80 mots »,
   « 160 à 180 mots », « environ 40 mots », « (40 mots) ». Không tìm thấy thì null: không đoán. */
export function soTuDeBai(de) {
  const s = chuThuan(de).toLowerCase();
  let m = s.match(/(\d{2,3})\s*(?:à|a|-|–)\s*(\d{2,3})\s*mots/);
  if (m) return { toi_thieu: +m[1], toi_da: +m[2] };
  m = s.match(/(?:minimum|au moins|au minimum)\s*(?:de\s*)?(\d{2,3})\s*mots/) || s.match(/(\d{2,3})\s*mots\s*(?:minimum|au moins|au minimum)/);
  if (m) return { toi_thieu: +m[1], toi_da: null };
  m = s.match(/(?:environ|à peu près)\s*(\d{2,3})\s*mots/);
  if (m) return { toi_thieu: Math.round(+m[1] * 0.9), toi_da: Math.round(+m[1] * 1.1), khoang: +m[1] };
  m = s.match(/(\d{2,3})\s*mots/);
  if (m) return { toi_thieu: +m[1], toi_da: null };
  return null;
}

/* Kiểm tra cố định chạy TRƯỚC mô hình. Kết quả vừa đưa vào lời nhắc (như một sự thật đã đo),
   vừa trả về giao diện. */
export function kiemTraCoDinh(raw, de) {
  const van = chuThuan(raw);
  const so_tu = demTu(van);
  const yc = soTuDeBai(de);
  const thieu = yc?.toi_thieu != null && so_tu < yc.toi_thieu;
  const thua = yc?.toi_da != null && so_tu > yc.toi_da;
  return { so_tu, toi_thieu: yc?.toi_thieu ?? null, toi_da: yc?.toi_da ?? null, thieu_tu: !!thieu, thua_tu: !!thua };
}

/* Loại lỗi: khoá cố định, giao diện dịch nhãn. Nhóm quyết định màu tô. */
export const LOAI_LOI = {
  accord: "ngu_phap", conjugaison: "ngu_phap", temps: "ngu_phap", preposition: "ngu_phap",
  article: "ngu_phap", syntaxe: "ngu_phap", pronom: "ngu_phap",
  lexique: "tu_vung", registre: "tu_vung",
  orthographe: "chinh_ta", ponctuation: "chinh_ta",
};
const TRAN_LOI = 15;

const gonKhoang = (s) => String(s ?? "").replace(/[’‘ʼ]/g, "'").replace(/\s+/g, " ").trim();

/* Lọc danh sách lỗi mô hình trả về theo bài làm thật.
   · Đoạn trích phải nằm NGUYÊN VĂN trong bài (sau chuẩn hoá dấu nháy, khoảng trắng), dài 2–120 ký tự.
   · Phải có bản sửa khác đoạn gốc, loại lỗi thuộc LOAI_LOI (lạ thì về « syntaxe »).
   · Trùng đoạn trích thì giữ lỗi đầu. Tối đa TRAN_LOI lỗi.
   Trả { loi, bo } — `bo` đếm số lỗi bị loại để giao diện và bộ kiểm biết. */
export function locLoi(tho, van) {
  const vanGon = gonKhoang(van);
  const ds = Array.isArray(tho) ? tho : [];
  const loi = []; const daCo = new Set();
  for (const x of ds) {
    if (!x || typeof x !== "object") continue;
    const trich = gonKhoang(x.trich ?? x.goc);
    const sua = gonKhoang(x.sua);
    if (trich.length < 2 || trich.length > 120 || !sua || sua === trich || !vanGon.includes(trich) || daCo.has(trich)) continue;
    const loai = LOAI_LOI[String(x.loai ?? "").toLowerCase()] ? String(x.loai).toLowerCase() : "syntaxe";
    daCo.add(trich);
    loi.push({ trich, sua: sua.slice(0, 200), loai, giai_thich: String(x.giai_thich ?? x.vi_sao ?? "").trim().slice(0, 300) });
    if (loi.length >= TRAN_LOI) break;
  }
  return { loi, bo: ds.length - loi.length };
}

/* Yêu cầu của đề (consigne) mà mô hình liệt kê rồi tự đối chiếu. `dat`: co | mot_phan | khong. */
export function locYeuCau(tho) {
  const MUC = ["co", "mot_phan", "khong"];
  return (Array.isArray(tho) ? tho : [])
    .filter((x) => x && typeof x === "object" && String(x.y ?? x.yeu_cau ?? "").trim())
    .map((x) => ({
      y: String(x.y ?? x.yeu_cau).trim().slice(0, 200),
      dat: MUC.includes(x.dat) ? x.dat : x.dat === true ? "co" : x.dat === false ? "khong" : "mot_phan",
      ghi_chu: String(x.ghi_chu ?? x.trich ?? "").trim().slice(0, 240),
    }))
    .slice(0, 8);
}

/* Chia chữ thuần thành các đoạn để tô: [{ chu, loi? }]. Mỗi lỗi lấy LẦN XUẤT HIỆN ĐẦU chưa bị lỗi
   khác chiếm; lỗi chồng lên lỗi đã đặt thì bỏ (vẫn hiện trong danh sách, chỉ không tô). */
export function chiaDoan(van, loi) {
  const s = String(van ?? "");
  const cho = [];
  (loi ?? []).forEach((l, i) => {
    let tu = 0, k;
    while ((k = s.indexOf(l.trich, tu)) >= 0) {
      const het = k + l.trich.length;
      if (!cho.some((c) => k < c.het && het > c.tu)) { cho.push({ tu: k, het, i }); return; }
      tu = k + 1;
    }
  });
  cho.sort((a, b) => a.tu - b.tu);
  const doan = []; let o = 0;
  for (const c of cho) {
    if (c.tu > o) doan.push({ chu: s.slice(o, c.tu) });
    doan.push({ chu: s.slice(c.tu, c.het), loi: c.i });
    o = c.het;
  }
  if (o < s.length) doan.push({ chu: s.slice(o) });
  return doan;
}
