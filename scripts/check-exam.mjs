/* Quy đổi điểm và luật đạt/trượt của thi thử.
 *
 * Cái đồng hồ không phải chỗ dễ sai. Chỗ dễ sai là ở đây: bài trong thư viện
 * có 7 / 8 / 15 câu, còn DELF chấm mỗi phần trên 25, nên "6 đúng" nghĩa là gì
 * hoàn toàn phụ thuộc vào phép quy đổi. Và luật đạt có HAI vế — quên vế thứ
 * hai thì hệ thống báo "đạt" cho một người sẽ trượt thật.
 */

import { EXAM_STRUCTURE, sectionScore, verdict, ghiPhan, gomTheoKyNang, NGUONG_PHAN,
  chiaLuotThi, gopDiemKyNang }
  from "../src/screens/exam/examPaper.js";
import { readFileSync } from "node:fs";

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

/* ── Cả bốn trình độ đều soạn được đề ──
 *
 * Trước 28/08 chỉ có B1/B2, nên giáo viên dạy lớp A1 mở trình soạn ra là gặp
 * một bộ chọn trình độ không có lớp của mình. Không có lỗi nào hiện ra — chỉ
 * là thiếu, và thiếu thì im lặng.
 *
 * Thang chấm ở delfGrille.js đã phủ đủ A1–B2 từ lâu; chỉ cấu trúc đề bị bỏ
 * lại. Ca này buộc hai bên đi cùng nhau. */
for (const lv of ["A1", "A2", "B1", "B2"]) {
  /* `t` là (tên, thực_tế, mong_đợi) — thiếu tham số thứ ba thì `want` là
     undefined và ca luôn đỏ, kể cả khi mọi thứ đúng. Đã quên đúng chỗ này một
     lần ở check:bareme rồi. */
  t(`${lv}: có cấu trúc đề`,
    Array.isArray(EXAM_STRUCTURE[lv]) && EXAM_STRUCTURE[lv].length > 0, true);
  if (!EXAM_STRUCTURE[lv]) continue;
  t(`${lv}: đủ ba phần CO/CE/PE`,
    EXAM_STRUCTURE[lv].map((x) => x.code).join(","), "CO,CE,PE");
  t(`${lv}: mỗi phần 25 điểm`, EXAM_STRUCTURE[lv].every((x) => x.points === 25), true);
  t(`${lv}: thời lượng đều dương`, EXAM_STRUCTURE[lv].every((x) => x.minutes > 0), true);
  t(`${lv}: không có phần thi nói`,
    EXAM_STRUCTURE[lv].some((x) => x.code === "PO"), false);
  /* Kỹ năng phải khớp HỆT chuỗi trong `exercises.skills`, nếu không bộ lọc của
     trình soạn đề trả về rỗng và giáo viên đọc "Thư viện chưa có bài" trong khi
     thư viện có đủ. */
  t(`${lv}: tên kỹ năng đúng bộ`,
    EXAM_STRUCTURE[lv].map((x) => x.skill).join(","),
    "Écoute,Lecture,Production écrite");
}

/* Thời lượng phải TĂNG dần theo trình độ ở phần đọc và viết — đó là thực tế
   của kỳ thi, và một con số chép nhầm sẽ lọt qua mọi ca ở trên. */
for (const code of ["CE", "PE"]) {
  const phut = ["A1", "A2", "B1", "B2"].map(
    (lv) => EXAM_STRUCTURE[lv].find((x) => x.code === code).minutes);
  t(`${code}: thời lượng không giảm khi lên trình độ`,
    phut.every((v, i) => i === 0 || v >= phut[i - 1]), true, phut.join(" → "));
}

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

/* ── Gom bài theo kỹ năng (migration 044) ──
 *
 * Một kỹ năng chứa được nhiều bài. Chỗ dễ sai nhất không phải việc gom, mà là
 * ĐỒNG HỒ và ĐIỂM: chúng thuộc về cả khối, không phải từng bài. Cộng dồn thì
 * đề CO ba bài thành 75 phút và 75 điểm — vẫn chạy, vẫn hiện ra số, chỉ là sai
 * hoàn toàn so với kỳ thi thật. */
const bai = (id) => ({ id, questions: [{ id: id + "-q" }] });
const dong = (code, exId, ord, minutes = 25, points = 25) =>
  ({ code, ord, minutes, points, exercise: bai(exId) });

