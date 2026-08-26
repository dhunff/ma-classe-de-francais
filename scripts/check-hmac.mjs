/* Logic chữ ký HMAC — kiểm bằng mật mã thật, không phải đọc mã rồi tin.
 *
 * Xác minh chữ ký là loại mã mà "trông đúng" và "đúng" cách nhau rất xa: một
 * phép so sánh lỏng, một lần ký nhầm chuỗi, một tiền tố quên bóc — đều cho ra
 * hàm CHẤP NHẬN chữ ký giả, và không có triệu chứng nào cho tới khi bị lợi
 * dụng. Nên mọi nhánh ở đây đều thử cả chiều đúng lẫn chiều sai.
 */
import { signHex, signBase64, verifySignature, safeEqual, findSignature, SIGNATURE_HEADERS }
  from "../supabase/functions/_shared/hmac.js";

let pass = 0, fail = 0;
const t = async (ten, got, want) => {
  const g = await got;
  const ok = JSON.stringify(g) === JSON.stringify(want);
  if (ok) pass++; else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(g)}\n        want ${JSON.stringify(want)}`); }
};

const SECRET = "bi-mat-chung-giua-sepay-va-ta";
const BODY = JSON.stringify({ content: "LMS HUNG A43YTS", transferAmount: 100000, transferType: "in" });

/* ── chiều đúng ── */
await t("chữ ký hex hợp lệ được chấp nhận",
  verifySignature(SECRET, BODY, await signHex(SECRET, BODY)), true);
await t("chữ ký base64 hợp lệ được chấp nhận",
  verifySignature(SECRET, BODY, await signBase64(SECRET, BODY)), true);
await t("tiền tố sha256= được bóc",
  verifySignature(SECRET, BODY, "sha256=" + await signHex(SECRET, BODY)), true);
await t("hex viết HOA vẫn khớp",
  verifySignature(SECRET, BODY, (await signHex(SECRET, BODY)).toUpperCase()), true);
await t("khoảng trắng thừa không phá",
  verifySignature(SECRET, BODY, "  " + await signHex(SECRET, BODY) + "  "), true);

/* ── chiều sai: đây mới là phần quan trọng ── */
await t("SỬA nội dung → chữ ký hỏng",
  verifySignature(SECRET, BODY.replace("100000", "1"), await signHex(SECRET, BODY)), false);
await t("bí mật khác → từ chối",
  verifySignature("bi-mat-khac", BODY, await signHex(SECRET, BODY)), false);
await t("chữ ký rỗng → từ chối", verifySignature(SECRET, BODY, ""), false);
await t("chữ ký null → từ chối", verifySignature(SECRET, BODY, null), false);
await t("KHÔNG có bí mật → từ chối", verifySignature("", BODY, await signHex(SECRET, BODY)), false);
await t("chữ ký của body khác → từ chối",
  verifySignature(SECRET, BODY, await signHex(SECRET, "{}")), false);
await t("đúng độ dài nhưng sai một ký tự → từ chối", (async () => {
  const s = await signHex(SECRET, BODY);
  const doi = (s[0] === "a" ? "b" : "a") + s.slice(1);
  return verifySignature(SECRET, BODY, doi);
})(), false);

/* Thứ tự khoá đổi → body thô đổi → chữ ký phải hỏng. Đây là lý do PHẢI ký
   trên body thô chứ không parse rồi serialize lại. */
await t("cùng dữ liệu nhưng thứ tự khoá khác → chữ ký khác",
  verifySignature(SECRET, JSON.stringify({ transferAmount: 100000, content: "LMS HUNG A43YTS", transferType: "in" }),
    await signHex(SECRET, BODY)), false);

/* ── so sánh không rò rỉ thời gian ── */
await t("safeEqual: khác độ dài", safeEqual("abc", "abcd"), false);
await t("safeEqual: giống hệt", safeEqual("abc", "abc"), true);
await t("safeEqual: không phải chuỗi", safeEqual(null, "abc"), false);

/* ── tìm header ── */
const H = (o) => ({ get: (k) => o[k.toLowerCase()] ?? null });
await t("tìm thấy x-signature", findSignature(H({ "x-signature": "abc" }))?.value, "abc");
await t("tìm thấy x-sepay-signature", findSignature(H({ "x-sepay-signature": "z" }))?.header, "x-sepay-signature");
await t("không có header nào → null", findSignature(H({ "content-type": "application/json" })), null);
await t("danh sách header không rỗng", SIGNATURE_HEADERS.length > 0, true);

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
