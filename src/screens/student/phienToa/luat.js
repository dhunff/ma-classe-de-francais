/* Luật của phiên toà (31/10): hàm thuần, không đụng giao diện. Mỗi lỗi trong lời khai gồm ba nhát:
   chỉ đúng từ, viện đúng điều luật, sửa đúng dạng. Bắt nhầm thì mất uy tín, hết uy tín là thua phiên. */
import { LUAT, CHUONG, BOI_THAM } from "../../../content/troChoi/phienToa.js";

export const tron = (a, rng = Math.random) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export const UY_TIN_DAU = 5;
export const SO_BOI_THAM = 7;
export const PHIEU_THANG = 4;
export const DIEM_NHAT = 100;
export const DIEM_UY_TIN = 50;
export const THUONG_THANG = 300;
export const SO_NHAT = 3;
export const GIAY_CORBEAU = 14;      // giây để đáp lại Maître Corbeau, nhân theo mức
export const NGUONG_THUAN = 50;
export const SO_HOI = 3;            // lượt hỏi thêm cho mỗi nhân chứng
export const DIEM_MAU = 150;        // phá được một mâu thuẫn bằng tang vật
const CAP_MUC = { de: ["A1", "A2"], vua: ["A1", "A2", "B1"], kho: ["A1", "A2", "B1", "B2"] };

const boDau = (t) => t.replace(/^[«"(]+|[.,;:!?»")]+$/g, "");
export const tachDong = (van) => van.split(" ").map((chu) => ({ chu, goc: boDau(chu) }));
export const viTriLoi = (dong) => (dong.loi ? tachDong(dong.van).findIndex((t) => t.goc === dong.loi.tu) : -1);
export const dongDaSua = (dong) => {
  if (!dong.loi) return dong.van;
  const k = viTriLoi(dong);
  return tachDong(dong.van).map((t, j) => (j === k ? t.chu.replace(dong.loi.tu, dong.loi.dung) : t.chu)).join(" ");
};
export const chamDung = (dong, k) => !!dong.loi && k === viTriLoi(dong);
/* Dòng đang nghe được của một nhân chứng: dòng ẩn chèn ngay sau dòng đã hỏi. id cố định để đánh dấu không lệch khi có dòng chèn thêm. */
export function dongHien(nc, daHoi = {}) {
  const ra = [];
  nc.dong.forEach((d, i) => {
    ra.push({ ...d, id: String(i) });
    if (d.them && daHoi[i]) ra.push({ ...d.them, id: `${i}t`, laThem: true });
  });
  return ra;
}
const moiDong = (vu) => vu.nhanChung.flatMap((c) => c.dong.flatMap((d) => (d.them ? [d, d.them] : [d])));
export const tongNhat = (vu) => moiDong(vu).reduce((n, d) => n + (d.loi ? SO_NHAT : 0) + (d.mau ? 1 : 0), 0);

/* Mức Dễ chỉ chọn trong ba từ. Dòng không có lỗi cũng hiện ba từ, để phản đối sai vẫn phải trả giá. */
export function chonTuDe(dong, rng = Math.random) {
  const ds = tachDong(dong.van).map((t, k) => ({ ...t, k })), vi = viTriLoi(dong);
  const khac = tron(ds.filter((t) => t.k !== vi && t.goc.length > 1), rng).slice(0, vi >= 0 ? 2 : 3);
  return tron(vi >= 0 ? [ds[vi], ...khac] : khac, rng);
}
export const luatTheoMuc = (muc) => Object.keys(LUAT).filter((x) => CAP_MUC[muc].includes(LUAT[x].cap)).sort((a, b) => LUAT[a].so - LUAT[b].so);
export const chuongCo = (ds) => Object.keys(CHUONG).filter((c) => ds.some((x) => LUAT[x].chuong === c));
/* Dễ: ba điều bất kỳ. Vừa: bốn điều, có hai điều cùng chương để dễ nhầm. Khó: tự tìm trong cả Bộ luật. */
export function chonLuat(ma, muc = "de", rng = Math.random) {
  const ds = luatTheoMuc(muc);
  if (muc === "kho") return ds;
  const khac = tron(ds.filter((x) => x !== ma), rng);
  if (muc === "de") return tron([ma, ...khac.slice(0, 2)], rng);
  const cung = khac.filter((x) => LUAT[x].chuong === LUAT[ma].chuong).slice(0, 2);
  return tron([ma, ...cung, ...khac.filter((x) => !cung.includes(x))].slice(0, 4), rng);
}
export const chonSua = (loi, rng = Math.random) => tron([loi.dung, ...loi.sai], rng);
export const khopSua = (go, dung) => go.trim().toLowerCase() === dung.toLowerCase();