{
  const khoi = gomTheoKyNang([
    dong("CO", "co1", 0), dong("CO", "co2", 1), dong("CO", "co3", 2),
    dong("CE", "ce1", 3, 45), dong("CE", "ce2", 4, 45),
    dong("PE", "pe1", 5, 45),
  ]);
  t("gom thành 3 khối", khoi.map((k) => k.code), ["CO", "CE", "PE"]);
  t("CO giữ đủ 3 bài", khoi[0].exercises.map((e) => e.id), ["co1", "co2", "co3"]);
  t("CE giữ đủ 2 bài", khoi[1].exercises.length, 2);
  t("đồng hồ KHÔNG cộng dồn", khoi[0].minutes, 25);
  t("điểm KHÔNG cộng dồn", khoi[0].points, 25);
  t("tổng điểm cả đề vẫn 75", khoi.reduce((n, k) => n + k.points, 0), 75);
}

{
  /* Thứ tự phải theo `ord`, không theo thứ tự dòng trả về từ database —
     PostgREST không hứa hẹn thứ tự nếu không `order by`. */
  const khoi = gomTheoKyNang([
    dong("PE", "pe1", 5), dong("CO", "co2", 1), dong("CE", "ce1", 3),
    dong("CO", "co1", 0),
  ]);
  t("khối xếp theo thứ tự làm bài", khoi.map((k) => k.code), ["CO", "CE", "PE"]);
  t("bài trong khối xếp theo ord", khoi[0].exercises.map((e) => e.id), ["co1", "co2"]);
}

{
  /* Phần thi trỏ tới bài học sinh không mở được (bài trả phí, RLS 019 giấu) về
     với `exercise` undefined. Khối vẫn phải tồn tại — mất khối là mất luôn
     đồng hồ và điểm của phần ấy, và đề trông như chỉ có hai phần. */
  const khoi = gomTheoKyNang([
    { code: "CO", ord: 0, minutes: 25, points: 25 },
    dong("CE", "ce1", 1, 45),
  ]);
  t("phần thiếu bài vẫn thành khối", khoi.map((k) => k.code), ["CO", "CE"]);
  t("khối thiếu bài có mảng rỗng", khoi[0].exercises.length, 0);
}

t("không có phần thi nào thì không có khối nào", gomTheoKyNang([]).length, 0);
t("đầu vào null không làm nổ", gomTheoKyNang(null).length, 0);

/* ── nhãn kỹ năng ──
 *
 * `exam_sections` chỉ lưu « CO ». Nếu khối không mang theo tên đầy đủ thì
 * thanh tiêu đề lúc đang thi trống trơn, và không có gì báo — chỉ là một
 * dòng chữ không hiện ra. */
{
  const khoi = gomTheoKyNang([dong("CO", "co1", 0), dong("CE", "ce1", 1, 45)]);
  t("khối mang tên đầy đủ của kỹ năng",
    khoi.map((k) => k.label), ["Compréhension de l'oral", "Compréhension des écrits"]);
  t("code lạ không làm nhãn thành undefined",
    gomTheoKyNang([{ code: "XX", ord: 0 }])[0].label, "XX");
}

/* ── màn kết quả không đọc thẳng `.exercise.` ──
 *
 * Đã sập thật trên production: bản ghi kết quả bỏ trường `exercise` khi một
 * phần có nhiều bài, nhưng JSX vẫn đọc `s.exercise.title` → cả trang trắng
 * với « Cannot read properties of undefined ». Một dòng chữ phụ làm mất
 * luôn kết quả cả buổi thi.
 *
 * Kiểm bằng văn bản vì `check:exam` chạy node và không dựng được JSX. Thô,
 * nhưng bắt đúng lớp lỗi đã xảy ra. */
{
  const src = readFileSync(new URL("../src/screens/exam/ExamMode.jsx", import.meta.url), "utf8");
  const xau = src.split(".exercise.").length - 1;
  t("ExamMode không đọc .exercise. mà thiếu ?.", xau, 0);
}

