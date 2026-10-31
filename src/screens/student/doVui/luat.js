/* Luật Tour de France của « Le Grand Quiz de France » (31/10): hàm thuần, không đụng giao diện.
   Một Tour xuất phát ở Paris, đi SO_DUNG điểm dừng do người chơi chọn, rồi về Paris chung kết. */
import { DIA_DANH } from "../../../content/troChoi/doVuiDiaDanh.js";
import { CAU } from "../../../content/troChoi/doVui.js";

/* Bản riêng của tron: shared/troChoiNhanh.js kéo theo Supabase, còn file này phải chạy được trong check:dovui. */
const tron = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export const SO_DUNG = 4;       // điểm dừng trước chung kết
export const CAU_MOI_DUNG = 2;  // nơi có ít câu hơn thì hỏi hết chỗ có
export const CAU_CHUNG_KET = 3;
export const SO_LUA_CHON = 3;
export const TI_LE_THANG = 0.6;
export const GOC = "paris";

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
export const diemCau = (giayCon, sao) => Math.round((100 + Math.max(0, giayCon * 5)) * heSoSao(sao));
export const thangTour = (dung, tong) => tong > 0 && dung >= Math.ceil(tong * TI_LE_THANG);