/* Mức Khó: lời khai tự chạy, đủ giờ đọc theo độ dài dòng. */
export const giayDoc = (van, heSo = 1) => Math.round(Math.max(5, van.split(" ").length * 0.9) * heSo);

/* Bảy bồi thẩm: mỗi người một điểm tin, đạt NGUONG_THUAN thì bỏ phiếu cho bị cáo. Mỗi sự kiện đẩy cả toà
   một chút (ca) và đẩy mạnh người coi trọng nó, nên muốn đủ phiếu phải chơi trọn nhiều kỹ năng. */
export const BANG_TAC_DONG = {
  tu: { ca: 2 },
  luat: { ca: 1, cong_chung: 13 },
  sai_luat: { ca: -2, cong_chung: -12 },
  sua: { ca: 1, sinh_vien: 13 },
  sai_sua: { ca: -2, sinh_vien: -12 },
  hop: { kho_tinh: 13 },
  tang: { ca: 2, bac_si: 24 },
  nham: { ca: -4, hang_xom: -14 },
  doi: { ca: 1 },
  doi_sai: { ca: -4, voi_vang: -6 },
  nhanh: { voi_vang: 16 },
  ly: { ca: 1, cong_chung: 10, bac_si: 10 },
  dep: { ca: 1, nha_tho: 24 },
  tinh: { ca: 1, hang_xom: 22 },
  sai_cau: { ca: -6, kho_tinh: -14 },
};
/* Điểm tin đầu phiên tính theo vụ: chơi trọn phần bắt buộc mà không nhắm tới ai thì cả toà vẫn dừng sát ngưỡng,
   nên vụ dài hay ngắn thì bồi thẩm cũng khó thuyết phục như nhau. */
const caToiDa = (vu) => { const c = vu.nhanChung; return c.flatMap((x) => x.dong).filter((d) => d.loi).length * 4 + c.flatMap((x) => x.doiDap ?? []).length + (vu.bienHo?.length ?? 0); };
export const taoBoiTham = (vu) => Object.fromEntries(BOI_THAM.map((b) => [b.ma, Math.max(0, NGUONG_THUAN - 1 - caToiDa(vu) + (vu.bienHo?.length ? 0 : 2))]));   // không có bài biện hộ thì không còn cách nhắm tới từng người
export const apSuKien = (bt, su) => {
  const t = BANG_TAC_DONG[su];
  return Object.fromEntries(Object.entries(bt).map(([ma, d]) => [ma, Math.max(0, Math.min(100, d + (t.ca ?? 0) + (t[ma] ?? 0)))]));
};
export const laThuan = (d) => d >= NGUONG_THUAN;
export const demPhieu = (bt) => Object.values(bt).filter(laThuan).length;
export const thangToa = (phieu) => phieu >= PHIEU_THANG;
/* Lỗi hợp giống số là nơi Mme Puriste để ý nhất. */
export const laLoiHop = (ma) => ["adj", "passe"].includes(LUAT[ma].chuong) || ma === "mao_tu_giong";
export const dapCorbeau = (c, chapNhan) => chapNhan === !c.dung;
export const giayCorbeau = (heSo = 1) => Math.round(GIAY_CORBEAU * heSo);
export const trinhDung = (dong, tang) => dong.mau?.tang === tang;
export const diemCuoi = (diem, uy, thang) => diem + uy * DIEM_UY_TIN + (thang ? THUONG_THANG : 0);
