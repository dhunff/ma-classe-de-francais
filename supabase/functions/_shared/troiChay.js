/* Độ trôi chảy khi nói, đo từ dấu thời gian của từng từ (09/11, giai đoạn 4 chấm AI chuyên sâu).
 *
 * JS thuần, dùng chung cho Edge Function `nhan-xet-noi` và `npm run check:troichay`.
 *
 * ══ ĐO BẰNG MÁY, KHÔNG HỎI AI ══
 * Mô hình ngôn ngữ chỉ đọc được CHỮ đã chép, nên nó không biết người nói ngập ngừng bao lâu. Whisper
 * (`whisper-1`, verbose_json + timestamp_granularities=word) trả thời điểm bắt đầu, kết thúc của
 * từng từ: tốc độ, chỗ ngắt, từ đệm, lặp từ tính thẳng từ đó, rồi đưa cho AI như sự thật đã đo.
 *
 * ══ HIỆN MỨC, KHÔNG HIỆN SỐ ══
 * Theo chủ dự án (09/11): học sinh chỉ thấy mức (chậm, vừa, tốt; ít, vừa, nhiều). Số đo vẫn lưu
 * trong ket_qua.troi_chay để AI nhận xét và để sau này dùng. Ngưỡng là ước lượng sư phạm cho
 * người học ngoại ngữ, không phải chuẩn DELF (DELF không công bố ngưỡng số nào): đổi ở NGUONG.
 *
 * ══ GIỚI HẠN ══
 * Whisper hay tự bỏ từ đệm (euh, hum). Máy chủ gửi kèm một câu mẫu có từ đệm để nó chép lại,
 * nhưng vẫn có thể sót: mức « từ đệm » vì vậy chỉ đáng tin theo chiều « nhiều ». */

export const NGAT_GIAY = 1.0;   // khoảng lặng giữa hai từ từ 1 giây trở lên là một chỗ ngập ngừng

/* Từ đệm tiếng Pháp. « bon », « alors », « voilà » là từ thật trong câu nên KHÔNG tính. */
const TU_DEM = new Set(["euh", "heu", "euhh", "euhm", "hum", "hmm", "hm", "mmh", "mm", "bah", "ben", "beh", "hein"]);

/* Tốc độ (từ/phút) coi là « tốt » theo trình độ: [dưới mức này là hơi chậm, trên mức này là nhanh]. */
const TOC_DO = { A1: [55, 110], A2: [65, 120], B1: [80, 135], B2: [95, 150], C1: [105, 165] };
/* Ngập ngừng / từ đệm / lặp từ MỖI PHÚT: [tới mức này là « ít », tới mức này là « vừa »]. Trình độ
   thấp được nới rộng hơn: người mới học dừng tìm từ là bình thường. */
const NGUONG = {
  ngap_ngung: { A1: [5, 9], A2: [4, 8], B1: [3, 6], B2: [2, 5], C1: [2, 4] },
  tu_dem: { A1: [4, 8], A2: [4, 8], B1: [3, 6], B2: [2, 5], C1: [2, 4] },
  lap_tu: { A1: [2, 4], A2: [2, 4], B1: [1.5, 3], B2: [1, 2.5], C1: [1, 2] },
};

const sach = (w) => String(w ?? "").toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
const capChuan = (c) => (TOC_DO[String(c ?? "").slice(0, 2).toUpperCase()] ? String(c).slice(0, 2).toUpperCase() : "B1");
const tron1 = (x) => Math.round(x * 10) / 10;

/* tu: [{ word, start, end }] (giây). Trả { du_lieu: false } khi quá ít để đo (dưới 5 từ hoặc dưới
   3 giây nói): một mức « chậm » dựng từ ba từ là bịa. */
export function doTroiChay(tu, capDo) {
  const ds = (Array.isArray(tu) ? tu : [])
    .map((t) => ({ w: sach(t?.word), s: Number(t?.start), e: Number(t?.end) }))
    .filter((t) => t.w && Number.isFinite(t.s) && Number.isFinite(t.e) && t.e >= t.s)
    .sort((a, b) => a.s - b.s);
  const that = ds.filter((t) => !TU_DEM.has(t.w));
  if (that.length < 5) return { du_lieu: false };
  const giay = ds[ds.length - 1].e - ds[0].s;
  if (!(giay >= 3)) return { du_lieu: false };
  const phut = giay / 60;

  const ngat = [];
  for (let i = 1; i < ds.length; i++) {
    const g = ds[i].s - ds[i - 1].e;
    if (g >= NGAT_GIAY) ngat.push(g);
  }
  const tuDem = {};
  ds.forEach((t) => { if (TU_DEM.has(t.w)) tuDem[t.w] = (tuDem[t.w] ?? 0) + 1; });
  const soTuDem = Object.values(tuDem).reduce((n, x) => n + x, 0);
  let soLap = 0;
  for (let i = 1; i < that.length; i++) if (that[i].w === that[i - 1].w) soLap++;

  const cap = capChuan(capDo);
  const tocDo = that.length / phut;
  const [cham, nhanh] = TOC_DO[cap];
  const mucDem = (moiPhut, [it, vua]) => (moiPhut <= it ? "it" : moiPhut <= vua ? "vua" : "nhieu");
  return {
    du_lieu: true,
    cap,
    so_tu: that.length,
    giay_noi: tron1(giay),
    toc_do: Math.round(tocDo),
    so_ngat: ngat.length,
    ngat_dai_nhat: tron1(ngat.length ? Math.max(...ngat) : 0),
    tong_ngat: tron1(ngat.reduce((n, x) => n + x, 0)),
    tu_dem: tuDem,
    so_tu_dem: soTuDem,
    so_lap: soLap,
    muc: {
      toc_do: tocDo < cham * 0.75 ? "cham" : tocDo < cham ? "hoi_cham" : tocDo <= nhanh ? "tot" : "nhanh",
      ngap_ngung: mucDem(ngat.length / phut, NGUONG.ngap_ngung[cap]),
      tu_dem: mucDem(soTuDem / phut, NGUONG.tu_dem[cap]),
      lap_tu: mucDem(soLap / phut, NGUONG.lap_tu[cap]),
    },
  };
}

/* Dòng sự thật đưa vào lời nhắc AI. AI được dặn KHÔNG nêu con số cho học sinh. */
export function dongTroiChay(tc) {
  if (!tc?.du_lieu) return "";
  return [
    "ĐỘ TRÔI CHẢY (máy đo từ dấu thời gian của từng từ, là sự thật, đừng đo lại):",
    `- Tốc độ: ${tc.toc_do} từ/phút, mức « ${tc.muc.toc_do} » so với trình độ ${tc.cap}.`,
    `- Chỗ ngập ngừng từ ${NGAT_GIAY} giây: ${tc.so_ngat} chỗ trong ${tc.giay_noi} giây nói (dài nhất ${tc.ngat_dai_nhat} giây), mức « ${tc.muc.ngap_ngung} ».`,
    `- Từ đệm (euh, hum…): ${tc.so_tu_dem}, mức « ${tc.muc.tu_dem} » (máy chép lời có thể bỏ sót từ đệm).`,
    `- Lặp từ liền nhau: ${tc.so_lap}, mức « ${tc.muc.lap_tu} ».`,
  ].join("\n");
}

/* Câu mẫu gửi kèm whisper để nó CHÉP LẠI từ đệm thay vì làm sạch câu. Không chứa nội dung đề, để
   máy không đoán hộ lời học sinh. */
export const GOI_Y_CHEP_TU_DEM = "Euh... alors, euh, je pense que, hum, c'est... c'est bien.";
