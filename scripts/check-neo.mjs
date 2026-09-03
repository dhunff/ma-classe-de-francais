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

/* ══ NỐI VÀO MÀN CHỮA BÀI ══
 *
 * Câu `qcm` TRƯỚC ĐÂY KHÔNG ĐƯỢC DỰNG trong khối "copie corrigée", và cũng
 * không nằm trong điều kiện mở khối đó — nên một bài đọc hiểu toàn trắc
 * nghiệm mở ra là danh sách rỗng, đúng loại bài mà việc chữa quan trọng nhất
 * và cũng là chỗ neo có ích nhất. */
{
  const boChuThich = (src) => src.replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .split(/\r?\n/).map((x) => x.replace(/^\s*\/\/.*$/, "")).join("\n");
  const st = boChuThich(readFileSync(new URL("../src/screens/student/Student.jsx", import.meta.url), "utf8"));
  const nc = boChuThich(readFileSync(new URL("../src/screens/student/NeoCauHoi.jsx", import.meta.url), "utf8"));
  const store = boChuThich(readFileSync(new URL("../src/shared/neoStore.js", import.meta.url), "utf8"));

  t("khối chữa bài nhận câu qcm", /q\.type === "qcm"/.test(st), true);
  t("có dựng nhánh qcm", /Mon choix/.test(st), true);
  t("neo được nối vào màn chữa bài", /<NeoCauHoi/.test(st), true);

  /* KHÔNG được hiện đáp án đúng của qcm: `answer_key` không cấp SELECT cho học
     sinh, nên phía này không có con số đó — dựng nó ra là bịa.

     Chỉ soi TRONG nhánh qcm. Bản đầu soi cả file và đỏ, nhưng mã đúng còn ca
     kiểm sai: nó bắt trúng nhánh `vf`, nơi câu "Bonne réponse" đã có từ lâu. */
  const iQcm = st.indexOf('if (q.type === "qcm")');
  const nhanhQcm = iQcm >= 0 ? st.slice(iQcm, st.indexOf('if (q.type === "tableau")', iQcm)) : "";
  t("đọc được nhánh qcm", nhanhQcm.length > 100, true);
  t("nhánh qcm không bịa đáp án đúng", /Bonne réponse|q\.answer/.test(nhanhQcm), false);

  /* Nạp phải nằm ở component CẤP MODULE. `Card` được định nghĩa bên trong
     `Student`, nên nó là component mới sau mỗi lần cha dựng lại và mọi state
     trong đó bị đặt lại — một useEffect đặt ở đó sẽ gọi mạng lại liên tục. */
  t("nạp neo ở component riêng, không trong Card", /useEffect/.test(nc), true);
  t("Student.jsx không tự gọi docNeo", /docNeo\(/.test(st), false);

  /* Bỏ lượt trả về khi component đã gỡ. */
  t("huỷ lượt nạp khi gỡ", /if \(con\) setNeo|if \(!con\) return/.test(nc), true);

  /* Không có ngữ liệu thì không hỏi máy chủ — phép lọc rẻ nhất, cắt phần lớn
     lời gọi vì bài ngữ pháp không có reading_text. */
  t("không có ngữ liệu thì không gọi mạng", /!String\(vanBan \?\? ""\)\.trim\(\)/.test(nc), true);

  /* Nhớ theo BÀI: mười câu cùng bài dựng trong một khung hình phải chỉ tốn một
     lời gọi. Và phải nhớ PROMISE, không phải kết quả — lời gọi thứ hai xuất
     phát trước khi lời gọi thứ nhất trả về. */
  t("nhớ lời gọi theo bài", /daHoi\.set\(exerciseId, chay\)/.test(store), true);
  t("hỏng thì quên đi để còn hỏi lại", /daHoi\.delete\(exerciseId\)/.test(store), true);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
