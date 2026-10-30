/* Luật « Một năm ở Paris » (31/10, giai đoạn 1). Hàm thuần, không đụng giao diện.
 * Một năm 12 tháng, mỗi tháng 4 tuần, mỗi tuần chọn một hoạt động. Không có thua cuộc: hết tiền
 * thì vay Léon, hết sức thì ốm một tuần. Mọi con số là chỉ số trong truyện, không liên quan tiền thật. */
export const TIEN_DAU = 400;
export const TIEN_NHA = 300;
export const HOC_BONG = 200;
const SO_THANG = 12, SO_TUAN = 4;

export const HIEU_UNG = {
  hoc: { nl: -10, phap: 2 },
  lam: { tien: 120, nl: -25, tt: -5 },
  ban: { tien: -30, nl: -5, tt: 10 },
  kham: { tien: -20, nl: -10, tt: 6, phap: 1 },
  nghi: { nl: 35, tt: 5 },
};
/* Nhớ nhà trừ tinh thần mỗi cuối tháng, nặng hơn ở tháng 11 và tháng 2 (giai đoạn 5). */
const THANG_BUON = [2, 5];
export const nhoNha = (thang) => (THANG_BUON.includes(thang) ? 24 : 15);
const kep = (v) => Math.min(100, Math.max(0, v));
export const cong = (s, d) => ({ ...s, tien: s.tien + (d.tien ?? 0), nl: kep(s.nl + (d.nl ?? 0)), tt: kep(s.tt + (d.tt ?? 0)), phap: kep(s.phap + (d.phap ?? 0)) });

export const batDau = (gioi, thuong = 0) => ({
  gioi, thang: 0, tuan: 0, tien: TIEN_DAU + thuong, nl: 70, tt: 70, phap: 0,
  da: [], saiLai: [], than: {}, co: [], nhanhDa: [], hdThang: [], chon: {}, ngu: [], thay: {}, vay: 0, doDang: null, om: false, buocLam: false, diem: 0, dung: 0, tong: 0,
});

