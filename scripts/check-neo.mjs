/* Neo đáp án vào ngữ liệu (src/shared/neoNguLieu.js + migration 075).
 *
 * ══ VÌ SAO BỘ KIỂM NÀY CẦN ══
 *
 * Hai kiểu hỏng, và cả hai đều IM LẶNG:
 *
 * 1. TÔ SÁNG NHẦM ĐOẠN. Không có lỗi nào, chỉ là học sinh đọc một đoạn không
 *    liên quan và tin rằng đáp án nằm ở đó. Tệ hơn không tô gì.
 *
 * 2. LỘ ĐÁP ÁN. `evidence` là đáp án nói vòng. Một cột đọc được, hoặc một
 *    trường lọt vào `payload`, là phát đáp án cho mọi người trước khi họ làm.
 *
 * Chứng minh bộ kiểm bắt được lỗi: đổi `viTriTrich` sang so chuỗi thô (bỏ
 * `chuanHoa`), hoặc bỏ `evidence` khỏi danh sách trường bị tách trong
 * exerciseMap — phải FAIL.
 */

import { chuThuan, chuanHoa, viTriTrich, catManh, dungVung, kiemNeo }
  from "../src/shared/neoNguLieu.js";
import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

/* ── Gỡ HTML ── */
{
  t("bỏ thẻ đơn giản", chuThuan("<p>Bonjour <b>tout</b> le monde</p>").trim(),
    "Bonjour tout le monde");

  /* `</p>` phải thành xuống dòng. Thành rỗng thì chữ cuối đoạn dính chữ đầu
     đoạn sau — "mondeIl" — và tạo ra một "từ" không có thật. */
  t("hết đoạn thành xuống dòng, không dính chữ",
    chuanHoa(chuThuan("<p>le monde</p><p>Il pleut</p>")), "le monde Il pleut");
  t("<br> thành xuống dòng",
    chuanHoa(chuThuan("un<br>deux")), "un deux");
  t("giải mã thực thể", chuanHoa(chuThuan("l&#39;e&nbsp;au &amp; feu")), "l'e au & feu");
}

/* ── Chuẩn hoá để SO SÁNH ── */
{
  t("gộp mọi khoảng trắng", chuanHoa("a \n\t b   c"), "a b c");
  t("cắt hai đầu", chuanHoa("  x  "), "x");

  /* KHÔNG bỏ dấu: « ou » và « où » là hai từ khác nhau, và cả bộ chấm của dự
     án dựa trên đúng điều đó. */
  t("giữ nguyên dấu tiếng Pháp", chuanHoa("où êtes-vous"), "où êtes-vous");
}

/* ── Tìm đoạn trích ── */
{
  const v = "<p>Selon une étude, la baisse concerne surtout les jeunes.</p>"
          + "<p>Les chercheurs restent prudents.</p>";

  const r = viTriTrich(chuThuan(v), "la baisse concerne surtout les jeunes");
  t("tìm được đoạn có thật", r != null, true);
  t("cắt đúng đoạn đó",
    chuanHoa(chuThuan(v)).slice(r.dau, r.cuoi), "la baisse concerne surtout les jeunes");

  /* Đoạn trích giáo viên chép ra hay dính thêm xuống dòng hoặc hai dấu cách.
     So chuỗi thô sẽ báo "không tìm thấy" — sai theo hướng khó hiểu nhất. */
  t("chịu được khoảng trắng thừa trong đoạn trích",
    viTriTrich(chuThuan(v), "  la baisse   concerne\n surtout les jeunes ") != null, true);

  /* Đoạn trích vắt qua hai thẻ <p> vẫn phải tìm được, vì người đọc thấy chúng
     liền nhau. */
  t("vắt qua hai đoạn văn",
    viTriTrich(chuThuan(v), "les jeunes. Les chercheurs") != null, true);

  /* KHÔNG tìm thấy là một câu trả lời hợp lệ. Đoán chỗ gần đúng rồi tô sáng
     nhầm còn tệ hơn không tô gì — học sinh tin vào nó. */
  t("không có thì trả về null", viTriTrich(chuThuan(v), "une phrase absente"), null);
  t("văn bản rỗng không nổ", viTriTrich("", "gì đó"), null);
  t("đoạn trích rỗng không nổ", viTriTrich("có chữ", ""), null);

  /* Xuất hiện nhiều lần: mặc định lần đầu, `lan` chọn lần khác. */
  const v2 = "le chat dort. le chat mange.";
  t("mặc định lấy lần đầu", viTriTrich(v2, "le chat").dau, 0);
  t("lan 2 lấy lần sau", viTriTrich(v2, "le chat", 2).dau, 14);
  t("lan 3 không có thì null", viTriTrich(v2, "le chat", 3), null);
}

