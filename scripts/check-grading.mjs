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

console.log(`\n${pass} đạt, ${fail} hỏng`);
process.exit(fail ? 1 : 0);