/* ══ TRANG KẾT QUẢ: một kỹ năng = MỘT dòng, một buổi thi = MỘT thẻ ══
 *
 * Hai lỗi đã lọt lên production cùng lúc, và cộng hưởng với nhau:
 *
 *   1. `examResults` làm `list.map(r => …)` — mỗi dòng `attempts` thành một
 *      phần thi. Từ 044 một kỹ năng có nhiều bài, mỗi bài một dòng `attempts`.
 *   2. Gom lượt thi chỉ theo `exam_id`, nên thi lại cùng đề thì mọi buổi dính
 *      vào một khối.
 *
 * Người dùng thấy: một đề ba kỹ năng hiện 13 dòng, tổng 104.5/375 thay vì /75.
 * Và tệ hơn con số — mỗi BÀI bị đo riêng theo ngưỡng 5/25, nên một bài khó kéo
 * cả buổi xuống "Chưa đạt" dù kỹ năng đó đạt. */

/* ── cắt buổi thi theo khoảng trống thời gian ── */
{
  const r = (h, id) => ({ finished_at: "2026-08-28T00:00:00Z".replace("00:", String(h).padStart(2, "0") + ":"), exercise_id: id });
  const lien = [r(9, "a"), r(10, "b"), r(11, "c")];
  t("ba bài liền nhau là MỘT buổi", chiaLuotThi(lien).length, 1);

  const xa = [r(9, "a"), r(10, "b"), r(20, "c")];
  t("cách 10 giờ thì tách thành hai buổi", chiaLuotThi(xa).map((x) => x.length), [2, 1]);

  /* Đúng ngưỡng thì vẫn CÙNG buổi — biên phải nằm về phía gộp, vì cắt đôi một
     buổi có nghỉ giải lao trông như dữ liệu bị mất. */
  t("đúng 4 giờ vẫn là một buổi", chiaLuotThi([r(9, "a"), r(13, "b")]).length, 1);
  t("hơn 4 giờ một chút thì tách", chiaLuotThi([r(9, "a"), r(14, "b")]).length, 2);

  t("đầu vào rỗng không làm nổ", chiaLuotThi([]).length, 0);
  t("null không làm nổ", chiaLuotThi(null).length, 0);

  /* Thứ tự vào lộn xộn vẫn phải ra đúng — `attempts` về theo thời gian GIẢM. */
  t("đầu vào ngược thứ tự vẫn gom đúng",
    chiaLuotThi([r(20, "c"), r(9, "a"), r(10, "b")]).map((x) => x.length), [2, 1]);
}

/* ── gộp nhiều bài của MỘT kỹ năng ── */
{
  /* Đây là ca quan trọng nhất: cộng THÔ rồi quy đổi MỘT LẦN.
     Bài 7 câu đúng 7, bài 15 câu đúng 0 → 7/22, KHÔNG phải (25 + 0) / 2. */
  t("cộng thô rồi quy đổi một lần",
    gopDiemKyNang([{ score: 7, max: 7 }, { score: 0, max: 15 }], 25), sectionScore(7, 22, 25));
  t("KHÔNG phải trung bình của hai bài",
    gopDiemKyNang([{ score: 7, max: 7 }, { score: 0, max: 15 }], 25) === 12.5, false);

  t("một bài thì giống hệt sectionScore", gopDiemKyNang([{ score: 4, max: 8 }], 25), 12.5);
  t("đúng hết mọi bài → trọn điểm", gopDiemKyNang([{ score: 7, max: 7 }, { score: 15, max: 15 }], 25), 25);
  t("sai hết → 0", gopDiemKyNang([{ score: 0, max: 7 }, { score: 0, max: 15 }], 25), 0);

  /* max = 0 nghĩa là không có câu nào máy chấm được (phần viết) → CHỜ CHẤM,
     không phải 0 điểm. Trả 0 ở đây là báo học sinh trượt phần họ chưa được
     chấm. */
  t("không có câu máy chấm → null, không phải 0",
    gopDiemKyNang([{ score: 0, max: 0 }], 25), null);
  t("mảng rỗng → null", gopDiemKyNang([], 25), null);
  t("null → null", gopDiemKyNang(null, 25), null);
}

