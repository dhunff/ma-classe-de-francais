/* Đối chiếu database THẬT với những gì mã nguồn đang giả định.
 *
 * ══ VÌ SAO CẦN ══
 *
 * Migration ở dự án này chạy tay qua SQL Editor. Nghĩa là luôn có khả năng lệch
 * giữa "mã đã deploy" và "database đã có gì" — và cách duy nhất phát hiện, cho
 * tới nay, là chờ một người dùng thật gặp lỗi.
 *
 * Đã xảy ra hai lần đắt giá:
 *   · Migration 001 chạy nhầm sang project khác. Webhook deploy trót lọt và chỉ
 *     vỡ khi có người trả tiền thật (xem supabase/RUNBOOK.md).
 *   · Bản đầu của 035 gộp DDL với khối tự kiểm vào một transaction. Khối kiểm
 *     `raise exception` → cuộn ngược luôn `alter table`. Người vận hành báo đã
 *     chạy, ứng dụng báo chưa có cột, và cả hai đều đúng.
 *
 * ══ CHẠY BẰNG KHOÁ ANON ══
 *
 * Không cần bí mật nào. Nghĩa là bộ kiểm này còn trả lời được một câu quan
 * trọng hơn: người lạ nhìn thấy gì? Ca `answer_key` bên dưới chính là chỗ đó —
 * nó phải THẤT BẠI khi đọc, và thất bại là kết quả ĐÚNG.
 *
 *   npm run check:db
 */

import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter(Boolean)
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_BASE = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;

