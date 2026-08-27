/* Quy đổi điểm và luật đạt/trượt của thi thử.
 *
 * Cái đồng hồ không phải chỗ dễ sai. Chỗ dễ sai là ở đây: bài trong thư viện
 * có 7 / 8 / 15 câu, còn DELF chấm mỗi phần trên 25, nên "6 đúng" nghĩa là gì
 * hoàn toàn phụ thuộc vào phép quy đổi. Và luật đạt có HAI vế — quên vế thứ
 * hai thì hệ thống báo "đạt" cho một người sẽ trượt thật.
 */

import { EXAM_STRUCTURE, sectionScore, verdict, ghiPhan, NGUONG_PHAN }
  from "../src/screens/exam/examPaper.js";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

/* ── quy đổi ── */
t("8/8 → 25", sectionScore(8, 8), 25);
t("0/8 → 0", sectionScore(0, 8), 0);
t("4/8 → 12.5", sectionScore(4, 8), 12.5);
t("7 câu và 15 câu cùng tỉ lệ thì cùng điểm",
  sectionScore(7, 7) === sectionScore(15, 15), true);
t("làm tròn tới nửa điểm", sectionScore(1, 7), 3.5);
t("bài rỗng không chia cho 0", sectionScore(0, 0), 0);

/* ── luật đạt: HAI vế ── */
const s = (score, points = 25) => ({ score, points });

t("đủ 50 và không phần nào dưới 5 → đạt",
  verdict([s(20), s(18), s(12)]).passed, true);
t("tổng 51 nhưng một phần 4/25 → TRƯỢT",
  verdict([s(24), s(23), s(4)]).passed, false);
t("phần yếu được liệt kê ra",
  verdict([s(24), s(23), s(4)]).weakSections.length, 1);
t("đúng 50 là đạt (ngưỡng bao gồm)",
  verdict([s(20), s(20), s(10)]).passed, true);
t("49 là trượt", verdict([s(20), s(20), s(9)]).passed, false);
t("đúng ngưỡng phần 5/25 vẫn đạt",
  verdict([s(25), s(25), s(NGUONG_PHAN)]).passed, true);

/* ── phần chưa chấm: KHÔNG được đoán ── */
const treo = verdict([s(20), s(18), { score: null, points: 25 }]);
t("còn phần chưa chấm → chưa kết luận", treo.passed, null);
t("phần chưa chấm được liệt kê", treo.pending.length, 1);
t("tổng chỉ cộng phần đã chấm", treo.total, 38);

t("chắc chắn trượt dù chưa chấm hết: có phần dưới ngưỡng",
  verdict([s(25), s(3), { score: null, points: 25 }]).passed, false);
t("chắc chắn trượt dù chưa chấm hết: tối đa vẫn không đủ 50",
  verdict([s(10), s(10), { score: null, points: 25 }]).passed, false);
t("còn cứu được thì vẫn để ngỏ",
  verdict([s(13), s(13), { score: null, points: 25 }]).passed, null);

/* Các ca kiểm `assemblePaper` từng ở đây, gỡ cùng hàm đó — xem examPaper.js. */

/* PO cố ý không có: 25/100 của kỳ thi thật, hệ thống chưa tổ chức được. */
t("không bịa ra phần thi nói",
  EXAM_STRUCTURE.B1.some((x) => x.code === "PO"), false);

/* ── Nộp một phần hai lần không được sinh ra hai bản ghi ──
 *
 * Tái hiện đúng lỗi đã gặp: người dùng bấm « Terminer cette partie » năm lần
 * trong lúc `gradeRemote` còn đang chạy. Bản cũ nối thêm mỗi lần, nên màn kết
 * quả hiện năm thẻ CO và `verdict` cộng cả năm — 47,5/150 thay vì 9,5/75.
 *
 * Kiểm CẢ HAI con số. Chỉ kiểm tử số thì một bản sửa nửa vời — gộp thẻ nhưng
 * vẫn cộng `points` năm lần — sẽ đi lọt. */
const phanCO = (diem) => ({ code: "CO", points: 25, score: diem });

{
  let ds = [];
  for (let i = 0; i < 5; i++) ds = ghiPhan(ds, phanCO(9.5));
  t("bấm nộp 5 lần → vẫn 1 phần", ds.length, 1);
  t("bấm nộp 5 lần → tổng không nhân lên", verdict(ds).total, 9.5);
  t("bấm nộp 5 lần → mẫu số không nhân lên", verdict(ds).maxScored, 25);
}

{
  /* Ba phần khác nhau vẫn phải nối bình thường — bản sửa không được chặn nhầm
     đường đi đúng. */
  let ds = [];
  ds = ghiPhan(ds, { code: "CO", points: 25, score: 20 });
  ds = ghiPhan(ds, { code: "CE", points: 25, score: 15 });
  ds = ghiPhan(ds, { code: "PE", points: 25, score: null });
  t("ba phần khác nhau đều được ghi", ds.length, 3);
  t("tổng cộng đúng ba phần đã chấm", verdict(ds).total, 35);
  t("mẫu số chỉ tính phần đã chấm", verdict(ds).maxScored, 50);
  t("PE vẫn ở trạng thái chờ chấm", verdict(ds).pending.length, 1);
}

{
  /* Nộp lại cùng một phần phải GHI ĐÈ, không giữ điểm cũ. Xảy ra khi lần nộp
     đầu lỗi mạng và người dùng thử lại. */
  let ds = ghiPhan([], phanCO(4));
  ds = ghiPhan(ds, phanCO(18));
  t("nộp lại thì lấy điểm mới", ds[0].score, 18);
  t("nộp lại không sinh thêm dòng", ds.length, 1);
}

{
  /* Thứ tự phải giữ nguyên: CO trước CE trước PE, đúng thứ tự làm bài. Ghi đè
     mà đẩy phần đó xuống cuối thì danh sách kết quả xáo trộn sau mỗi lần thử
     lại — trông như lỗi hiển thị, thật ra là lỗi ở đây. */
  let ds = [];
  ds = ghiPhan(ds, { code: "CO", points: 25, score: 10 });
  ds = ghiPhan(ds, { code: "CE", points: 25, score: 10 });
  ds = ghiPhan(ds, { code: "CO", points: 25, score: 20 });
  t("ghi đè giữ nguyên thứ tự", ds.map((x) => x.code).join(","), "CO,CE");
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
