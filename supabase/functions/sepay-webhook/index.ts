/* Webhook SePay → cấp quyền tự động.
 *
 * Chạy phía máy chủ, giữ service_role, nên là nơi DUY NHẤT ghi được vào
 * exercise_access. Trình duyệt bị RLS chặn hoàn toàn (xem migration 001).
 *
 * Biến môi trường cần đặt (supabase secrets set ...):
 *   SEPAY_HMAC_SECRET        bí mật ký HMAC-SHA256 — cách nên dùng
 *   SEPAY_TOKEN              API Key cũ; giữ trong lúc chuyển, GỠ sau khi xong
 *   SUPABASE_URL             có sẵn trong môi trường Edge Function
 *   SUPABASE_SERVICE_ROLE_KEY có sẵn trong môi trường Edge Function
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore — JS thuần, dùng chung với bộ kiểm chạy bằng Node
import { findSignature, findTimestamp, candidateBodies, verifyAny, safeEqual }
  from "../_shared/hmac.js";

/* Ngân hàng thường viết hoa và bỏ dấu nội dung chuyển khoản, nên phải chuẩn
   hoá cả hai phía trước khi so. "Đỗ Hùng" có thể về thành "DO HUNG". */
/* PHẢI GIỐNG HỆT `memoSafe` trong src/shared/access.js.
   Ngân hàng chỉ giữ chữ và số trong nội dung chuyển khoản — dấu gạch, dấu
   chấm, dấu tiếng Việt đều bị nuốt. Bỏ hết ở cả hai đầu thì dù ngân hàng có
   cắt gì cũng vẫn khớp. */
