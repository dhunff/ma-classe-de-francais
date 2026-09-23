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

/* ── QUÉT MỌI MÀN HỌC SINH, không chỉ hai file ở trên ──
   Lần đầu bộ kiểm này chỉ soi PracticeHub + Student.jsx — đúng hai chỗ đã
   biết hỏng. Màn học sinh MỚI viết sau này sẽ đi lọt. Nay quét cả thư mục:
   file nào ngoài danh sách GHIM mà đọc một trong năm trường migration 022 đã gỡ
   (answer, accepted, answers, justification, model) thì đỏ. */
{
  const { readdirSync } = await import("node:fs");
  const TRUONG_BI_GO = /q\.(answer|answers|accepted|justification|model)(?![A-Za-z0-9_])|fillAccepted\(/;
  const DA_GHIM = new Set(["src/PracticeHub.jsx", "src/screens/student/Student.jsx",
    "src/screens/student/answers.jsx"]);   // hai file đầu ghim ở trên; answers.jsx nhận dapAn qua prop, có ca riêng
  const thuMuc = ["src/screens/student", "src/screens/exam", "src/screens/dashboard"];
  const la = [];
  for (const d of thuMuc) {
    for (const f of readdirSync(new URL("../" + d, import.meta.url))) {
      if (!/\.jsx?$/.test(f)) continue;
      const tep = `${d}/${f}`;
      if (DA_GHIM.has(tep)) continue;
      doc(tep).split(/\r?\n/).forEach((dong, i) => {
        if (TRUONG_BI_GO.test(dong)) la.push(`${tep}:${i + 1}  ${dong.trim().slice(0, 70)}`);
      });
    }
  }
  if (la.length === 0) pass++;
  else no(`${la.length} chỗ ở màn học sinh đọc trường mà migration 022 đã gỡ khỏi trình duyệt:\n`
    + la.map((x) => "        " + x).join("\n")
    + "\n      Với học sinh các trường đó là undefined. Dùng kết quả máy chủ (expected), hoặc ghim kèm lý do.");
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

  /* ══ ĐIỀN TỪ · CHIA ĐỘNG TỪ ══
     `fillAccepted` đọc `q.accepted`, cũng bị 022 gỡ (payload - 'accepted').
     Gọi thẳng nó trong phần HIỂN THỊ thì khối « Réponse attendue : » hiện ra
     rồi bỏ trống — một lời hứa không giữ. */
  t("đáp án điền từ đi qua dapAnFill", /const dapAnFill = \(q\) => \{/.test(ph), true);

  /* Ca này từng quá tay: nó cấm TIỆT `fillAccepted` trong phần hiển thị, và
     báo đỏ trên dòng nằm trong khối « Sujet et Corrigé » — khối CHỈ giáo viên
     mở được, nơi đọc đáp án là đúng. Bộ kiểm phạt một dòng hoàn toàn hợp lệ
     thì nó dạy người ta bỏ qua chính nó. Nên ghim kèm lý do, đúng nếp
     DUOC_PHEP ở trên. */
  const FILL_DUOC_PHEP = [
    { khop: /✅ <strong style=\{\{ color: C\.ok \}\}>\{String\(fillAccepted\(q\)\)/,
      ly_do: "khối « Sujet et Corrigé », chỉ giáo viên mở được" },
    { khop: /const cuc = fillAccepted\(q\);/,
      ly_do: "nhánh lùi BÊN TRONG dapAnFill — chính là chỗ được phép hỏi đáp án cục bộ" },
  ];
  const dongFill = ph.split(/\r?\n/).filter((d) => /fillAccepted\(/.test(d));
  const laFill = dongFill.filter((d) => !FILL_DUOC_PHEP.some((p) => p.khop.test(d)));
  if (laFill.length === 0) pass++;
  else no(`PracticeHub.jsx: ${laFill.length} chỗ gọi fillAccepted CHƯA khai lý do.\n`
    + laFill.map((d) => "        " + d.trim().slice(0, 90)).join("\n")
    + "\n      Với học sinh `q.accepted` đã bị migration 022 gỡ — dùng dapAnFill(q).");
  t("khối « Réponse attendue » ẩn khi không có đáp án",
    /\(q\.type === "fill" \|\| q\.type === "conj"\) && dapAnFill\(q\)/.test(ph), true);

  /* ══ BẢNG OUI/NON ══
     `q.answers` cũng bị 022 gỡ; không truyền `dapAn` thì KHÔNG Ô NÀO được
     đánh dấu đúng, và bảng trông như học sinh sai sạch. */
  t("bảng nhận đáp án qua prop dapAn", /dapAn=\{remote\?\.\[q\.id\]\?\.expected/.test(ph), true);

  /* ══ SẮP XẾP CÂU ══
     Với học sinh `q.elements` là bản ĐÃ XÁO. Tô màu theo nó thì câu xếp đúng
     bị tô đỏ, và « Phrase correcte » in ra chính chuỗi lộn xộn đó. */
  t("OrdreBlocks nhận đáp án + kết luận của máy chủ",
    /dapAn=\{remote\?\.\[q\.id\]\?\.expected\} dung=/.test(ph), true);

  const ans = doc("src/screens/student/answers.jsx");
  t("OrdreBlocks nhận prop dapAn, dung", /correction, dapAn, dung \}\)/.test(ans), true);
  t("OrdreBlocks không so thứ tự bằng elements[i].id",
    /elements\[i\] && elements\[i\]\.id === id/.test(ans), false);

  /* Màn Devoirs không có kết quả chấm theo câu → không truyền dapAn/dung.
     Khi đó `q.elements` là bản xáo; so với nó là tô đỏ câu đúng và in « Phrase
     correcte » là một chuỗi lộn xộn. Cờ __daXao phải chặn cả hai. */
  t("OrdreBlocks không tô màu khi elements là bản xáo", /if \(q\.__daXao\) return null;/.test(ans), true);
  t("OrdreBlocks không in câu đúng từ bản xáo", /dung === undefined && !q\.__daXao \?/.test(ans), true);
  t("TableauCompare nhận prop dapAn", /correction, dapAn \}\)/.test(ans), true);
  t("TableauCompare không đọc thẳng q.answers khi chấm",
    (ans.match(/const good = q\.answers\?\.\[key\]/g) ?? []).length, 0);
}

/* ── ordreOk so theo CHỮ, không theo id ──
   Câu « Le train de nuit… chutes de neige » có hai mảnh « de ». So theo id thì
   đổi chỗ hai chữ « de » — ra đúng câu y hệt — vẫn bị chấm sai. */
{
  const { ordreOk } = await import("../src/shared/questions.js");
  const q = { elements: [
    { id: "a", texte: "Le" }, { id: "b", texte: "de" }, { id: "c", texte: "nuit" },
    { id: "d", texte: "de" }, { id: "e", texte: "neige." }] };
  t("ordre: đúng thứ tự", ordreOk(q, ["a", "b", "c", "d", "e"]), true);
  t("ordre: đổi chỗ hai mảnh trùng chữ vẫn đúng", ordreOk(q, ["a", "d", "c", "b", "e"]), true);
  t("ordre: sai thứ tự thật thì sai", ordreOk(q, ["a", "c", "b", "d", "e"]), false);
  t("ordre: thiếu mảnh thì sai", ordreOk(q, ["a", "b", "c", "d"]), false);
}

/* ── Lưu câu ordre khi CHƯA có thứ tự đúng phải bị TỪ CHỐI ──
   Nguyên nhân 4/4 câu ordre trên production mang đáp án bị xáo (đo 23/09). */
{
  const { toRows } = await import("../src/shared/exerciseMap.js");
  const ex = (co) => ({ id: "x1", title: "t", level: "B1", skill: "g", questions: [{
    id: "q1", type: "ordre", prompt: "p",
    elements: [{ id: "a", texte: "Le" }, { id: "b", texte: "chat" }], ...(co ? { __daXao: true } : {}) }] });
  let tuChoi = false; try { toRows(ex(true), "practice"); } catch { tuChoi = true; }
  t("toRows từ chối câu ordre mang cờ __daXao", tuChoi, true);
  const r = toRows(ex(false), "practice").qRows[0];
  t("không cờ thì lưu, đáp án đúng thứ tự", r.answer_key.elements.map((e) => e.texte).join(" "), "Le chat");
  t("cờ __daXao không lọt vào payload", "__daXao" in r.payload, false);

  const st = doc("src/shared/exerciseStore.js");

  /* ══ LƯU BÀI KHÔNG ĐƯỢC XOÁ NEO (23/09) ══
     saveExercise xoá rồi chèn lại câu hỏi; `evidence` không cấp SELECT cho
     trình duyệt. Giáo viên không nhận neo lúc mở bài thì mỗi lần Lưu ghi
     `evidence: null` — 7 neo đã mất đúng như thế. */
  t("giáo viên nhận neo khi mở bài", /supabase\.rpc\("get_neo_giao_vien"/.test(st), true);
  t("neo được đặt vào payload.evidence để toRows ghi lại",
    /\.evidence = ev;/.test(st), true);
  t("saveExercise TỪ CHỐI khi tải thiếu đáp án hoặc neo — và từ chối TRƯỚC lệnh xoá",
    st.indexOf("if (thieuDuLieuAn) {") > -1
      && st.indexOf("if (thieuDuLieuAn) {") < st.indexOf('.from("questions").delete()'), true);
  /* answers.question_id là ON DELETE CASCADE: xoá-rồi-chèn = xoá lịch sử
     trả lời của học sinh mỗi lần Lưu (mất 70 dòng thật trước 24/09). */
  t("saveExercise ghi đè câu hỏi theo id (upsert), không xoá hết rồi chèn",
    /\.from\("questions"\)\.upsert\(qRows/.test(st) && !/\.from\("questions"\)\.insert\(/.test(st), true);
  t("lệnh xoá câu hỏi chỉ xoá câu KHÔNG còn trong bài, và chạy SAU upsert",
    /\.not\("id", "in"/.test(st)
      && st.indexOf('.from("questions").upsert(') < st.indexOf('.from("questions").delete()'), true);
  t("cờ thiếu dữ liệu được đặt lại mỗi lần tải", /thieuDuLieuAn = null;\s*\n/.test(st), true);

  const { toRows: tr } = await import("../src/shared/exerciseMap.js");
  const dong = tr({ id: "x", title: "t", level: "B1", skill: "g", questions: [{
    id: "q", type: "qcm", prompt: "p", options: ["a", "b"], answer: 1,
    evidence: { trich: "doan", pieges: [] } }] }, "practice").qRows[0];
  t("toRows ghi neo vào cột evidence", dong.evidence?.trich, "doan");
  t("neo KHÔNG lọt vào payload (anon đọc được payload)", "evidence" in dong.payload, false);

  t("saveExercise bắt lỗi toRows TRƯỚC lệnh xoá",
    st.indexOf("try { ({ exRow, qRows } = toRows(") > -1
      && st.indexOf("try { ({ exRow, qRows } = toRows(") < st.indexOf('.from("questions").delete()'), true);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