/* Ván từ giai đoạn 1 đi tuần tự theo `ke`: đổi sang danh sách cảnh đã chơi. */
export const chuanHoa = (s) => {
  if (s?.da) return { hdThang: [], chon: {}, ngu: [], thay: {}, vay: 0, doDang: null, nam: "cu", ...s };
  if (!s) return s;
  const { ke = 0, ...x } = s;
  return { ...x, da: Array.from({ length: ke }, (_, k) => k), than: {}, co: [], nhanhDa: [], hdThang: [], chon: {}, ngu: [], thay: {}, vay: 0, doDang: null, nam: "cu" };
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
  const x = cong(s, ok ? { phap: 2, tt: 1 } : { tt: -6 });
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
    ...x, nhanhDa: [...s.nhanhDa, n.id], chon: { ...s.chon, [n.id]: n.lua.indexOf(l) }, co: co ? [...s.co, co] : s.co,
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
/* Sang tuần sau. Cạn sức thì tuần kế ốm. doDang giữ chỗ đang chơi dở để tải lại trang không được thêm một tuần:
   { hd } là đã chọn hoạt động, "sau" là xong cảnh chính, đang chạy việc tháng hoặc tổng kết. */
export const quaTuan = (s) => ({ ...s, tuan: s.tuan + 1, om: s.nl <= 0, buocLam: false, doDang: null });
export const dungOm = (s) => ({ ...cong(s, { nl: 45 }), om: false });

/* Cuối tháng: nhận học bổng, trả tiền nhà. Âm tiền thì Léon cho vay và tuần đầu tháng sau phải đi làm. */
export const tinhThang = (s) => {
  const con = s.tien + HOC_BONG - TIEN_NHA;
  return { thu: HOC_BONG, chi: TIEN_NHA, con, vay: con < 0, nho: nhoNha(s.thang) };
};
export const sangThang = (s) => {
  const { con, vay, nho } = tinhThang(s);
  return { ...cong({ ...s, tien: vay ? 0 : con }, { nl: 10, tt: -nho - (vay ? 10 : 0) }), thang: s.thang + 1, tuan: 0, hdThang: [], buocLam: vay, om: false, doDang: null, vay: (s.vay ?? 0) + (vay ? 1 : 0) };
};
/* Danh xưng theo điểm tiếng Pháp trong truyện: không phải trình độ thật, nên không gắn nhãn A1–B2. */
export const danhXung = (phap) => (phap < 25 ? 0 : phap < 50 ? 1 : phap < 75 ? 2 : 3);

/* Bản đồ, sổ tay, album (giai đoạn 5): đều suy ra từ ván chơi, không lưu bản sao. */
const noiDaChoi = (s, CANH, VIEC_ID) => [...s.da.map((k) => CANH[k]?.noi), ...s.nhanhDa.map((id) => VIEC_ID[id]?.noi)].filter(Boolean);
export const noiSangDen = (s, CANH, VIEC_ID, DIA_DIEM) => {
  const ds = noiDaChoi(s, CANH, VIEC_ID);
  return DIA_DIEM.filter((d) => d.khop.some((m) => ds.some((n) => n.includes(m))));
};
/* Câu trong sổ tay: câu truyện đã nói đúng và câu rẽ nhánh đã chọn đúng sắc thái. Trùng thì giữ một. */
export const cauHay = (s, CANH, VIEC_ID) => {
  const truyen = s.da.filter((k) => !s.saiLai.includes(k) && CANH[k]).map((k) => ({ fr: CANH[k].pa[0], vi: CANH[k].gt }));
  const nhanh = Object.entries(s.chon).map(([id, j]) => VIEC_ID[id]?.lua?.[j]).filter((l) => l?.tot).map((l) => ({ fr: hopGiong(l.c, s.gioi), vi: l.ghi }));
  return [...new Map([...truyen, ...nhanh].map((c) => [c.fr, c])).values()];
};
export const anhDaCo = (s, ALBUM) => ALBUM.filter((a) => s.nhanhDa.includes(a.id)).map((a) => ({ ...a, chu: a.chung ?? a.loi[s.chon[a.id] ?? 0] ?? a.loi[0] }));
/* Tuần yên ả: Léon dạy thành ngữ tiếp theo chưa học. */
export const hocNgu = (s, tong) => {
  const k = Array.from({ length: tong }, (_, j) => j).find((j) => !s.ngu.includes(j));
  return k == null ? s : { ...s, ngu: [...s.ngu, k] };
};
export const nguoiThan = (s, NHAN_VAT) => {
  const [ai] = Object.entries(s.than).sort((a, b) => b[1] - a[1])[0] ?? [];
  return ai ? NHAN_VAT[ai].ten : "Léon";
};
const datDk = (s, c, soNoi) => (c.chi ? s[c.chi] >= c.min : c.than ? (s.than[c.than] ?? 0) >= c.min : c.noi ? soNoi >= c.noi
  : c.ban ? Object.values(s.than).filter((v) => v >= 4).length >= c.ban : c.co.some((m) => s.co.includes(m)));
/* Kết cục ẩn đè lên hướng đã chọn ở tháng 8. Ván cũ chưa chọn hướng thì coi như ở lại. */
export const ketCuc = (s, KET_CUC, soNoi) => {
  const xet = (ma) => ({ ma, dk: KET_CUC[ma].can.map((c) => ({ ...c, dat: datDk(s, c, soNoi) })) });
  const an = xet("nha");
  if (an.dk.every((c) => c.dat)) return { ...an, dat: true };
  const ma = Object.keys(KET_CUC).find((m) => s.co.includes(KET_CUC[m].co)) ?? "olai", x = xet(ma);
  return { ...x, dat: x.dk.every((c) => c.dat) };
};

/* Dòng gửi lên máy chủ khi hết năm (giai đoạn 6). */
export const dongKet = (s, ky, kq) => ({
  ma: kq.ma, ban: kq.dat ? "dat" : "do", nam: s.nam, noi: ky.noi.length, anh: ky.anh.length, cau: ky.cau.length, ngu: s.ngu.length,
  tien: Math.max(0, s.tien), than: Object.values(s.than).filter((v) => v >= 4).length, vay: s.vay ?? 0,
});
/* Gộp kết cục đã lưu với kỷ lục của ván đang chơi, cho phần thành tích. */
export const hoSoGop = (ket, s, ky) => {
  const ds = Object.values(ket);
  const lon = (m, v = 0) => Math.max(v, ...ds.map((x) => x[m] ?? 0));
  const coVay = ds.filter((x) => x.vay != null).map((x) => x.vay);
  return {
    ket: Object.fromEntries(Object.entries(ket).map(([m, x]) => [m, x.ban])),
    noi: lon("noi", ky?.noi.length), anh: lon("anh", ky?.anh.length), cau: lon("cau", ky?.cau.length), ngu: lon("ngu", s?.ngu.length),
    tien: lon("tien"), ban: lon("than", s ? Object.values(s.than).filter((v) => v >= 4).length : 0), vay: coVay.length ? Math.min(...coVay) : null,
  };
};
