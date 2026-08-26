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

{
  const { status, body } = await rpc("grille_hop_le", { g: null });
  ket(status === 200 && body === true, "hàm grille_hop_le gọi được (migration 035)",
    body?.code === "PGRST202"
      ? "chưa có hàm, HOẶC có rồi mà PostgREST chưa nạp lại lược đồ\n"
        + "      → chạy: notify pgrst, 'reload schema';"
      : `HTTP ${status} · ${JSON.stringify(body)?.slice(0, 120)}`);
}

/* Hàm đúng thì phải TỪ CHỐI thang hỏng. Gọi được mà luôn trả true thì ràng buộc
   là đồ trang trí — và đó là kiểu hỏng không ai nhìn ra từ bên ngoài. */
{
  const hong = {
    total: 6,
    criteria: [{ id: "a", key: "k", category: "pragmatique", name: "x", max_score: 2, step: 0.5 }],
  };
  const { status, body } = await rpc("grille_hop_le", { g: hong });
  if (status === 200) {
    ket(body === false, "grille_hop_le từ chối thang có tổng lệch",
      `trả về ${JSON.stringify(body)} — ràng buộc không chặn gì cả`);
  } else {
    ket(false, "grille_hop_le từ chối thang có tổng lệch", "không gọi được (xem ca trên)");
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

/* `select=*` trên questions cũng phải hỏng, vì PostgREST khai triển `*` thành
   mọi cột kể cả cột bị thu quyền. Đây là lý do exerciseStore phải liệt kê cột,
   và `check:store` canh chỗ đó trong mã nguồn. Ca này canh ở đầu database. */
{
  const { status } = await rest("questions?select=*&limit=1");
  ket(status !== 200, "select=* trên questions bị từ chối (đúng như mong đợi)",
    `HTTP ${status} — cột answer_key có thể đã được cấp lại quyền`);
}

console.log(fail
  ? `\n${pass} đạt, ${fail} hỏng — database chưa khớp với mã nguồn`
  : `\n${pass} đạt, 0 hỏng — database khớp với mã nguồn`);
process.exit(fail ? 1 : 0);