const normalize = (s: string) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

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

  /* ── 1. Xác thực ──
   *
   * Thiếu bước này thì bất kỳ ai cũng gọi được và tự cấp quyền cho mình.
   *
   * CHẤP NHẬN HAI ĐƯỜNG, cố ý:
   *   · HMAC-SHA256 — cách đúng, bí mật không bao giờ rời khỏi hai đầu
   *   · API Key     — cách cũ, bí mật đi kèm mọi request
   *
   * Nhận cả hai vì đổi cấu hình bên SePay và deploy hàm này KHÔNG xảy ra cùng
   * một khoảnh khắc. Nếu hàm chỉ nhận HMAC mà SePay còn gửi API Key, thì mọi
   * giao dịch trong quãng giữa đều bị từ chối — tiền vào, quyền không cấp, và
   * học sinh không biết vì sao. Đúng lỗi mà migration 021/022 đã dạy.
   *
   * Khi đã chuyển xong và kiểm chứng, GỠ nhánh API Key: giữ lại nghĩa là kẻ
   * tấn công vẫn có một cửa yếu hơn để đi, và cửa yếu nhất mới là cửa quyết
   * định độ an toàn.
   *
   * Body phải đọc dưới dạng CHUỖI THÔ. Chữ ký tính trên từng byte nhận được;
   * `req.json()` rồi `JSON.stringify` lại có thể đổi thứ tự khoá hay cách
   * escape unicode, và chữ ký sẽ hỏng dù dữ liệu y hệt. */
  const raw = await req.text();

  const hmacSecret = Deno.env.get("SEPAY_HMAC_SECRET") ?? "";
  const apiKey = Deno.env.get("SEPAY_TOKEN") ?? "";

  const sig = findSignature(req.headers);
  const ts = findTimestamp(req.headers);
  let authed = false;
  let cach = "";

  if (hmacSecret && sig) {
    /* SePay gửi kèm `x-sepay-timestamp`, và một timestamp chỉ có tác dụng nếu
       nó NẰM TRONG phần được ký. Bản đầu chỉ ký body trần và bị từ chối —
       401 với chữ ký hợp lệ, chỉ vì ký nhầm chuỗi. Thử các cách thông dụng và
       ghi lại cách nào khớp; xem candidateBodies trong _shared/hmac.js. */
    const cachKhop = await verifyAny(hmacSecret, candidateBodies(raw, ts), sig.value);
    if (cachKhop) { authed = true; cach = `hmac:${sig.header}:${cachKhop}`; }
  }
  if (!authed && apiKey) {
    const got = (req.headers.get("authorization") ?? "").replace(/^Apikey\s+/i, "").trim();
    if (safeEqual(got, apiKey)) { authed = true; cach = "apikey"; }
  }

  if (!authed) {
    /* Liệt kê TÊN header đã nhận, không kèm giá trị. Tài liệu SePay không nằm
       trong tay lúc viết, nên nếu họ dùng một tên header khác danh sách đã
       biết, dòng này là thứ chỉ ra ngay — thay vì để ta đoán mò. */
    return json(401, {
      error: "unauthorized",
      hmac_configured: !!hmacSecret,
      signature_header_found: sig?.header ?? null,
      timestamp_header_found: ts ? true : false,
      formats_tried: candidateBodies("", ts).map((c) => c.label),
      headers_seen: [...req.headers.keys()].filter((h) => h !== "authorization"),
    });
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(raw); } catch { return json(400, { error: "bad_json" }); }

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
  /* ── Tìm bài tập trong BẢNG `exercises` ──
   *
   * Trước đây đoạn này đọc hai blob `s:mcf-practice` và `s:mcf-exercises`.
   * Đó là nguồn đúng cho tới migration 010; từ khi ứng dụng ghi thẳng vào bảng
   * `exercises`, hai blob đó đóng băng thành bản sao lưu.
   *
   * Hậu quả: mọi bài tạo SAU lần chuyển đổi đều không có trong blob, nên
   * webhook trả `exercise_not_found` và KHÔNG BAO GIỜ cấp quyền. Học sinh
   * chuyển tiền xong, màn hình chờ quay mãi, không ai biết vì sao. Đã đối
   * chiếu trên dữ liệu thật: 41 bài trong bảng, 39 trong blob, 2 bài chỉ có ở
   * bảng.
   *
   * Bài học chung: chuyển nguồn dữ liệu thì phải đi hết MỌI nơi đọc nó — kể cả
   * những nơi không nằm trong `src/`. Edge Function không bị `check:store` soi
   * vì bộ kiểm đó chỉ quét thư mục src.
   *
   * `isPremium` và `price` nằm trong cột `meta` (jsonb), không phải cột riêng —
   * xem EX_META trong shared/exerciseMap.js. */
  const { data: exRows, error: readErr } = await supabase
    .from("exercises").select("id, title, meta");
  if (readErr) return json(500, { error: "exercise_read_failed", detail: readErr.message });

  /* Chuẩn hoá TRƯỚC rồi mới cắt 6 ký tự cuối — ngược lại thì "prac-paid"
     ra "C-PAID" trong khi ngân hàng gửi về "CPAID". */
  const khop = (exRows ?? []).filter(
    (e: any) => normalize(String(e?.id ?? "")).slice(-6) === parsed.exSuffix,
  );

  /* Hai bài trùng 6 ký tự cuối thì không đoán bừa. Cấp nhầm bài là học sinh
     trả tiền cho bài A mà mở được bài B, và không có gì lần ra được. */
  if (khop.length > 1) {
    return json(200, { ignored: "exercise_ambiguous", memo: parsed,
                       ids: khop.map((e: any) => e.id) });
  }
  const row: any = khop[0];
  if (!row) return json(200, { ignored: "exercise_not_found", memo: parsed });

  const exercise = { id: row.id, title: row.title, ...(row.meta ?? {}) };

  // 3. Đối chiếu số tiền. Thiếu thì không cấp — chuyển thiếu vẫn là chưa mua.
  const price = Math.round(Number(exercise.price ?? 0));
  if (!exercise.isPremium || price <= 0) return json(200, { ignored: "exercise_not_paid" });
  if (amount < price) return json(200, { ignored: "amount_too_low", amount, price });

  /* 4. Khớp tên học sinh với người có thật, để không cấp cho tên bịa.

     Tìm ở CẢ HAI nơi. `profiles` là những người đã tự đăng ký — kể từ khi có
     đăng ký tự phục vụ thì phần lớn học sinh chỉ nằm ở đó. `s:mcf-accounts`
     là danh bạ giáo viên gõ tay, vẫn còn dùng cho người được ghi danh trước.
     Chỉ tra một nơi thì người ở nơi kia trả tiền xong vẫn bị khoá ngoài. */
  let student: string | null = null;

  const { data: profiles } = await supabase
    .from("profiles").select("name").eq("role", "eleve");
  student = (profiles ?? [])
    .find((p: any) => normalize(String(p.name ?? "")).slice(0, 12) === parsed.student)?.name ?? null;

  if (!student) {
    const { data: accRows } = await supabase
      .from("kv_store").select("value").eq("key", "s:mcf-accounts").maybeSingle();
    try {
      const accounts = JSON.parse(accRows?.value ?? "[]");
      student = accounts.find((a: any) => normalize(a.name).slice(0, 12) === parsed.student)?.name ?? null;
    } catch { /* danh sách hỏng — coi như không khớp */ }
  }

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

  /* `auth` cho biết request này qua cửa nào. Cần nó để biết chắc SePay đã
     chuyển sang HMAC thật — không có nó thì ta chỉ thấy "ok" và tưởng đã
     chuyển xong trong khi vẫn đang đi cửa API Key. */
  return json(200, { ok: true, auth: cach, student, exercise_id: exercise.id, amount });
});