if (!URL_BASE || !ANON) {
  console.log("✗ .env thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const ref = URL_BASE.replace(/^https:\/\//, "").replace(/\.supabase\.co.*$/, "");
console.log(`project-ref: ${ref}\n`);

let pass = 0, fail = 0;
const ket = (ok, ten, ghi = "") => {
  if (ok) { pass++; console.log(`  ✓ ${ten}`); }
  else { fail++; console.log(`  ✗ ${ten}${ghi ? "\n      " + ghi : ""}`); }
};

const rest = async (duong) => {
  const r = await fetch(`${URL_BASE}/rest/v1/${duong}`, { headers: { apikey: ANON } });
  let body = null;
  try { body = await r.json(); } catch { /* không phải JSON */ }
  return { status: r.status, body };
};

/* ── 1. Bảng đọc được ──
   Không kiểm nội dung, chỉ kiểm "gọi được và không lỗi". RLS quyết định thấy
   bao nhiêu dòng, và số 0 dòng là hợp lệ với khoá anon. */
for (const bang of ["exercises", "questions", "exams", "exam_sections", "profiles", "tips"]) {
  const { status, body } = await rest(`${bang}?select=id&limit=1`);
  ket(status === 200, `bảng ${bang} đọc được`, `HTTP ${status} · ${body?.message ?? ""}`);
}

/* ── 2. Cột mà mã nguồn đang giả định ──
   Cột thiếu → PostgREST trả 42703 và HUỶ CẢ CÂU, chứ không trả về ít cột hơn.
   Nghĩa là một cột thiếu làm hỏng nguyên màn hình, không phải hỏng một ô. */
const COT_CAN = [
  ["exercises", "id,title,meta,store", "kho đề"],
  ["questions", "id,exercise_id,ord,type,prompt,payload,explanation,competence,point_gram", "câu hỏi"],
  ["exams", "id,title,level,duration_min,is_published", "đề thi thử"],
  ["exams", "grille", "thang chấm PE (migration 035)"],
  ["exam_sections", "exam_id,code,exercise_id,minutes,points,ord", "phần thi"],
];
for (const [bang, cot, nhan] of COT_CAN) {
  const { status, body } = await rest(`${bang}?select=${cot}&limit=1`);
  ket(status === 200, `${bang}: ${nhan}`,
    body?.code === "42703"
      ? `THIẾU CỘT — ${body.message}`
      : `HTTP ${status} · ${body?.message ?? ""}`);
}

/* ── 3. Hàm gọi được qua RPC ──
   PGRST202 nghĩa là hàm không có TRONG BỘ NHỚ ĐỆM lược đồ của PostgREST — có
   thể vì hàm chưa tồn tại, cũng có thể vì tồn tại rồi mà chưa nạp lại. Hai thứ
   khác nhau, nên thông báo phải nói ra cả hai. */
const rpc = async (ten, thamSo) => {
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${ten}`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify(thamSo),
  });
  let body = null;
  try { body = await r.json(); } catch { /* không phải JSON */ }
  return { status: r.status, body };
};

/* ── 3b. Hành vi của grille_hop_le, chạy trên DATABASE THẬT ──
 *
 * Cùng bộ ca với khối tự đối chiếu trong migration 036 và với `check:bareme`.
 * Ba nơi, ba mục đích:
 *
 *   036          chạy một lần lúc migration, kiểm được cả quyền cấp cột
 *   check:bareme kiểm bản JS (`grilleLuuDuoc`), chạy offline
 *   ở đây        kiểm bản SQL đang CHẠY THẬT, chạy bất cứ lúc nào
 *
 * Cái thứ ba là cái duy nhất phát hiện được việc ai đó `create or replace` đè
 * lên hàm bằng một bản lỏng hơn. Hàm gọi được mà luôn trả `true` thì ràng buộc
 * là đồ trang trí — và không ai nhìn ra điều đó từ bên ngoài.
 *
 * Gọi hàm thuần nên KHÔNG ghi gì. Chạy trên production cũng an toàn. */
const HOP_LE = {
  schema_version: 1, level: "B2", official: true, total: 5,
  criteria: [
    { id: "a", key: "consigne", category: "pragmatique", name: "Bám sát đề", max_score: 2, step: 0.5 },
    { id: "b", key: "argumenter", category: "pragmatique", name: "Lập luận", max_score: 3, step: 0.5 },
  ],
};
const doi = (duong, gia) => {
  const g = structuredClone(HOP_LE);
  const k = duong.split(".");
  let o = g;
  for (const x of k.slice(0, -1)) o = o[x];
  o[k[k.length - 1]] = gia;
  return g;
};

const CA_GRILLE = [
  ["thang hợp lệ được NHẬN", HOP_LE, true],
  ["null được NHẬN (dùng thang chuẩn)", null, true],
  ["tổng lệch bị TỪ CHỐI", doi("total", 6), false],
  ["nhóm lạ bị TỪ CHỐI", doi("criteria.0.category", "linh tinh"), false],
  ["tên rỗng bị TỪ CHỐI", doi("criteria.0.name", ""), false],
  ["thiếu key bị TỪ CHỐI", doi("criteria.0.key", ""), false],
  ["thiếu id bị TỪ CHỐI", doi("criteria.0.id", ""), false],
  ["max_score = 0 bị TỪ CHỐI", doi("criteria.0.max_score", 0), false],
  ["step không chia hết max bị TỪ CHỐI", doi("criteria.0.step", 0.3), false],
  /* step = 0 là ca mà thứ tự đánh giá của OR quyết định: `max % step` là chia
     cho 0, và SQL không hứa hẹn short-circuit. Phải TỪ CHỐI, không được NỔ. */
  ["step = 0 bị TỪ CHỐI, không nổ vì chia 0", doi("criteria.0.step", 0), false],
  ["id trùng bị TỪ CHỐI", doi("criteria.1.id", "a"), false],
  ["mảng tiêu chí rỗng bị TỪ CHỐI", { total: 0, criteria: [] }, false],
  ["không phải object bị TỪ CHỐI", "khong phai object", false],
  ["criteria không phải mảng bị TỪ CHỐI", { total: 0, criteria: "x" }, false],
];

{
  const dau = await rpc("grille_hop_le", { g: null });
  if (dau.status !== 200) {
    ket(false, "hàm grille_hop_le gọi được (migration 035)",
      dau.body?.code === "PGRST202"
        ? "chưa có hàm, HOẶC có rồi mà PostgREST chưa nạp lại lược đồ\n"
          + "      → chạy: notify pgrst, 'reload schema';"
        : `HTTP ${dau.status} · ${JSON.stringify(dau.body)?.slice(0, 120)}`);
    ket(false, "hành vi grille_hop_le (14 ca)", "bỏ qua — chưa gọi được hàm");
  } else {
    ket(true, "hàm grille_hop_le gọi được (migration 035)");
    let hongCa = 0;
    for (const [ten, g, mong] of CA_GRILLE) {
      const { status, body } = await rpc("grille_hop_le", { g });
      if (!(status === 200 && body === mong)) {
        hongCa++;
        console.log(`      ✗ ${ten} → trả về ${JSON.stringify(body)?.slice(0, 60)}, mong ${mong}`);
      }
    }
    ket(hongCa === 0, `hành vi grille_hop_le (${CA_GRILLE.length} ca)`,
      `${hongCa} ca sai — ràng buộc không chặn đúng thứ nó phải chặn`);
  }
}

/* ── 3c. Cửa đọc đáp án của giáo viên phải đóng với khoá anon ──
 *
 * `get_answer_keys` (migration 040) tồn tại để giáo viên sửa bài mà không xoá
 * mất đáp án. Nó là cửa THỨ HAI tới cùng một dữ liệu mà migration 022 đã khoá,
 * nên nó phải khoá chặt bằng đúng chừng ấy.
 *
 * Hai tầng, kiểm cả hai: quyền EXECUTE thu khỏi `anon`, VÀ thân hàm đòi
 * `is_teacher()`. Chỉ kiểm một tầng thì tầng kia hỏng lúc nào không biết. */
{
  const { status, body } = await rpc("get_answer_keys", { p_exercise_ids: ["bat-ky"] });

  /* Bộ kiểm này KHÔNG khẳng định được hàm có tồn tại hay không, và đó là hệ quả
     tất yếu của thiết kế chứ không phải thiếu sót:

       hàm chưa tạo            → PGRST202
       hàm có, anon bị thu quyền → PGRST202 (PostgREST lọc theo quyền của vai)

     Hai trạng thái ấy giống hệt nhau từ phía ngoài. Bản đầu của ca này đòi
     "hàm phải tồn tại", tức là đòi khoá anon nhìn thấy một hàm mà ta vừa cố ý
     giấu — nó không thể xanh, dù mọi thứ đều đúng.

     Việc khẳng định hàm tồn tại + đúng SECURITY DEFINER + đúng quyền do khối tự
     đối chiếu của chính migration 040 làm, nơi đọc được pg_proc.

     Ở đây chỉ kiểm điều DUY NHẤT anon quan sát được, và cũng là điều quan
     trọng nhất: người lạ không lấy được đáp án. */
  const anToan = status !== 200
    || (Array.isArray(body) && body.length === 0);
  ket(anToan, "anon KHÔNG lấy được đáp án qua get_answer_keys",
    `HTTP ${status} · trả về ${JSON.stringify(body)?.slice(0, 100)}`);

  if (status === 200 && Array.isArray(body) && body.length === 0) {
    console.log("      ⓘ gọi được nhưng trả 0 dòng: is_teacher() chặn, còn quyền"
      + " EXECUTE thì chưa thu khỏi anon — xem 040.");
  }
}

/* ── 4. Thứ KHÔNG được lộ ──
 *
 * Đây là phần quan trọng nhất của cả file. `answer_key` giữ đáp án và bài mẫu;
 * migration 022 thu quyền SELECT của anon/authenticated trên đúng cột đó.
 *
 * Nếu ca này chuyển sang ✓ thì nghĩa là ai cũng curl được cả ngân hàng đáp án.
 * Nó đã từng như vậy một lần. */
{
  const { status, body } = await rest("questions?select=answer_key&limit=1");
  ket(status !== 200, "answer_key KHÔNG đọc được bằng khoá anon",
    `HTTP ${status} — đáp án đang lộ! Xem migration 022.\n      ${JSON.stringify(body)?.slice(0, 160)}`);
}

/* Bài làm và lượt thi là dữ liệu RIÊNG của từng học sinh. RLS lọc theo
   `auth.uid()`, nên khoá anon phải nhận về MẢNG RỖNG — không phải lỗi, mà là
   không có dòng nào thuộc về "không ai".

   Ca này khác hai ca trên: `answer_key` bị chặn ở mức CỘT (401), còn đây bị
   chặn ở mức DÒNG (200 + rỗng). Nhầm hai cơ chế là chỗ dễ tưởng đã an toàn —
   một bảng trả 200 trông như đọc được, và chỉ số dòng mới nói lên sự thật. */
for (const bang of ["attempts", "answers", "submissions"]) {
  const { status, body } = await rest(`${bang}?select=id&limit=1`);
  ket(status === 200 && Array.isArray(body) && body.length === 0,
    `${bang}: khoá anon KHÔNG thấy dòng nào`,
    status !== 200
      ? `HTTP ${status} · ${body?.message ?? ""}`
      : `thấy ${body?.length} dòng — RLS đang để lộ bài làm của học sinh`);
}

/* Không kiểm đáp án của bảng OUI/NON ở đây được.
 *
 * Từ migration 022, đáp án nằm ở `questions.answer_key` — cột KHÔNG cấp SELECT
 * cho anon, đúng như phải thế. Bản đầu của ca này đọc `payload.answers` và báo
 * "thiếu 16/16 ô" cho một bảng hoàn toàn lành lặn: đáp án của nó đã chuyển sang
 * answer_key từ lâu.
 *
 * Một bộ kiểm không nhìn thấy dữ liệu mà vẫn phán xét thì chỉ sinh ra báo động
 * giả. Phép kiểm ấy chuyển sang 038_tableau_answers_check.sql, chạy trong
 * database nơi đọc được cả hai cột. */

/* `select=*` trên questions cũng phải hỏng, vì PostgREST khai triển `*` thành
   mọi cột kể cả cột bị thu quyền. Đây là lý do exerciseStore phải liệt kê cột,
   và `check:store` canh chỗ đó trong mã nguồn. Ca này canh ở đầu database. */
{
  const { status } = await rest("questions?select=*&limit=1");
  ket(status !== 200, "select=* trên questions bị từ chối (đúng như mong đợi)",
    `HTTP ${status} — cột answer_key có thể đã được cấp lại quyền`);
}

/* ── Migration 046: ba cột danh tính ──
 *
 * PostgREST trả 42703 và HUỶ CẢ CÂU khi gặp cột lạ, nên câu này phân biệt được
 * ba chuyện mà từ phía ứng dụng trông giống hệt nhau:
 *
 *   200 + []      cột có, RLS không cho khoá anon thấy dòng nào — ĐÚNG
 *   42703         cột chưa có, tức 046 chưa vào database NÀY
 *   401/403       cột có nhưng bị thu quyền ở mức cột
 *
 * Ca này tồn tại vì "đã chạy migration rồi" đã bốn lần không đồng nghĩa với
 * "dữ liệu đã đổi" trong dự án này — hai lần vì SQL Editor nối tới database
 * khác, một lần vì khối tự kiểm cuối file cuộn ngược cả DDL ở đầu file. Xem
 * CLAUDE.md. Một câu đo từ ngoài chấm dứt mọi tranh luận trong ba giây. */
{
  const { status, body } = await rest("profiles?select=id,display_name,username,avatar&limit=1");
  ket(status === 200 && Array.isArray(body),
    "046: ba cột danh tính có mặt (display_name, username, avatar)",
    body?.code === "42703"
      ? "cột chưa tồn tại — 046 CHƯA vào database này. "
        + "Kiểm bằng: select count(*) from public.questions where point_gram is not null; "
        + "ra 232 nghĩa là đang đứng đúng database, và khi đó 046 đã bị cuộn ngược "
        + "hoặc chỉ chạy một phần."
      : `HTTP ${status} · ${body?.message ?? ""}`);
}

/* ── Hai hàm RPC phải VÔ HÌNH với khoá anon ──
 *
 * Cả hai là `security definer`. Nếu anon gọi được `update_my_identity` thì bất
 * kỳ ai trên internet cũng ghi được vào hồ sơ người khác; nếu gọi được
 * `username_available` thì cả internet dò được danh sách username.
 *
 * CẢNH BÁO khi đọc kết quả: một hàm đã khoá quyền và một hàm KHÔNG TỒN TẠI trả
 * về cùng một thứ — 404 PGRST202. Ca này chỉ chứng minh "anon không gọi được",
 * KHÔNG chứng minh hàm đã được tạo. Việc đó do ca cột ở trên và khối tự kiểm
 * cuối file 046 lo. Ghi rõ ở đây vì đúng chỗ này dễ tưởng đã xanh là đã xong. */
for (const ham of ["username_available", "update_my_identity"]) {
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${ham}`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ p_username: "kiem_tra_tu_dong" }),
  });
  ket(r.status === 404 || r.status === 401 || r.status === 403,
    `046: khoá anon KHÔNG gọi được ${ham}()`,
    `HTTP ${r.status} — hàm đang mở cho anon, thu quyền lại ngay`);
}

console.log(fail
  ? `\n${pass} đạt, ${fail} hỏng — database chưa khớp với mã nguồn`
  : `\n${pass} đạt, 0 hỏng — database khớp với mã nguồn`);
process.exit(fail ? 1 : 0);
