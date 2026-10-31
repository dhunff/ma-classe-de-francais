/* Luật Tour de France của « Le Grand Quiz de France » (31/10): hàm thuần, không đụng giao diện.
   Một Tour xuất phát ở Paris, đi SO_DUNG điểm dừng do người chơi chọn, rồi về Paris chung kết. */
import { DIA_DANH } from "../../../content/troChoi/doVuiDiaDanh.js";
import { CAU } from "../../../content/troChoi/doVui.js";

/* Bản riêng của tron: shared/troChoiNhanh.js kéo theo Supabase, còn file này phải chạy được trong check:dovui. */
export const tron = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export const SO_DUNG = 5;       // điểm dừng trước chung kết
export const CAU_MOI_DUNG = 2;  // nơi có ít câu hơn thì hỏi hết chỗ có
export const CAU_CHUNG_KET = 3;
export const SO_LUA_CHON = 3;
export const GOC = "paris";
export const VE_DAU = 4;
export const CUOC_TOI_DA = 2;
export const THEM_GIO = 15;
export const CO_CHUNG_KET = 2;
export const DIEM_MOI_VE = 50;
export const THUONG_THANG = 500;
export const TRO_GIUP = ["nam_nam", "khan_gia", "leon", "them_gio"];
export const P_MINETTE = { de: 0.6, vua: 0.64, kho: 0.68 };      // khả năng bà chiếm được một nơi, và đúng một câu chung kết
const TIN_KHAN_GIA = { de: 0.68, vua: 0.56, kho: 0.46 };
const TIN_LEON = { de: 0.9, vua: 0.8, kho: 0.7 };

export const diaDanh = (id) => DIA_DANH.find((d) => d.id === id);

/* Chiếu lon, lat lên khung 100 × 100. Hệ số dọc lớn hơn vì một độ kinh ở vĩ độ Pháp ngắn hơn một độ vĩ. */
export const chieu = (lon, lat) => ({ x: (lon + 5.6) * 6.3, y: (51.3 - lat) * 9.2 });
const xa = (a, b) => { const p = chieu(a.lon, a.lat), q = chieu(b.lon, b.lat); return Math.hypot(p.x - q.x, p.y - q.y); };

export const cauCua = (noi, muc) => CAU.filter((c) => c.noi === noi && c.muc === muc);
export const moO = (muc) => DIA_DANH.filter((d) => d.id !== GOC && cauCua(d.id, muc).length > 0);

/* Điểm đến tiếp theo: nơi gần nhất của mỗi VÙNG chưa đi, rồi lấy các vùng gần nhất. Lọc theo vùng để
   ba lựa chọn đưa tới ba hướng thật khác nhau, không phải ba chấm sát nhau. Thiếu vùng thì lấp bằng
   nơi còn lại, để không bao giờ kẹt khi kho câu của mức còn mỏng. */
export function diemDen(tu, daDi, muc) {
  const goc = diaDanh(tu);
  const con = moO(muc).filter((d) => !daDi.includes(d.id)).sort((a, b) => xa(goc, a) - xa(goc, b));
  const moiVung = new Map();
  con.forEach((d) => { if (!moiVung.has(d.vung)) moiVung.set(d.vung, d); });
  const chon = [...moiVung.values()].slice(0, SO_LUA_CHON);
  for (const d of con) { if (chon.length >= SO_LUA_CHON) break; if (!chon.includes(d)) chon.push(d); }
  return chon;
}

export const rutCau = (noi, muc) => tron(cauCua(noi, muc)).slice(0, CAU_MOI_DUNG);

/* Chung kết: ưu tiên câu về Paris, thiếu thì đố lại những nơi người chơi đã bỏ qua. */
export function rutChungKet(muc, daHoi) {
  const chua = (c) => !daHoi.includes(c.q);
  const paris = tron(cauCua(GOC, muc).filter(chua));
  const khac = tron(CAU.filter((c) => c.muc === muc && c.noi !== GOC && chua(c)));
  return [...paris, ...khac].slice(0, CAU_CHUNG_KET);
}