/* ── Cắt mảnh để dựng ── */
{
  const v = "abcdefghij";
  t("một vùng ở giữa",
    catManh(v, [{ dau: 3, cuoi: 6, loai: "dung" }]).map((m) => m.chu + ":" + m.loai),
    ["abc:thuong", "def:dung", "ghij:thuong"]);

  t("vùng ở ngay đầu",
    catManh(v, [{ dau: 0, cuoi: 2, loai: "bay" }]).map((m) => m.loai),
    ["bay", "thuong"]);

  t("không có vùng nào thì một mảnh thường",
    catManh(v, []).map((m) => m.loai), ["thuong"]);

  /* Vùng CHỒNG NHAU: `dung` phải thắng. Không có luật này thì thứ tự sắp xếp
     quyết định màu, và cùng một dữ liệu cho ra hai màn hình khác nhau. */
  const chong = catManh(v, [
    { dau: 2, cuoi: 6, loai: "bay" },
    { dau: 2, cuoi: 5, loai: "dung" },
  ]);
  t("vùng chồng nhau: đáp án đúng thắng", chong.find((m) => m.chu === "cde")?.loai, "dung");
  t("chồng nhau không sinh mảnh trùng",
    chong.map((m) => m.chu).join(""), v);

  /* Dữ liệu rác không được làm đổ phép dựng — neo do người gõ tay. */
  t("bỏ vùng vô lý", catManh(v, [{ dau: 5, cuoi: 2 }, null, { dau: NaN, cuoi: 3 }]).length, 1);
}

/* ── Chỉ tô bẫy mà CHÍNH HỌ đã sa vào ── */
{
  const v = "La hausse date de 2019. En 2023 la baisse est nette.";
  const e = {
    trich: "En 2023 la baisse est nette",
    pieges: [
      { option: 1, trich: "La hausse date de 2019", vi_sao: "Đúng số liệu, sai năm." },
      { option: 3, trich: "La hausse", vi_sao: "khác" },
    ],
  };

  t("không chọn gì thì chỉ tô đáp án đúng",
    dungVung(v, e).map((x) => x.loai), ["dung"]);
  t("chọn bẫy 1 thì tô thêm đúng bẫy đó",
    dungVung(v, e, 1).map((x) => x.loai), ["dung", "bay"]);
  t("chọn bẫy 1 KHÔNG tô bẫy 3", dungVung(v, e, 1).length, 2);
  t("mang theo lời giải thích của bẫy",
    dungVung(v, e, 1).find((x) => x.loai === "bay").viSao, "Đúng số liệu, sai năm.");
  t("evidence rỗng không nổ", dungVung(v, null), []);
}

/* ── Nói thật khi neo hỏng ── */
{
  const v = "Il fait beau aujourd'hui.";
  t("thiếu trích dẫn", kiemNeo(v, {}).ly_do, "thieu_trich");
  t("trích dẫn không còn trong bài",
    kiemNeo(v, { trich: "une phrase supprimée" }).ly_do, "khong_tim_thay");
  t("neo tốt thì ok", kiemNeo(v, { trich: "Il fait beau" }).ok, true);
  t("đếm được số bẫy hỏng",
    kiemNeo(v, { trich: "Il fait beau", pieges: [{ trich: "absent" }] }).bayHong, 1);
}

/* ══ `evidence` KHÔNG ĐƯỢC LỌT RA NGOÀI ══
 *
 * Hai đường rò, cả hai đều im lặng:
 *
 * 1. `toRows` trong exerciseMap QUÉT MỌI TRƯỜNG LẠ vào `payload`, mà `payload`
 *    thì `anon` đọc được. Không tách `evidence` ra đích danh thì mỗi lần giáo
 *    viên bấm Lưu là đáp án được bày ra chỗ ai cũng đọc — đúng cơ chế đã làm
 *    lộ trọn bộ đáp án câu `tableau` trước migration 022.
 *
 * 2. Cột `evidence` cấp SELECT cho anon/authenticated. */
{
  const map = readFileSync(new URL("../src/shared/exerciseMap.js", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split(/\r?\n/).map((d) => d.replace(/^\s*\/\/.*$/, "")).join("\n");
  const sql = readFileSync(new URL("../supabase/migrations/075_neo_ngu_lieu.sql", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split(/\r?\n/).map((d) => d.replace(/--.*$/, "")).join("\n");

  /* Hai vế, và phải có ĐỦ CẢ HAI: lấy ra khỏi payload, rồi ghi vào cột riêng.
     Thiếu vế đầu thì neo nằm trong payload (anon đọc được); thiếu vế sau thì
     neo bị xoá mất mỗi lần giáo viên bấm Lưu. */
  t("evidence bị gỡ khỏi payload", /delete payload\.evidence;/.test(map), true);
  t("evidence được ghi vào cột riêng", /^\s*evidence,\s*$/m.test(map), true);

  t("thu quyền đọc evidence đích danh",
    /revoke select \(evidence\) on public\.questions from anon, authenticated;/.test(sql), true);

  /* Hàm đọc phải lọc theo NGƯỜI ĐÃ TRẢ LỜI, ngay trong câu — security definer
     chạy vòng qua RLS. */
  t("chỉ trả neo cho câu người đó đã làm", /t\.user_id = ai/.test(sql), true);
  t("đường ghi kiểm vai giáo viên", /if not public\.is_teacher\(\)/.test(sql), true);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
