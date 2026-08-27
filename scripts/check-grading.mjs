import {
  sanitizeFrenchText, stripDiacritics, acceptedVariants, evaluateAnswer, evaluateQuestion,
} from "../src/shared/gradingEngine.js";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`);
};

/* --- chuẩn hoá --- */
t("trim + lowercase", sanitizeFrenchText("  Le Chat  "), "le chat");
t("nháy cong -> thẳng", sanitizeFrenchText("l’arbre"), "l'arbre");
t("élision có dấu cách", sanitizeFrenchText("l' arbre"), "l'arbre");
t("élision qu'", sanitizeFrenchText("qu' il vienne"), "qu'il vienne");
t("élision jusqu'", sanitizeFrenchText("jusqu' ici"), "jusqu'ici");
t("dấu cách đôi", sanitizeFrenchText("je  suis   allé"), "je suis allé");
t("espace insécable", sanitizeFrenchText("Comment\u00a0?"), "comment");
t("chữ ghép œ", sanitizeFrenchText("cœur"), "coeur");
t("chấm cuối bị cắt", sanitizeFrenchText("je suis allé."), "je suis allé");
t("phẩy GIỮA câu giữ nguyên", sanitizeFrenchText("l'eau, s'il te plaît"), "l'eau, s'il te plaît");
t("giữ dấu mặc định", sanitizeFrenchText("où"), "où");
t("bỏ dấu khi bật", sanitizeFrenchText("où", { stripAccents: true }), "ou");
t("stripDiacritics", stripDiacritics("çàéûï"), "caeui");

/* --- lấy đáp án: cả hai lược đồ --- */
t("mảng mới", acceptedVariants({ correctAnswers: ["suis allé", "suis allée"] }), ["suis allé", "suis allée"]);
t("chuỗi | cũ", acceptedVariants({ accepted: "suis allé|suis allée" }), ["suis allé", "suis allée"]);
t("answer đời đầu", acceptedVariants({ answer: "le chat" }), ["le chat"]);
t("rỗng", acceptedVariants({}), []);
t("bỏ khoảng thừa quanh |", acceptedVariants({ accepted: " a | b " }), ["a", "b"]);

/* --- chấm: dấu chặt (mặc định) --- */
const strict = (u, c) => evaluateAnswer(u, c).correct;
t("khớp đúng", strict("où", ["où"]), true);
t("thiếu dấu -> SAI khi chặt", strict("ou", ["où"]), false);
t("a vs à", strict("a", ["à"]), false);
t("sur vs sûr", strict("sur", ["sûr"]), false);
t("khớp biến thể thứ hai", strict("je suis allée", ["je suis allé", "je suis allée"]), true);
t("hoa/thường bỏ qua", strict("LE CHAT", ["le chat"]), true);
t("rỗng luôn sai", strict("", [""]), false);
t("rỗng vs đáp án thật", strict("   ", ["le chat"]), false);

/* --- chấm: dấu lỏng --- */
const loose = (u, c) => evaluateAnswer(u, c, { strictAccents: false }).correct;
t("thiếu dấu -> ĐÚNG khi lỏng", loose("ou", ["où"]), true);
t("eleve/élève", loose("eleve", ["élève"]), true);

/* --- chấm theo câu hỏi + thừa kế cờ --- */
const q = { accepted: "où", explanation: "« Où » avec accent = lieu." };
t("câu hỏi: chặt mặc định", evaluateQuestion(q, "ou").correct, false);
t("câu hỏi: kèm giải thích", evaluateQuestion(q, "ou").explanation, "« Où » avec accent = lieu.");
t("cờ trên câu hỏi thắng mặc định",
  evaluateQuestion({ ...q, strictAccents: false }, "ou").correct, true);
t("cờ trên bài tập",
  evaluateQuestion(q, "ou", { exercise: { strictAccents: false } }).correct, true);
t("cờ câu hỏi thắng cờ bài tập",
  evaluateQuestion({ ...q, strictAccents: true }, "ou", { exercise: { strictAccents: false } }).correct, false);
t("giải thích rơi về cấp bài tập",
  evaluateQuestion({ accepted: "x" }, "y", { exercise: { explications: "chung" } }).explanation, "chung");

/* --- trường hợp thật hay gặp --- */
t("élision + biến thể giống nhau",
  evaluateAnswer("L' eau", ["l'eau"]).correct, true);
t("nháy cong của điện thoại",
  evaluateAnswer("j’ai", ["j'ai"]).correct, true);
t("null không nổ", evaluateAnswer(null, ["a"]).correct, false);
t("undefined đáp án không nổ", evaluateAnswer("a", undefined).correct, false);

/* --- chỗ nối: fillOk, hàm mà Taking/PracticeHub/Student/TeacherScreens gọi ---
   Kiểm ở đây chứ không chỉ kiểm engine: nếu fillOk lỡ ngừng gọi engine thì
   engine vẫn xanh mà điểm học sinh thì sai. */
const { fillOk, fillAccepted } = await import("../src/shared/questions.js");

t("fillOk: chuỗi | cũ vẫn chấm được", fillOk({ accepted: "suis allé|suis allée" }, "suis allée"), true);
t("fillOk: mảng mới", fillOk({ correctAnswers: ["le chat"] }, "Le Chat"), true);
t("fillOk: dấu bị tính (đổi hành vi)", fillOk({ accepted: "où" }, "ou"), false);
t("fillOk: đúng dấu thì đúng", fillOk({ accepted: "où" }, "où"), true);
t("fillOk: élision", fillOk({ accepted: "l'eau" }, "l' eau"), true);
t("fillOk: cờ lỏng trên bài tập",
  fillOk({ accepted: "où" }, "ou", { strictAccents: false }), true);
t("fillOk: rỗng luôn sai", fillOk({ accepted: "où" }, ""), false);
t("fillAccepted giữ nguyên chữ ký", fillAccepted({ accepted: "a|b" }), "a|b");

/* ── Bảng OUI/NON: chấm theo TỪNG Ô ──
 *
 * Trước đây cả bảng là một đơn vị nhị phân: sai một ô là 0 điểm cho cả bảng.
 * Bài CE trong đề thi thử chỉ có đúng một bảng 4×4, nên một ô sai kéo cả phần
 * thi xuống 0/25. Đó không phải cách DELF chấm — mỗi ô là một item.
 *
 * `tableauOk` vẫn giữ nghĩa cũ ("đúng hoàn toàn") và vẫn được dùng để tô màu
 * và ghi cột boolean `answers.correct`. Việc CHẤM thì đi qua `diemCau`. */
const { diemCau, tableauDiem, tableauOk } = await import("../src/shared/questions.js");

const bang = {
  id: "t1", type: "tableau",
  criteres: [{ id: "r1" }, { id: "r2" }],
  colonnes: [{ id: "c1" }, { id: "c2" }],
  answers: { r1_c1: "OUI", r1_c2: "NON", r2_c1: "NON", r2_c2: "OUI" },
};
const dung4 = { r1_c1: "OUI", r1_c2: "NON", r2_c1: "NON", r2_c2: "OUI" };

t("bảng đúng hết → 4/4", tableauDiem(bang, dung4), { dung: 4, tong: 4 });
t("bảng sai 1 ô → 3/4 chứ không phải 0",
  tableauDiem(bang, { ...dung4, r2_c2: "NON" }), { dung: 3, tong: 4 });
t("bảng bỏ trống 2 ô → 2/4",
  tableauDiem(bang, { r1_c1: "OUI", r1_c2: "NON" }), { dung: 2, tong: 4 });
t("bảng không làm gì → 0/4", tableauDiem(bang, {}), { dung: 0, tong: 4 });
t("bảng không làm gì vẫn đáng 4 đơn vị", tableauDiem(bang, {}).tong, 4);

/* `tableauOk` KHÔNG được đổi nghĩa: nó vẫn phải là "đúng hoàn toàn", vì cột
   `answers.correct` là boolean và giao diện dùng nó để tô câu đúng. */
t("tableauOk vẫn là đúng-hoàn-toàn", tableauOk(bang, dung4), true);
t("tableauOk sai 1 ô vẫn false", tableauOk(bang, { ...dung4, r2_c2: "NON" }), false);

/* Một bảng nặng bằng số ô của nó, các loại câu khác vẫn là 1. Đây là chỗ dễ
   hỏng nhất nếu ai đó "đơn giản hoá" sau này. */
t("qcm vẫn 1 đơn vị", diemCau({ type: "qcm", answer: 2 }, 2), { dung: 1, tong: 1 });
t("qcm sai vẫn 1 đơn vị", diemCau({ type: "qcm", answer: 2 }, 0), { dung: 0, tong: 1 });
t("qcm bỏ trống không được điểm", diemCau({ type: "qcm", answer: 2 }, null), { dung: 0, tong: 1 });
t("bảng đi qua diemCau ra số ô", diemCau(bang, dung4), { dung: 4, tong: 4 });
t("câu tự luận không đóng góp đơn vị nào",
  diemCau({ type: "open" }, "bonjour"), { dung: 0, tong: 0 });

/* Bảng rỗng (giáo viên soạn dở) không được làm hỏng phép chia: tong = 0 nghĩa
   là không có gì để chấm, chứ không phải chia cho 0 ở nơi khác. */
t("bảng không có hàng/cột → 0 đơn vị",
  diemCau({ type: "tableau", criteres: [], colonnes: [], answers: {} }, {}), { dung: 0, tong: 0 });

/* ── Ô THIẾU ĐÁP ÁN trong đề ──
 *
 * Có thật trong thư viện: bài mrig1rhvcezbf2 có 16 ô, chỉ 15 ô có đáp án.
 * Trước khi lọc, ô sót gây hai lỗi ngược chiều nhau và đều lặng lẽ:
 * bỏ trống được điểm miễn phí, còn điền đủ thì `tableauOk` vĩnh viễn false. */
const bangSot = {
  id: "t2", type: "tableau",
  criteres: [{ id: "r1" }, { id: "r2" }],
  colonnes: [{ id: "c1" }, { id: "c2" }],
  answers: { r1_c1: "OUI", r1_c2: "NON", r2_c1: "NON" },   // thiếu r2_c2
};

t("ô thiếu đáp án không tính vào mẫu số", tableauDiem(bangSot, {}).tong, 3);
t("nộp trống KHÔNG được điểm miễn phí", tableauDiem(bangSot, {}).dung, 0);
t("làm đúng 3 ô có đáp án → 3/3",
  tableauDiem(bangSot, { r1_c1: "OUI", r1_c2: "NON", r2_c1: "NON" }), { dung: 3, tong: 3 });
t("điền cả ô không có đáp án vẫn đạt tối đa",
  tableauDiem(bangSot, { r1_c1: "OUI", r1_c2: "NON", r2_c1: "NON", r2_c2: "OUI" }),
  { dung: 3, tong: 3 });
t("tableauOk đúng được dù đề sót ô",
  tableauOk(bangSot, { r1_c1: "OUI", r1_c2: "NON", r2_c1: "NON", r2_c2: "OUI" }), true);
t("tableauOk vẫn false khi sai ô có đáp án",
  tableauOk(bangSot, { r1_c1: "NON", r1_c2: "NON", r2_c1: "NON" }), false);

/* Chuỗi rỗng cũng là "chưa có đáp án" — trình soạn lưu "" khi giáo viên bấm
   vào ô rồi bỏ ra. */
t("đáp án rỗng cũng không tính",
  tableauDiem({ type: "tableau", criteres: [{ id: "r" }], colonnes: [{ id: "c" }],
    answers: { r_c: "" } }, { r_c: "OUI" }).tong, 0);

console.log(`\n${pass} đạt, ${fail} hỏng`);
process.exit(fail ? 1 : 0);