export const heSoSao = (sao) => 1 + (sao - 1) * 0.25;
export const heSoChuoi = (chuoi) => 1 + Math.min(Math.max(chuoi, 1) - 1, 4) * 0.25;  // tối đa ×2 từ câu đúng thứ 5
export const diemCau = (giayCon, sao, chuoi = 1, cuoc = 0) => Math.round((100 + Math.max(0, giayCon * 5)) * heSoSao(sao) * heSoChuoi(chuoi) * (1 + cuoc * 0.5));

/* Vé: đi xa tốn nhiều vé hơn, đúng một câu được một vé. */
export const giaVe = (tu, den) => { const k = xa(diaDanh(tu), diaDanh(den)); return k <= 13 ? 1 : k <= 24 ? 2 : 3; };
/* Hết vé không được làm kẹt ván: nếu không đủ cho nơi nào thì nơi rẻ nhất cho đi nhờ, miễn phí. */
export function luaChon(ds, tu, ve) {
  const co = ds.map((d) => ({ ...d, gia: giaVe(tu, d.id) })).map((d) => ({ ...d, du: d.gia <= ve, diNho: false }));
  if (co.some((d) => d.du) || !co.length) return co;
  const re = co.reduce((a, b) => (b.gia < a.gia ? b : a));
  return co.map((d) => (d.id === re.id ? { ...d, gia: 0, du: true, diNho: true } : d));
}

/* Đua cờ với Minette: chiếm một nơi được số cờ bằng số sao của nơi đó, mỗi câu đúng ở chung kết thêm CO_CHUNG_KET cờ. */
export const demCo = (chu, phe) => Object.entries(chu).reduce((n, [id, ai]) => n + (ai === phe ? diaDanh(id).sao : 0), 0);
export const mucKhoHon = (muc) => (muc === "de" ? "vua" : "kho");
export const chiemDuoc = (dung, tong, cuaMinette) => (cuaMinette ? tong > 0 && dung === tong : dung > 0);
export const thangTour = (coBan, coMinette) => coBan >= coMinette;   // bằng cờ thì chủ nhà thắng

/* Lượt của Minette: tới một trong các nơi gần bà chưa ai đặt chân, không chắc lần nào cũng chiếm được. */
export function minetteDi(tu, daDung, muc, rng = Math.random) {
  const goc = diaDanh(tu);
  const con = moO(muc).filter((d) => !daDung.includes(d.id)).sort((a, b) => xa(goc, a) - xa(goc, b)).slice(0, 4);
  if (!con.length) return null;
  const d = con[Math.floor(rng() * con.length)];
  return { id: d.id, chiem: rng() < P_MINETTE[muc] };
}

/* Thưởng khi đúng hết câu ở một điểm dừng, ghi sẵn trên thẻ địa danh. Chưa dùng trợ giúp nào thì đổi thành vé. */
export const loaiThuong = (d) => (d.sao === 3 || d.loai === "am_thuc" ? "tro_giup" : "ve");
export const traThuong = (d, daDung) => (loaiThuong(d) === "tro_giup" && daDung.length ? "tro_giup" : "ve");

/* Trợ giúp: k là chỉ số trong pa, pa[0] luôn đúng. Khán giả và Léon có thể sai, nhất là ở mức khó. */
const conLai = (an) => [0, 1, 2, 3].filter((k) => !an.includes(k));
export const boHai = (rng = Math.random) => [1, 2, 3].sort(() => rng() - 0.5).slice(0, 2);
export function binhChon(muc, an = [], rng = Math.random) {
  const ks = conLai(an), sai = ks.filter((k) => k !== 0);
  const dung = TIN_KHAN_GIA[muc] + (rng() - 0.5) * 0.2 + (sai.length === 1 ? 0.12 : 0);
  const nang = sai.map(() => 0.25 + rng()), tong = nang.reduce((a, b) => a + b, 0);
  const pt = { 0: Math.round(dung * 100) };
  sai.forEach((k, j) => { pt[k] = Math.round((1 - dung) * 100 * nang[j] / tong); });
  pt[sai[0]] += 100 - ks.reduce((n, k) => n + pt[k], 0);
  return pt;
}
export function leonDoan(muc, an = [], rng = Math.random) {
  if (rng() < TIN_LEON[muc]) return 0;
  const sai = conLai(an).filter((k) => k !== 0);
  return sai[Math.floor(rng() * sai.length)];
}

export const diemCuoi = (diem, ve, thang) => diem + ve * DIEM_MOI_VE + (thang ? THUONG_THANG : 0);
