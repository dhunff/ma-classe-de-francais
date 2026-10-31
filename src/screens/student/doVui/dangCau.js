/* Dạng câu đặc biệt và sự kiện trên đường của Tour (31/10): hàm thuần, không đụng giao diện.
   Mỗi điểm dừng có một câu thường và một câu dạng đặc biệt; câu đặc biệt vẫn có pa[0] là đáp án đúng. */
import { DIA_DANH } from "../../../content/troChoi/doVuiDiaDanh.js";
import { GOI_Y, MOC_SU, NGHE, SU_KIEN } from "../../../content/troChoi/doVuiDang.js";
import { GOC, SO_DUNG, tron } from "./luat.js";

export const DANG = ["doan", "ban_do", "xep", "nghe"];
export const GIO_DANG = { doan: 10, ban_do: 0, xep: 15, nghe: 10 };   // cộng thêm vào thời gian của câu
export const HE_SO_GOI_Y = [1, 0.8, 0.6];                             // điểm giảm theo số gợi ý đã mở
export const dungDapAn = (c) => !c.dang || c.dang === "doan" || c.dang === "nghe";  // dạng trả lời bằng bốn ô đáp án
const SO_SU_KIEN = 2;

const cau3Muc = (muc, vi, fr) => (muc === "de" ? vi : fr);
const chuaDi = (daDi) => DIA_DANH.filter((d) => d.id !== GOC && !daDi.includes(d.id));

/* Lần lượt qua mọi dạng rồi mới lặp lại, để một Tour gặp đủ. Không có giọng Pháp thì bỏ dạng nghe. */
export function dangKe(daDang, coGiong) {
  const co = DANG.filter((d) => d !== "nghe" || coGiong);
  const con = co.filter((d) => !daDang.includes(d));
  return tron(con.length ? con : co)[0];
}

function cauDoan(muc, daDi) {
  const d = tron(chuaDi(daDi))[0];
  const khac = tron(DIA_DANH.filter((x) => x.id !== d.id && x.id !== GOC)).slice(0, 3);
  return { dang: "doan", muc, noi: d.id, q: cau3Muc(muc, "Địa danh bí ẩn này là nơi nào?", "Quel est ce lieu mystère ?"), goiY: GOI_Y[d.id][muc === "de" ? "vi" : "fr"], pa: [d.ten, ...khac.map((x) => x.ten)], gt: d.mo };
}

function cauBanDo(muc, daDi) {
  const ds = tron(chuaDi(daDi));
  const d = ds[0], cac = [d];
  // Các chấm nhiễu nằm ở vùng khác nhau, để câu hỏi là biết vị trí chứ không phải đoán giữa hai chấm sát nhau.
  for (const x of ds) { if (cac.length >= (muc === "kho" ? 6 : 4)) break; if (!cac.some((y) => y.vung === x.vung)) cac.push(x); }
  return { dang: "ban_do", muc, noi: d.id, dich: d.id, cham: tron(cac.map((x) => x.id)), q: cau3Muc(muc, `Hãy chỉ ${d.ten} trên bản đồ.`, `Où se trouve ${d.ten} ? Touchez le bon point.`), pa: [d.ten], gt: d.mo };
}

function cauXep(muc) {
  const so = muc === "de" ? 3 : 4, ten = muc === "de" ? "vi" : "fr";
  const su = tron(MOC_SU).slice(0, so).sort((a, b) => a.nam - b.nam);
  const nam = (n) => (n < 0 ? `${-n} TCN` : n);
  return { dang: "xep", muc, su: tron(su).map((s) => ({ ten: s[ten], nam: s.nam })), q: cau3Muc(muc, "Xếp các sự kiện từ xưa nhất tới gần nhất.", "Classez ces événements du plus ancien au plus récent."), pa: [su.map((s) => s[ten]).join(" → ")], gt: `Theo thứ tự năm: ${su.map((s) => nam(s.nam)).join(", ")}.` };
}

function cauNghe(muc) {
  const c = tron(NGHE.filter((x) => x.muc === muc))[0];
  return { ...c, dang: "nghe" };
}

export function rutDacBiet(dang, muc, daDi) {
  if (dang === "doan") return cauDoan(muc, daDi);
  if (dang === "ban_do") return cauBanDo(muc, daDi);
  if (dang === "xep") return cauXep(muc);
  return cauNghe(muc);
}
export const dungThuTu = (su, thu) => thu.length === su.length && thu.every((k, j) => j === 0 || su[thu[j - 1]].nam < su[k].nam);

/* Sự kiện chen vào giữa hai điểm dừng, không trùng lặp. Tem số 1 là sau điểm dừng đầu tiên. */
export const lichSuKien = () => tron(Array.from({ length: SO_DUNG - 1 }, (_, k) => k + 1)).slice(0, SO_SU_KIEN);
export function rutSuKien(muc, daLoai) {
  const co = SU_KIEN.filter((s) => s.muc === muc && !daLoai.includes(s.loai));
  return tron(co)[0] ?? tron(SU_KIEN.filter((s) => s.muc === muc))[0];
}
/* ve: số vé thay đổi · doi: được đề nghị đổi 1 vé lấy lại 1 trợ giúp · namNam: câu kế tiếp tự bỏ hai đáp án sai. */
export function hauQua(loai, ok, daDung) {
  if (loai === "dinh_cong") return { ve: ok ? 0 : -1, doi: false, namNam: false };
  if (loai === "ban_dia") return { ve: 0, doi: false, namNam: ok };
  return ok && daDung.length ? { ve: 0, doi: true, namNam: false } : { ve: ok ? 1 : 0, doi: false, namNam: false };
}
