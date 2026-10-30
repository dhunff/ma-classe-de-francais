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
  ke: 0, saiLai: [], om: false, buocLam: false, diem: 0, dung: 0, tong: 0,
});

/* Cảnh của tuần này: đi tiếp câu chuyện, hết truyện thì gặp lại câu từng sai, null là tuần yên ả. */
export const chonCanh = (s, n) => (s.ke < n ? s.ke : s.saiLai[0] ?? null);

export const sauCau = (s, k, ok, n) => {
  const x = cong(s, ok ? { phap: 4, tt: 3 } : { tt: -6 });
  const moi = k >= s.ke && k < n;
  return {
    ...x, ke: moi ? s.ke + 1 : s.ke, tong: s.tong + 1, dung: s.dung + (ok ? 1 : 0), diem: s.diem + (ok ? 100 : 0),
    saiLai: ok ? s.saiLai.filter((j) => j !== k) : moi ? [...s.saiLai, k] : [...s.saiLai.filter((j) => j !== k), k],
  };
};

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
  return { ...cong({ ...s, tien: vay ? 0 : con }, { nl: 10, tt: vay ? -10 : 0 }), thang: s.thang + 1, tuan: 0, buocLam: vay, om: false };
};
/* Danh xưng theo điểm tiếng Pháp trong truyện: không phải trình độ thật, nên không gắn nhãn A1–B2. */
export const danhXung = (phap) => (phap < 25 ? 0 : phap < 50 ? 1 : phap < 75 ? 2 : 3);
