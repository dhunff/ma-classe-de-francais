/* Logic chữ ký HMAC — kiểm bằng mật mã thật, không phải đọc mã rồi tin.
 *
 * Xác minh chữ ký là loại mã mà "trông đúng" và "đúng" cách nhau rất xa: một
 * phép so sánh lỏng, một lần ký nhầm chuỗi, một tiền tố quên bóc — đều cho ra
 * hàm CHẤP NHẬN chữ ký giả, và không có triệu chứng nào cho tới khi bị lợi
 * dụng. Nên mọi nhánh ở đây đều thử cả chiều đúng lẫn chiều sai.
 */
import { readFileSync } from "node:fs";

import { signHex, signBase64, verifySignature, safeEqual, findSignature, SIGNATURE_HEADERS,
  candidateBodies, verifyAny, findTimestamp, timestampConLai, CUA_SO_GIAY }
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

/* ── ký trên chuỗi nào ── */
/* SePay gửi kèm x-sepay-timestamp. Ký body trần thì bị từ chối dù bí mật đúng:
   401 với chữ ký hợp lệ, chỉ vì ký nhầm chuỗi. */
const TS = "1756193718";
const cands = candidateBodies(BODY, TS);
await t("có timestamp → thử 4 cách", cands.length, 4);
await t("không timestamp → chỉ body trần", candidateBodies(BODY, null).map(c=>c.label), ["raw"]);

await t("khớp kiểu ts.raw",
  verifyAny(SECRET, cands, await signHex(SECRET, TS + "." + BODY)), "ts.raw");
await t("khớp kiểu ts+raw",
  verifyAny(SECRET, cands, await signHex(SECRET, TS + BODY)), "ts+raw");
await t("khớp kiểu raw+ts",
  verifyAny(SECRET, cands, await signHex(SECRET, BODY + TS)), "raw+ts");
await t("khớp body trần", verifyAny(SECRET, cands, await signHex(SECRET, BODY)), "raw");

/* Thử nhiều cách KHÔNG được nới lỏng: không biết bí mật thì không cách nào khớp. */
await t("bí mật sai → không cách nào khớp",
  verifyAny(SECRET, cands, await signHex("khac", TS + "." + BODY)), null);
await t("timestamp khác → không khớp",
  verifyAny(SECRET, cands, await signHex(SECRET, "999." + BODY)), null);

/* ── tuổi timestamp ── */
const NOW = 1756200000000;   // mốc cố định, để bộ kiểm không phụ thuộc đồng hồ
const giay = (t) => timestampConLai(String(t), NOW);

await t("vừa gửi xong → nhận", giay(NOW/1000).ok, true);
await t("1 giờ trước → nhận", giay(NOW/1000 - 3600).ok, true);
await t("23 giờ trước → nhận", giay(NOW/1000 - 23*3600).ok, true);
await t("25 giờ trước → TỪ CHỐI", giay(NOW/1000 - 25*3600).ok, false);
await t("tuần sau (đồng hồ lệch xa) → TỪ CHỐI", giay(NOW/1000 + 7*86400).ok, false);

/* Đơn vị: không biết SePay dùng giây hay mili-giây. Đoán sai một chiều thì mọi
   request đều quá cũ; đoán sai chiều kia thì kiểm tra thành vô dụng. */
await t("nhận mili-giây", giay(NOW).ok, true);
await t("nhận giây", giay(NOW/1000).ok, true);
await t("mili-giây quá cũ vẫn bị chặn", giay(NOW - 26*3600*1000).ok, false);

/* Không có timestamp thì KHÔNG chặn — nhà cung cấp khác có thể không gửi. */
await t("không timestamp → cho qua", timestampConLai(null, NOW).ok, true);
await t("timestamp rác → cho qua, không nổ", giay("abc").ok, true);
await t("cửa sổ là 24 giờ", CUA_SO_GIAY, 86400);

/* ══ WEBHOOK CHỈ CHẤP NHẬN MỘT CÔNG THỨC ══
 *
 * `candidateBodies` cố ý thử bốn cách — nó là công cụ dò. Nhưng webhook thì
 * phải GHIM đúng `ts.raw`, con số đo được từ giao dịch #76732769.
 *
 * Đây là kiểm trên MÃ NGUỒN, không phải trên hành vi, vì thứ dễ trôi lại chính
 * là một dòng trông vô hại: đổi `dinhDang = await verifyAny(...)` thành
 * `authed = await verifyAny(...)` là quay về nhận cả bốn cách, và mọi bộ kiểm
 * hành vi vẫn xanh vì chữ ký thật vẫn khớp. */
const src = readFileSync(
  new URL("../supabase/functions/sepay-webhook/index.ts", import.meta.url), "utf8");

await t("webhook ghim công thức ts.raw", /CONG_THUC\s*=\s*"ts\.raw"/.test(src), true);
/* Bắt MỌI dòng gán vào `authed` có nhắc tới `verifyAny`, không chỉ dạng gán
   trực tiếp. Bản đầu của ca này viết `/authed\s*=\s*(await\s*)?verifyAny/` và
   `authed = !!(await verifyAny(...))` đi lọt — đúng kiểu biến thể mà người sửa
   vội hay viết ra. Một bộ kiểm chỉ bắt được đúng cách viết mình nghĩ tới thì
   không bảo vệ được gì. */
await t("verifyAny chỉ dùng để chẩn đoán, không cấp quyền",
  src.split("\n").some((d) => /\bauthed\s*=[^=]/.test(d) && d.includes("verifyAny")),
  false);
await t("verifySignature chạy trên đúng ứng viên đã ghim",
  /label === CONG_THUC/.test(src), true);
await t("401 nói ra công thức đang ghim", /format_pinned/.test(src), true);
await t("401 nói ra công thức lẽ ra khớp", /format_would_match/.test(src), true);

/* Nhánh API Key đã gỡ. Giữ lại nghĩa là độ an toàn do đường yếu nhất quyết định. */
await t("không còn nhánh SEPAY_TOKEN", /SEPAY_TOKEN"\)/.test(src), false);

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
