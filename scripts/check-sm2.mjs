/* Lịch ôn SM-2 (src/shared/sm2.js) và đường ghi của nó (migration 063/065).
 *
 * ══ VÌ SAO BỘ KIỂM NÀY QUAN TRỌNG HƠN VẺ NGOÀI ══
 *
 * Một lịch ôn sai KHÔNG hiện ra như một lỗi. Không có màn hình nào đỏ, không
 * có ngoại lệ nào được ném. Nó chỉ khiến người học ôn quá dày (chán, bỏ) hoặc
 * quá thưa (quên sạch) — và cái giá trả bằng nhiều tháng học của người thật,
 * phát hiện thì đã muộn.
 *
 * Đây cũng là lý do phép tính nằm ở JS chứ không ở SQL: ở SQL thì nó chỉ chạy
 * được trên production và không bộ kiểm nào đọc nổi.
 *
 * Chứng minh bộ kiểm bắt được lỗi: đổi `reps === 2 ? 6` thành phép nhân ease,
 * hoặc bỏ phép kẹp sàn ease — phải FAIL.
 */

import { MUC, NGUONG_NHO, EASE_SAN, EASE_TRAN, QUANG_TOI_DA, ngayCong, onLai, xepLichOn }
  from "../src/shared/sm2.js";