/* ══ Bài thi KHÔNG lưu được thì phải NÓI RA ══
 *
 * Edge Function `grade` ghi `attempts` bên trong `if (userId)`, còn câu trả
 * về nằm NGOÀI khối đó. Máy chủ không nhận ra người gọi — phiên hết hạn, chưa
 * đăng nhập — thì nó vẫn chấm, vẫn trả điểm ĐÚNG, chỉ là `attemptId: null` và
 * không ghi dòng nào.
 *
 * Đã xảy ra thật: một buổi thi đầy đủ hiện CO 19 / CE 14.5, database không có
 * lấy một dòng. Học sinh chỉ biết khi mở trang Kết quả thi và không thấy buổi
 * thi ấy — lúc đó bài làm đã mất hẳn.
 *
 * Lần thứ TƯ cùng một lỗi trong dự án (saveExam, saveExercise, sendAnnonce).
 * Ca này đọc mã nguồn vì nó canh một dòng trông vô hại. */
{
  const src = readFileSync(new URL("../src/screens/exam/ExamMode.jsx", import.meta.url), "utf8");
  /* Bỏ chú thích trước khi soi — file này TRÍCH DẪN đoạn mã sai để giải thích
     vì sao không được viết nó. Lần thứ tư cùng cái bẫy; xem CLAUDE.md. */
  const ma = src.replace(new RegExp("\\/\\*[\\s\\S]*?\\*\\/", "g"), " ")
    .split(new RegExp("\\r?\\n")).map((x) => x.replace(new RegExp("^\\s*\\/\\/.*$"), "")).join("\n");

  t("theo dõi được attempt có ghi hay không", ma.includes("luuDuoc"), true);
  t("coi attemptId rỗng là KHÔNG lưu được", ma.includes("luuDuoc = false"), true);
  t("cờ đi kèm bản ghi kết quả", ma.includes("      luuDuoc,"), true);
  t("màn kết quả đọc cờ đó", ma.includes("s.luuDuoc === false"), true);
}
/* ══ Edge Function `grade`: hai thứ đã làm mất một buổi thi ══
 *
 * 1. `auth.getUser()` gọi KHÔNG THAM SỐ. Trong Deno không có nơi lưu phiên,
 *    nên nó chỉ chạy nếu thư viện tự đọc header Authorization — việc không
 *    nằm trong hợp đồng và đã đổi giữa các bản v2. Dạng đúng là
 *    `getUser(token)`.
 *
 * 2. Import KHÔNG GHIM phiên bản. `@supabase/supabase-js@2` trỏ tới bản mới
 *    nhất tại thời điểm khởi động nguội, nên hành vi đổi được mà ta không
 *    deploy gì cả. Đúng thứ đã xảy ra: 28/08 ghi được, 30/08 thì không.
 *
 * Hậu quả chung: hàm vẫn chấm, vẫn trả điểm đúng, và không lưu gì. Ca kiểm
 * dùng includes() chứ không regex — chuỗi cần tìm đầy dấu chéo, và regex qua
 * đường ống shell là chỗ đã sai bảy lần trong dự án này. */
{
  const fn = readFileSync(new URL("../supabase/functions/grade/index.ts", import.meta.url), "utf8");

  t("grade truyền token vào getUser", fn.includes("auth.getUser(token)"), true);
  /* Bỏ khối chú thích, không dùng regex: chuỗi cần tìm đầy dấu chéo và
     regex qua đường ống shell đã sai bảy lần trong dự án này. Cắt từ mỗi "/*"
     tới "*" + "/" gần nhất là đủ cho mục đích ở đây. */
  const boKhoi = (src) => src.split("/" + "*")
    .map((x, k) => (k === 0 ? x : x.slice(x.indexOf("*" + "/") + 2))).join("");
  t("grade không gọi getUser() rỗng ngoài chú thích",
    boKhoi(fn).includes("auth.getUser()"), false);
  t("grade ghi log khi không nhận ra người gọi",
    fn.includes("CHẤM NHƯNG KHÔNG LƯU"), true);
}

/* Mọi Edge Function phải GHIM phiên bản thư viện. */
{
  const ds = ["grade", "grant-access", "sepay-webhook"];
  const khongGhim = ds.filter((f) => {
    const src = readFileSync(new URL(`../supabase/functions/${f}/index.ts`, import.meta.url), "utf8");
    return src.includes("supabase-js@2\";") || src.includes("supabase-js@2'");
  });
  t("không Edge Function nào để phiên bản trôi", khongGhim, []);
}
console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
