/* Webhook SePay → cấp quyền tự động.
 *
 * Chạy phía máy chủ, giữ service_role, nên là nơi DUY NHẤT ghi được vào
 * exercise_access. Trình duyệt bị RLS chặn hoàn toàn (xem migration 001).
 *
 * Biến môi trường cần đặt (supabase secrets set ...):
 *   SEPAY_TOKEN              chuỗi bí mật, phải khớp header SePay gửi lên
 *   SUPABASE_URL             có sẵn trong môi trường Edge Function
 *   SUPABASE_SERVICE_ROLE_KEY có sẵn trong môi trường Edge Function
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* Ngân hàng thường viết hoa và bỏ dấu nội dung chuyển khoản, nên phải chuẩn
   hoá cả hai phía trước khi so. "Đỗ Hùng" có thể về thành "DO HUNG". */
const normalize = (s: string) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .replace(/\s+/g, "")
    .toUpperCase();

/* Memo do client sinh: `LMS <tên đã bỏ khoảng trắng, tối đa 12> <6 ký tự cuối id>` */
const parseMemo = (content: string) => {
  const m = normalize(content).match(/LMS([A-Z0-9]{1,12})([A-Z0-9]{6})$/);
  if (m) return { student: m[1], exSuffix: m[2] };
  const loose = String(content ?? "").trim().split(/\s+/);
  const i = loose.findIndex((w) => normalize(w) === "LMS");
  if (i >= 0 && loose.length >= i + 3) {
    return { student: normalize(loose[i + 1]), exSuffix: normalize(loose[i + 2]) };
  }
  return null;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  // 1. Xác thực. Thiếu bước này thì bất kỳ ai cũng gọi được và tự cấp quyền.
  const expected = Deno.env.get("SEPAY_TOKEN");
  const got = (req.headers.get("authorization") ?? "").replace(/^Apikey\s+/i, "").trim();
  if (!expected || got !== expected) return json(401, { error: "unauthorized" });

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  // SePay chỉ quan tâm tiền VÀO.
  const direction = String(payload.transferType ?? "");
  if (direction && direction !== "in") return json(200, { ignored: "not_incoming" });

  const content = String(payload.content ?? payload.description ?? "");
  const amount = Math.round(Number(payload.transferAmount ?? payload.amount ?? 0));
  const ref = String(payload.id ?? payload.referenceCode ?? "");
  if (!ref) return json(400, { error: "missing_reference" });

  const parsed = parseMemo(content);
  if (!parsed) return json(200, { ignored: "memo_unrecognised", content });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 2. Tìm bài tập. Giá lấy từ máy chủ, KHÔNG lấy từ bất cứ thứ gì client gửi.
  const keys = ["s:mcf-practice", "s:mcf-exercises"];
  const { data: rows, error: readErr } = await supabase
    .from("kv_store").select("key,value").in("key", keys);
  if (readErr) return json(500, { error: "kv_read_failed", detail: readErr.message });

  let exercise: any = null;
  for (const row of rows ?? []) {
    let list: any[] = [];
    try { list = JSON.parse(row.value); } catch { continue; }
    const hit = list.find((e) => normalize(String(e?.id ?? "").slice(-6)) === parsed.exSuffix);
    if (hit) { exercise = hit; break; }
  }
  if (!exercise) return json(200, { ignored: "exercise_not_found", memo: parsed });

  // 3. Đối chiếu số tiền. Thiếu thì không cấp — chuyển thiếu vẫn là chưa mua.
  const price = Math.round(Number(exercise.price ?? 0));
  if (!exercise.isPremium || price <= 0) return json(200, { ignored: "exercise_not_paid" });
  if (amount < price) return json(200, { ignored: "amount_too_low", amount, price });

  // 4. Khớp tên học sinh với tài khoản có thật, để không cấp cho tên bịa.
  const { data: accRows } = await supabase
    .from("kv_store").select("value").eq("key", "s:mcf-accounts").maybeSingle();
  let student: string | null = null;
  try {
    const accounts = JSON.parse(accRows?.value ?? "[]");
    student = accounts.find((a: any) => normalize(a.name).slice(0, 12) === parsed.student)?.name ?? null;
  } catch { /* danh sách hỏng — coi như không khớp */ }
  if (!student) return json(200, { ignored: "student_not_found", memo: parsed });

  // 5. Ghi quyền. `ref` là unique nên SePay gửi lại cùng giao dịch cũng không
  //    tạo bản ghi thứ hai; upsert theo (student, exercise_id) để mua lại không vỡ.
  const { error: writeErr } = await supabase
    .from("exercise_access")
    .upsert(
      { student, exercise_id: exercise.id, status: "PURCHASED", amount, ref },
      { onConflict: "student,exercise_id" },
    );
  if (writeErr) {
    // Trùng `ref` nghĩa là đã xử lý giao dịch này rồi — không phải lỗi.
    if (String(writeErr.code) === "23505") return json(200, { ok: true, duplicate: true });
    return json(500, { error: "write_failed", detail: writeErr.message });
  }

  return json(200, { ok: true, student, exercise_id: exercise.id, amount });
});
