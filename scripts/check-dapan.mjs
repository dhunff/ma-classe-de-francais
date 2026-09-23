/* Màn hình của HỌC SINH không được dựa vào `q.answer`.
 *
 * ══ LỖI BỘ KIỂM NÀY SINH RA ĐỂ BẮT ══
 *
 * Từ migration 022, `answer_key` KHÔNG cấp SELECT cho trình duyệt. Giáo viên
 * vẫn nhận đáp án qua RPC `get_answer_keys`; HỌC SINH thì không, nên với họ
 * `q.answer` là `undefined` — im lặng, không lỗi, không cảnh báo.
 *
 * Hậu quả đã chạy trên production nhiều tuần (phát hiện 23/09/2026):
 *   · mọi câu hiện như SAI HẾT, kể cả câu làm đúng (`j === q.answer` không bao
 *     giờ khớp, còn nhánh `else if` tô đỏ ô học sinh chọn);
 *   · chữ bị gạch ngang trên chính ô đang tô xanh;
 *   · « Tu as obtenu 0/7 » cho một bài làm đúng gần hết, trong khi điểm máy
 *     chủ lưu vào lịch sử lại đúng — hai con số cho cùng một bài;
 *   · màn Devoirs in « Bonne réponse : undefined ».
 *
 * Không bộ kiểm nào bắt được: build xanh, mọi ca kiểm đọc mã nguồn xanh, và
 * trang xem thử KHÔNG lộ ra vì ở đó dữ liệu giả có sẵn `answer`. Chỉ một tài
 * khoản học sinh THẬT mới thấy.
 *
 * ══ CÁCH KIỂM ══
 *
 * Không cấm tiệt `q.answer` — vài chỗ dùng nó hợp lệ (nhánh lùi khi máy chủ
 * không trả lời, khối chỉ giáo viên thấy). Nên GHIM danh sách: mỗi lần dùng
 * phải có mặt ở đây kèm lý do. Thêm một chỗ đọc `q.answer` mới mà không khai
 * vào đây thì bộ kiểm đỏ — đúng nếp `CO_Y_KHONG_CO_MUC` của check:nav.
 */
import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const no = (m) => { fail++; console.log("  ✗ " + m); };
const t = (ten, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

/* Bỏ chú thích TRƯỚC khi soi — lần thứ bảy trong dự án. Chú thích tử tế TRÍCH
   DẪN đoạn mã sai để giải thích vì sao không được viết nó, và bộ kiểm đọc
   trúng câu trích dẫn ấy rồi báo đỏ trên một file hoàn toàn đúng. Tệ hơn: cách
   nhanh nhất làm nó xanh lại là XOÁ đoạn giải thích. */
const boChuThich = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .split(/\r?\n/).map((d) => d.replace(/^\s*\/\/.*$/, "")).join("\n");

const doc = (p) => boChuThich(readFileSync(new URL("../" + p, import.meta.url), "utf8"));

/* ── Danh sách GHIM: mỗi chỗ còn đọc `q.answer` phải khai lý do ở đây ── */
const DUOC_PHEP = {
  "src/PracticeHub.jsx": [
    { khop: /return q\.type === "qcm" \? answersRef\.current\[q\.id\] === q\.answer/,
      ly_do: "nhánh LÙI của isGood, chỉ chạy khi máy chủ không trả lời; và chỉ cho giáo viên (họ có đáp án)" },
    { khop: /q\.answer !== undefined \|\| q\.accepted !== undefined/,
      ly_do: "phép dò 'client còn đáp án không' — chính nó quyết định có chặn việc chấm tại chỗ hay không" },
    { khop: /String\.fromCharCode\(65 \+ q\.answer\)/,
      ly_do: "khối « Sujet et Corrigé », CHỈ giáo viên mở được (SplitTrain lọc theo teacher)" },
    { khop: /VF_OPTS\[q\.answer\]/,
      ly_do: "cùng khối « Sujet et Corrigé » chỉ giáo viên" },
    { khop: /q\.answer !== 2 && q\.justification/,
      ly_do: "chỉ để ẩn justification khi đáp án là « on ne sait pas »; thiếu đáp án thì hiện thừa, không sai" },
  ],
  "src/screens/student/Student.jsx": [
    { khop: /const biet = q\.answer !== undefined;/,
      ly_do: "đúng phép kiểm 'có biết đáp án không' mà bộ kiểm này đòi" },
    { khop: /\{good === false && <span> · Bonne réponse : <strong>\{VF_OPTS\[q\.answer\]\}/,
      ly_do: "chỉ in khi good === false, tức là CHẮC CHẮN biết đáp án" },
    { khop: /q\.answer !== 2 && q\.justification/,
      ly_do: "như trên" },
  ],
};

for (const [tep, phep] of Object.entries(DUOC_PHEP)) {
  const src = doc(tep);
  const dong = src.split(/\r?\n/).filter((d) => /q\.answer(?![A-Za-z0-9_])/.test(d));
  const la = dong.filter((d) => !phep.some((p) => p.khop.test(d)));
  if (la.length === 0) pass++;
  else {
    no(`${tep}: ${la.length} chỗ đọc q.answer CHƯA khai trong DUOC_PHEP.\n`
      + la.map((d) => "        " + d.trim().slice(0, 90)).join("\n")
      + `\n      Với học sinh q.answer là undefined. Dùng kết quả máy chủ, hoặc khai lý do vào scripts/check-dapan.mjs.`);
  }
}

/* ── Những chỗ BẮT BUỘC phải dùng kết quả máy chủ ── */
{
  const ph = doc("src/PracticeHub.jsx");

  /* Điểm hiển thị: phải lấy từ máy chủ khi có. Tự cộng lại là con đường dẫn
     thẳng tới « 0/7 » cho một bài làm đúng. */
  t("điểm hiển thị lấy từ máy chủ", /diemMayChu \? diemMayChu\.score/.test(ph), true);
  t("mẫu số cũng lấy từ máy chủ", /diemMayChu \? diemMayChu\.max/.test(ph), true);

  /* Tô màu: đáp án đúng lấy từ `expected` mà Edge Function gửi kèm. */
  t("ô tô màu đọc expected của máy chủ",
    (ph.match(/remote\?\.\[q\.id\]\?\.expected/g) ?? []).length >= 2, true);

  /* Gạch ngang phải theo ĐÚNG/SAI, không theo q.answer. */
  t("gạch ngang theo isGood, không theo q.answer",
    /textDecoration: graded && j === a && !isGood\(q\)/.test(ph), true);

  /* Mục « Sujet et Corrigé » chỉ giáo viên: hộp đó dựng đáp án từ q.answer. */
  t("menu Corrigé lọc theo teacher",
    /teacher \? \[\["corrige"/.test(ph), true);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
