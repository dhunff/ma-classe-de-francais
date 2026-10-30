/* Luật « Một năm ở Paris » (31/10, giai đoạn 1). Hàm thuần, không đụng giao diện.
 * Một năm 12 tháng, mỗi tháng 4 tuần, mỗi tuần chọn một hoạt động. Không có thua cuộc: hết tiền
 * thì vay Léon, hết sức thì ốm một tuần. Mọi con số là chỉ số trong truyện, không liên quan tiền thật. */
export const TIEN_DAU = 400;
export const TIEN_NHA = 300;
export const HOC_BONG = 200;
const SO_THANG = 12, SO_TUAN = 4;

export const HIEU_UNG = {
  hoc: { nl: -10, phap: 3 },
  lam: { tien: 120, nl: -25, tt: -5 },
  ban: { tien: -30, nl: -5, tt: 15 },
  kham: { tien: -20, nl: -10, tt: 10, phap: 1 },
  nghi: { nl: 35, tt: 5 },
};
const kep = (v) => Math.min(100, Math.max(0, v));
export const cong = (s, d) => ({ ...s, tien: s.tien + (d.tien ?? 0), nl: kep(s.nl + (d.nl ?? 0)), tt: kep(s.tt + (d.tt ?? 0)), phap: kep(s.phap + (d.phap ?? 0)) });

export const batDau = (gioi, thuong = 0) => ({
  gioi, thang: 0, tuan: 0, tien: TIEN_DAU + thuong, nl: 70, tt: 70, phap: 0,
  da: [], saiLai: [], than: {}, co: [], nhanhDa: [], hdThang: [], om: false, buocLam: false, diem: 0, dung: 0, tong: 0,
});

/* Ván từ giai đoạn 1 đi tuần tự theo `ke`: đổi sang danh sách cảnh đã chơi. */
export const chuanHoa = (s) => {
  if (s?.da) return { hdThang: [], ...s };
  if (!s) return s;
  const { ke = 0, ...x } = s;
  return { ...x, da: Array.from({ length: ke }, (_, k) => k), than: {}, co: [], nhanhDa: [], hdThang: [] };
};

/* Chương nào mở từ tháng nào, thuộc hoạt động nào. arrivee (*) chạy trước mọi hoạt động. */
export const CHUONG_LICH = {
  arrivee: ["*", 0], matin: ["kham", 0], ville: ["kham", 1], logement: ["kham", 3], paperasse: ["hoc", 4],
  soiree: ["ban", 4], debat: ["hoc", 6], entretien: ["lam", 7], bilan: ["hoc", 9],
};
const nhanhMo = (s, n, ma) => n.hd === ma && !s.nhanhDa.includes(n.id) && s.thang >= n.tu && (!n.can || s.co.includes(n.can))
  && Object.entries(n.canThan ?? {}).every(([ai, m]) => (s.than[ai] ?? 0) >= m);
const truyenMo = (s, c, k, ma) => {
  const [hd, tu] = CHUONG_LICH[c.ch.id];
  return !s.da.includes(k) && (hd === "*" || (hd === ma && s.thang >= tu));
};

/* Cảnh của tuần: hết phần mở đầu thì xen kẽ cảnh rẽ nhánh và cảnh truyện ĐÚNG hoạt động đã chọn,
   rồi tới câu từng sai cùng hoạt động. null là tuần yên ả. */
export const chonCanh = (s, ma, CANH, NHANH) => {
  const dau = CANH.findIndex((c, k) => CHUONG_LICH[c.ch.id][0] === "*" && !s.da.includes(k));
  if (dau >= 0) return { truyen: dau };
  const n = NHANH.find((x) => nhanhMo(s, x, ma));
  const t = CANH.findIndex((c, k) => truyenMo(s, c, k, ma));
  const uuNhanh = (s.da.length + s.nhanhDa.length) % 2 === 0;
  if (n && (uuNhanh || t < 0)) return { nhanh: n };
  if (t >= 0) return { truyen: t };
  const lai = s.saiLai.find((k) => CHUONG_LICH[CANH[k].ch.id][0] === ma);
  return lai != null ? { truyen: lai } : null;
};

export const sauCau = (s, k, ok) => {
  const x = cong(s, ok ? { phap: 4, tt: 3 } : { tt: -6 });
  return {
    ...x, da: s.da.includes(k) ? s.da : [...s.da, k], tong: s.tong + 1, dung: s.dung + (ok ? 1 : 0), diem: s.diem + (ok ? 100 : 0),
    saiLai: ok ? s.saiLai.filter((j) => j !== k) : [...s.saiLai.filter((j) => j !== k), k],
  };
};
export const THAN_MAX = 5;
/* Chọn một nhánh: áp hệ quả, ghi thiện cảm và cờ. tot = đúng sắc thái, được tính điểm. */
export const sauNhanh = (s, n, l) => {
  const { than = 0, co, ...d } = l.kq, x = cong(s, d);
  return {
    ...x, nhanhDa: [...s.nhanhDa, n.id], co: co ? [...s.co, co] : s.co,
    than: n.ai ? { ...s.than, [n.ai]: Math.min(THAN_MAX, Math.max(0, (s.than[n.ai] ?? 0) + than)) } : s.than,
    tong: s.tong + 1, dung: s.dung + (l.tot ? 1 : 0), diem: s.diem + (l.tot ? 100 : 0),
  };
};
/* Việc riêng của tháng còn chưa diễn ra sau tuần hiện tại (parisThang.js). */
export const viecThang = (s, LICH) => LICH[s.thang]?.tuan?.[s.tuan]?.find((v) => !s.nhanhDa.includes(v.id)) ?? null;
/* Xong mini game hoặc thư nhà: áp hệ quả, không tính vào điểm hội thoại. */
export const sauPhu = (s, id, { than = {}, ...d }) => {
  const moi = { ...s.than };
  Object.entries(than).forEach(([ai, v]) => { moi[ai] = Math.min(THAN_MAX, (moi[ai] ?? 0) + v); });
  return { ...cong(s, d), than: moi, nhanhDa: [...s.nhanhDa, id] };
};
/* {e}: hợp giống theo nhân vật người chơi. */
export const hopGiong = (t, gioi) => t.replaceAll("{e}", gioi === "nu" ? "e" : "");

export const hetThang = (s) => s.tuan >= SO_TUAN - 1;
export const hetNam = (s) => s.thang >= SO_THANG - 1;
/* Sang tuần sau. Cạn sức thì tuần kế ốm. */
export const quaTuan = (s) => ({ ...s, tuan: s.tuan + 1, om: s.nl <= 0, buocLam: false });
export const dungOm = (s) => ({ ...cong(s, { nl: 45 }), om: false });

/* Cuối tháng: nhận học bổng, trả tiền nhà. Âm tiền thì Léon cho vay và tuần đầu tháng sau phải đi làm. */
export const tinhThang = (s) => {
  const con = s.tien + HOC_BONG - TIEN_NHA;
  return { thu: HOC_BONG, chi: TIEN_NHA, con, vay: con < 0 };
};
export const sangThang = (s) => {
  const { con, vay } = tinhThang(s);
  return { ...cong({ ...s, tien: vay ? 0 : con }, { nl: 10, tt: vay ? -10 : 0 }), thang: s.thang + 1, tuan: 0, hdThang: [], buocLam: vay, om: false };
};
/* Danh xưng theo điểm tiếng Pháp trong truyện: không phải trình độ thật, nên không gắn nhãn A1–B2. */
export const danhXung = (phap) => (phap < 25 ? 0 : phap < 50 ? 1 : phap < 75 ? 2 : 3);