import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};
const gan = (ten, got, want, sai = 0.001) => {
  if (Math.abs(got - want) <= sai) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${got}\n        want ≈${want}`); }
};

/* Mốc cố định: hàm nhận `moc` nên ca kiểm không phụ thuộc hôm nay là ngày nào.
   Một bộ kiểm đỏ lúc nửa đêm là một bộ kiểm không ai tin. */
const MOC = new Date(2026, 8, 2);      // 02/09/2026, giờ địa phương

/* ── Ngày: cái bẫy múi giờ ── */
{
  t("cộng 0 ngày trả về chính hôm đó", ngayCong(0, MOC), "2026-09-02");
  t("cộng 1 ngày", ngayCong(1, MOC), "2026-09-03");
  t("qua tháng", ngayCong(29, MOC), "2026-10-01");
  t("qua năm", ngayCong(120, MOC), "2026-12-31");

  /* `new Date(y, m, d + n)` tự chuẩn hoá tràn tháng/năm. Kiểm để chắc không ai
     "sửa" nó thành phép cộng tay trên số ngày. */
  t("năm nhuận: 29/02/2028 tồn tại", ngayCong(1, new Date(2028, 1, 28)), "2028-02-29");

  const src = readFileSync(new URL("../src/shared/sm2.js", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ");
  t("không dùng toISOString", /toISOString/.test(src), false);
}

/* ── Thẻ mới, trả lời tốt: 1 → 6 → nhân ease ── */
{
  const a = onLai({ reps: 0, ease: 2.5, interval_days: 1, lapses: 0 }, MUC.tot.q, MOC);
  t("lần đúng thứ nhất → 1 ngày", a.interval_days, 1);
  t("lần đúng thứ nhất → reps = 1", a.reps, 1);
  gan("q=4 không đổi ease", a.ease, 2.5);

  const b = onLai(a, MUC.tot.q, MOC);
  /* Hằng số 6, KHÔNG phải 1 × 2.5. Viết sai chỗ này thì thẻ mới nhảy thẳng
     sang 2–3 ngày và không bao giờ được củng cố. */
  t("lần đúng thứ hai → 6 ngày", b.interval_days, 6);

  const c = onLai(b, MUC.tot.q, MOC);
  t("từ lần ba mới nhân ease: 6 × 2.5 = 15", c.interval_days, 15);
  t("ngày đến hạn đi kèm quãng", c.due_at, ngayCong(15, MOC));

  const d = onLai(c, MUC.tot.q, MOC);
  t("lần bốn: 15 × 2.5 = 38 (làm tròn)", d.interval_days, 38);
}

/* ── Chất lượng khác nhau kéo ease đi đúng hướng ── */
{
  const nen = { reps: 3, ease: 2.5, interval_days: 10, lapses: 0 };
  gan("q=5 (Dễ) tăng ease", onLai(nen, MUC.de.q, MOC).ease, 2.6);
  gan("q=4 (Tốt) giữ nguyên ease", onLai(nen, MUC.tot.q, MOC).ease, 2.5);
  gan("q=3 (Khó) giảm ease", onLai(nen, MUC.kho.q, MOC).ease, 2.36);

  t("Dễ cho quãng dài hơn Tốt",
    onLai(nen, MUC.de.q, MOC).interval_days > onLai(nen, MUC.tot.q, MOC).interval_days, true);
  t("Khó cho quãng ngắn hơn Tốt",
    onLai(nen, MUC.kho.q, MOC).interval_days < onLai(nen, MUC.tot.q, MOC).interval_days, true);
}

/* ── Quên: về đầu, nhưng KHÔNG quên rằng thẻ này khó ── */
{
  const cu = { reps: 5, ease: 2.5, interval_days: 60, lapses: 1 };
  const r = onLai(cu, MUC.lai.q, MOC);
  t("quên → quãng về 1 ngày", r.interval_days, 1);
  t("quên → reps về 0", r.reps, 0);
  t("quên → lapses tăng", r.lapses, 2);
  t("quên → đến hạn ngày mai", r.due_at, ngayCong(1, MOC));

  /* ease VẪN giảm và VẪN được giữ. Đặt lại về 2.5 mỗi lần quên thì một thẻ
     khó mãi mãi được xếp lịch như một thẻ dễ — và người học gặp lại nó đúng
     vào lúc vừa kịp quên, lần này qua lần khác. */
  t("quên → ease giảm, không đặt lại về mặc định", r.ease < 2.5, true);
  gan("q=1 kéo ease xuống đúng công thức", r.ease, 2.5 - 0.54);

  /* Quên nhiều lần liên tiếp phải CHẠM SÀN chứ không xuống mãi. Không có sàn
     thì ease âm, quãng thành 0, và thẻ đó đến hạn mãi mãi. */
  let x = { reps: 0, ease: 2.5, interval_days: 1, lapses: 0 };
  for (let i = 0; i < 20; i++) x = onLai(x, MUC.lai.q, MOC);
  t("quên 20 lần: ease dừng ở sàn", x.ease, EASE_SAN);
  t("quãng vẫn hợp lệ sau 20 lần quên", x.interval_days >= 1, true);
}

/* ── Không vượt trần ── */
{
  let x = { reps: 3, ease: 2.5, interval_days: 300, lapses: 0 };
  for (let i = 0; i < 10; i++) x = onLai(x, MUC.de.q, MOC);
  t("quãng bị kẹp ở trần", x.interval_days, QUANG_TOI_DA);
  t("ease bị kẹp ở trần", x.ease <= EASE_TRAN, true);

  /* Cả hai phải nằm trong đúng khoảng mà ràng buộc CHECK của migration 063
     cho phép. Lệch một chút là mọi lần ghi đều bị database từ chối, và triệu
     chứng trên màn hình là "bấm Dễ xong không có gì xảy ra". */
  t("quãng luôn nằm trong [1, 365]", x.interval_days >= 1 && x.interval_days <= 365, true);
  t("ease luôn nằm trong [1.3, 3.0]", x.ease >= 1.3 && x.ease <= 3.0, true);
}

/* ── Trạng thái thiếu/hỏng không được làm đổ phép tính ── */
{
  const r = onLai(undefined, MUC.tot.q, MOC);
  t("thẻ chưa có lịch vẫn tính được", r.interval_days, 1);
  t("mặc định ease 2.5", r.ease, 2.5);

  const bay = onLai({ reps: -5, ease: NaN, interval_days: 0, lapses: -1 }, MUC.tot.q, MOC);
  t("số âm và NaN không lọt xuống database",
    bay.reps >= 0 && bay.lapses >= 0 && bay.ease >= EASE_SAN && bay.interval_days >= 1, true);
}

/* ── Thứ tự buổi ôn ── */
{
  const ds = [
    { card_id: "a", due_at: "2026-09-02", ease: 2.5 },
    { card_id: "b", due_at: "2026-08-20", ease: 2.5 },   // quá hạn lâu nhất
    { card_id: "c", due_at: "2026-09-02", ease: 1.4 },   // khó
    { card_id: "d", due_at: "2026-12-01", ease: 2.5 },   // chưa tới hạn
  ];
  const ra = xepLichOn(ds, "2026-09-02");
  t("chỉ lấy thẻ đến hạn", ra.map((x) => x.card_id), ["b", "c", "a"]);
  t("thẻ chưa tới hạn bị loại", ra.some((x) => x.card_id === "d"), false);
  t("danh sách rỗng không nổ", xepLichOn(undefined, "2026-09-02"), []);
}

/* ── Bốn nút phải phủ đúng thang, không chồng lấn ── */
{
  const q = Object.values(MUC).map((x) => x.q);
  t("bốn mức, không trùng nhau", new Set(q).size, 4);
  t("mọi mức nằm trong 0–5", q.every((x) => x >= 0 && x <= 5), true);
  t("đúng một mức nằm dưới ngưỡng nhớ", q.filter((x) => x < NGUONG_NHO).length, 1);
  t("mức thấp nhất là nút Quên rồi", Math.min(...q), MUC.lai.q);
}

/* ── SQL: đường ghi phải chặn đúng thứ JS đã kẹp ── */
{
  const sql = readFileSync(new URL("../supabase/migrations/063_the_ghi_nho.sql", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split(/\r?\n/).map((d) => d.replace(/--.*$/, "")).join("\n");
  const sua = readFileSync(new URL("../supabase/migrations/065_sua_quyen_reviews.sql", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split(/\r?\n/).map((d) => d.replace(/--.*$/, "")).join("\n");

  t("chặn quãng ngoài [1,365]", /interval_days between 1 and 365/.test(sql), true);
  t("chặn ease ngoài [1.3,3.0]", /ease between 1\.3 and 3\.0/.test(sql), true);
  t("một thẻ mỗi câu mỗi người", /unique \(user_id, source_question_id\)/.test(sql), true);
  t("không cho client chèn thẳng vào cards",
    /revoke insert, update, delete on public\.cards from anon, authenticated;/.test(sql), true);

  /* Hàm security definer chạy VÒNG QUA RLS, nên điều kiện "của chính mình"
     phải nằm ngay trong câu. Quên nó là mở cửa đọc bài người khác. */
  t("hàm sinh thẻ lọc theo user_id trong câu", /where t\.user_id = ai/.test(sql), true);
  t("hàm sinh thẻ là security definer",
    /create or replace function public\.tao_the_tu_lo_hong[\s\S]{0,400}?security definer/.test(sql), true);

  /* `revoke update (cột)` KHÔNG gỡ được quyền cấp ở mức BẢNG — lần thứ ba cùng
     cái bẫy này trong dự án (022, 024, rồi 063). Phải thu mức bảng trước. */
  t("thu UPDATE mức bảng trước", /revoke update on public\.reviews from anon, authenticated;/.test(sua), true);
  t("cấp lại đúng năm cột",
    /grant update \(due_at, interval_days, ease, lapses, reps\)/.test(sua), true);
  t("063 KHÔNG còn dựa vào revoke theo cột",
    /revoke update \(user_id, card_id\)/.test(sql) && !/revoke update on public\.reviews/.test(sql),
    true);
}

/* ══ NỐI VÀO ĐƯỜNG LÀM BÀI ══
 *
 * Thẻ nhập tay là thứ người học không bao giờ làm — mọi app thẻ ghi nhớ đều
 * chết ở chỗ đó. Nếu việc sinh thẻ chỉ nằm sau một cái nút thì tính năng này
 * coi như không tồn tại. */
{
  const boChuThich = (src) => src.replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split(/\r?\n/).map((d) => d.replace(/^\s*\/\/.*$/, '')).join('\n');
  const gr = boChuThich(readFileSync(new URL("../src/shared/gradeRemote.js", import.meta.url), "utf8"));
  const kho = boChuThich(readFileSync(new URL("../src/shared/theGhiNho.js", import.meta.url), "utf8"));
  const man = boChuThich(readFileSync(new URL("../src/screens/student/TheGhiNho.jsx", import.meta.url), "utf8"));

  t("chấm bài xong thì sinh thẻ", /sinhTheTuLoiSai\(/.test(gr), true);
  t("sai lại thì kéo thẻ về hôm nay", /datLaiTheSai\(/.test(gr), true);

  /* Chỉ lấy câu ĐÃ CHẤM và SAI. Câu tự luận có correct = null; xếp nó vào
     nhóm sai là sinh thẻ cho một bài viết, và mặt sau sẽ là lời giải thích
     không tồn tại. */
  t("chỉ lấy câu đã chấm và sai", /r.graded && r.correct === false/.test(gr), true);

  /* Đọc kết quả trước khi nói đã xong. Lần thứ năm trong dự án. */
  t("chamThe đọc kết quả trả về", /if \(error\) return { ok: false/.test(kho), true);
  t("màn ôn không bỏ qua lỗi ghi", /if \(!kq.ok\) {/.test(man), true);

  /* Bốn nút chỉ hiện SAU khi lật. Hiện sớm thì người học chọn theo cảm giác
     trước cả khi thử nhớ — mà chính lúc cố nhớ mới là lúc trí nhớ được củng
     cố. Toàn bộ giá trị của thẻ ghi nhớ nằm ở khoảnh khắc đó. */
  t("bốn nút nằm sau phép lật", man.indexOf("{lat && (") < man.indexOf("THU_TU.map"), true);

  /* Ba trạng thái: đang tải / không đọc được / danh sách thật. */
  t("phân biệt đang tải", /ds === undefined/.test(man), true);
  t("phân biệt không đọc được", /ds === null/.test(man), true);

  /* Màn hình phải TỰ tìm thẻ lần đầu. Chỉ sinh thẻ sau khi chấm bài và sau
     một cú bấm nút thì người đã làm hàng trăm câu TRƯỚC khi có tính năng
     này mở màn ra và thấy « không có thẻ nào » — đúng chữ, sai hoàn toàn
     về ý. Đo được 02/09: tài khoản có 111 câu trả lời, database 0 thẻ. */
  t("lần đầu mở màn thì tự tìm thẻ", /daTuTim/.test(man), true);

  /* Cờ chặn vòng lặp. Thiếu nó thì mỗi lần trả về 0 thẻ lại kích một lượt
     tìm nữa, mãi mãi — một vòng lặp mạng vô hạn mà không có gì báo. */
  t("có cờ chặn vòng lặp tự tìm", /if \(daTuTim \|\| /.test(man), true);
}
console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
