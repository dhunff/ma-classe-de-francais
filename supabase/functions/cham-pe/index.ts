/* Gợi ý chấm Production écrite bằng AI.
 *
 * ══ VÌ SAO Ở MÁY CHỦ, KHÔNG Ở TRÌNH DUYỆT ══
 *
 * Khoá API đặt trong mã client là khoá đã lộ — mở tab Network là thấy, và
 * người lấy được nó tiêu tiền của bạn cho tới khi bạn phát hiện. Chú thích
 * trong `shared/gradingEngine.js` đã ghi đúng điều này từ lâu trước khi có
 * dòng mã nào; đây là bản thi hành.
 *
 * ══ BÀI VIẾT LẤY TỪ DATABASE, KHÔNG LẤY TỪ CLIENT ══
 *
 * Client chỉ gửi `answerId`. Hàm tự đọc bài viết và đề bài từ database bằng
 * service_role. Nhận chữ do client gửi thì có hai chỗ hỏng:
 *
 *   1. Học sinh gửi một bài viết khác hẳn bài đã nộp, lấy gợi ý, rồi khoe con
 *      số. Gợi ý mất hết nghĩa với chính người đang dùng nó.
 *   2. Ai đó gửi 40 nghìn chữ và trả tiền token bằng ví của bạn.
 *
 * Đọc từ database thì cả hai biến mất cùng lúc, và không cần một dòng kiểm nào.
 *
 * ══ AI ĐỀ XUẤT, HỌC SINH KÝ ══
 *
 * Hàm này KHÔNG chạm vào `answers.self_score`. Nó ghi vào `pe_ai_goi_y` và
 * dừng ở đó. Điểm thật vẫn phải đi qua `save_self_assessment` (migration 030),
 * tức là vẫn do học sinh bấm nút. Xem migration 083.
 *
 * Biến môi trường:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (Supabase tự đặt)
 *   ANTHROPIC_API_KEY                          (BẠN phải đặt — xem README dưới)
 *   PE_AI_MODEL                                (tuỳ chọn, mặc định ở dưới)
 *
 * Đặt khoá:
 *   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 *   npx supabase functions deploy cham-pe
 */

/* GHIM PHIÊN BẢN — cùng lý do đã ghi ở `grade/index.ts`.
   `@2` trỏ tới bản mới nhất lúc khởi động nguội, nên hành vi đổi được mà không
   ai deploy gì và không dòng git nào ghi lại. Dự án đã mất hai ngày vì đúng
   chuyện đó (28–30/08/2026). 2.112.4 là bản `@2` đang phân giải ra tại lúc
   ghim, tức ĐÚNG bản đang chạy. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
// @ts-ignore — JS thuần, cố ý không có khai báo kiểu
import { kiemGoiY, bocJSON } from "../_shared/goiYPE.js";

/* Model mặc định. Đổi được bằng biến môi trường PE_AI_MODEL để thử model khác
   mà không phải deploy lại — nhưng GIÁ TRỊ MẶC ĐỊNH vẫn nằm trong git, để
   "đang chạy model nào" luôn có một câu trả lời đọc được từ mã nguồn. */
const MODEL_MAC_DINH = "claude-sonnet-5";

/* Hạn mức: 6 lượt / 24 giờ / người.
 *
 * Cửa sổ TRƯỢT, không phải "mỗi ngày". Hạn mức này tồn tại để chặn chi phí,
 * và một cửa sổ trượt không có nửa đêm để ai đó đứng chờ rồi bấm hai lượt
 * liền nhau. Cũng không có múi giờ nào để sai — khác `tao_the_tu_viet`, nơi
 * "hôm nay" là khái niệm của người học nên phải theo giờ địa phương.
 *
 * Sáu là đủ cho việc học thật: viết một bài, xin gợi ý, sửa, xin lại. Ai cần
 * lượt thứ bảy trong một ngày thì gần như chắc chắn đang thử nghịch hệ thống
 * chứ không đang luyện thi. */
const HAN_MUC = 6;
const CUA_SO_GIO = 24;

/* Trần độ dài bài viết gửi cho mô hình. Bài DELF B2 dài nhất cũng chỉ quanh
   250 từ; 12 nghìn ký tự là rộng rãi gấp nhiều lần. Trần này không để chặn học
   sinh — nó chặn một dòng dữ liệu hỏng biến thành một hoá đơn. */
const TRAN_KY_TU = 12000;

function nhacKhoa() {
  return json(503, {
    ok: false,
    ma: "CHUA_CAU_HINH_KHOA",
    thong_bao: "Máy chủ chưa có khoá API, nên chưa xin gợi ý được.",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });

  const KHOA = Deno.env.get("ANTHROPIC_API_KEY");
  if (!KHOA) return nhacKhoa();

  /* ── Ai đang gọi ──
     `auth.getUser(token)` với token TRUYỀN THẲNG, không gọi rỗng. Trong Deno
     không có nơi lưu phiên, nên dạng rỗng phụ thuộc vào việc thư viện có tự
     đọc header hay không — điều không nằm trong hợp đồng, và đã đổi một lần
     rồi (xem grade/index.ts). */
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: u, error: loiU } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (loiU || !userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* để rơi xuống câu kiểm dưới */ }
  const answerId = than?.answerId;
  const rubric = than?.rubric;
  if (!answerId || !rubric?.criteria?.length) {
    return json(400, { ok: false, ma: "THIEU_THAM_SO" });
  }

  /* ── Hạn mức, đo TRƯỚC khi tiêu tiền ── */
  const tuLuc = new Date(Date.now() - CUA_SO_GIO * 3600_000).toISOString();
  const { count: daDung } = await admin
    .from("pe_ai_goi_y")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", tuLuc);

  if ((daDung ?? 0) >= HAN_MUC) {
    /* Mã lỗi RIÊNG, không gộp vào "thử lại sau".
       "Thử lại sau" mời người ta bấm lại ngay, và lần bấm đó cũng hỏng. Giao
       diện cần nói được "hết lượt, "+giờ+" nữa có lại" — cùng bài học với
       DAILY_LIMIT_REACHED ở tao_the_tu_viet. */
    return json(429, {
      ok: false, ma: "HET_LUOT", han_muc: HAN_MUC, cua_so_gio: CUA_SO_GIO,
      thong_bao: `Hết lượt xin gợi ý (${HAN_MUC} lượt mỗi ${CUA_SO_GIO} giờ).`,
    });
  }

  /* ── Bài viết + đề bài, đọc từ database ──
     Lọc theo attempts.user_id NGAY TRONG câu truy vấn: service_role bỏ qua
     RLS, nên không có hàng rào nào khác ở đây ngoài chính câu lệnh này. */
  const { data: ans, error: loiA } = await admin
    .from("answers")
    .select("id, raw, question_id, attempts!inner(user_id, finished_at), questions!inner(type, prompt)")
    .eq("id", answerId)
    .eq("attempts.user_id", userId)
    .maybeSingle();

  if (loiA || !ans) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  if ((ans as any).questions?.type !== "open") {
    return json(400, { ok: false, ma: "KHONG_PHAI_TU_LUAN" });
  }
  if (!(ans as any).attempts?.finished_at) {
    /* Chấm bài chưa nộp là mở một cửa hậu: viết một câu, xin gợi ý, sửa theo
       gợi ý, rồi nộp. Bài thi khi đó không đo được gì nữa. */
    return json(400, { ok: false, ma: "CHUA_NOP" });
  }

  const baiViet = String((ans as any).raw ?? "").trim();
  if (baiViet.length < 20) return json(400, { ok: false, ma: "BAI_QUA_NGAN" });
  const copie = baiViet.slice(0, TRAN_KY_TU);

  /* ── Nhắc mô hình ──
     Liệt kê TỪNG tiêu chí kèm thang điểm và mô tả lấy thẳng từ rubric đang
     hiển thị cho học sinh. Không tóm tắt lại: nếu mô hình chấm theo một thang
     khác với thang trên màn hình thì gợi ý và ô điểm cạnh nó nói hai chuyện. */
  const bangTieuChi = rubric.criteria.map((c: any) =>
    `- id: "${c.id}" | ${c.name_fr ?? c.name} | tối đa ${c.max_score} điểm, bước ${c.step ?? 0.5}`
    + (c.description ? `\n  Mô tả: ${String(c.description).slice(0, 300)}` : ""),
  ).join("\n");

  const heThong = [
    "Bạn là giám khảo DELF chấm phần Production écrite.",
    `Trình độ của đề: ${rubric.level ?? "B1"}.`,
    "",
    "Chấm theo ĐÚNG các tiêu chí dưới đây, không thêm không bớt:",
    bangTieuChi,
    "",
    "Quy tắc:",
    "- Cho điểm trong khoảng từ 0 tới mức tối đa của TỪNG tiêu chí. Không vượt.",
    "- Nhận xét viết bằng TIẾNG VIỆT, xưng hô với người học là « bạn ».",
    "- Mỗi nhận xét phải TRÍCH một đoạn cụ thể trong bài rồi nói vì sao, thay vì",
    "  nhận định chung chung. Người học phải biết sửa ở đâu.",
    "- Không bịa lỗi. Tiêu chí nào bài làm tốt thì nói là tốt.",
    "",
    "Trả lời CHỈ bằng một khối JSON, không thêm chữ nào ngoài nó:",
    '{ "tieu_chi": { "<id>": { "diem": <số>, "nhan_xet": "<tiếng Việt>" } },',
    '  "tong_quat": "<2-3 câu tiếng Việt: điểm mạnh nhất và việc cần sửa trước tiên>" }',
  ].join("\n");

  const deBai = String((ans as any).questions?.prompt ?? "").slice(0, 2000);
  const nguoiDung = [
    "ĐỀ BÀI:", deBai || "(không còn trong hệ thống)",
    "", "BÀI LÀM CỦA HỌC SINH:", copie,
  ].join("\n");

  const model = Deno.env.get("PE_AI_MODEL") || MODEL_MAC_DINH;

  let phanHoi: Response;
  try {
    phanHoi = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": KHOA,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: heThong,
        messages: [{ role: "user", content: nguoiDung }],
      }),
    });
  } catch (e) {
    return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) });
  }

  if (!phanHoi.ok) {
    const chiTiet = (await phanHoi.text().catch(() => "")).slice(0, 300);
    /* In mã trạng thái ra cho người vận hành. 401 = khoá sai, 429 = hết hạn
       mức bên nhà cung cấp, 529 = quá tải — ba việc phải làm khác hẳn nhau, và
       gộp chúng thành "lỗi AI" là bắt người sau đi đoán. */
    return json(502, {
      ok: false, ma: "AI_TRA_LOI_LOI", trang_thai: phanHoi.status, chi_tiet: chiTiet,
    });
  }

  const goi = await phanHoi.json().catch(() => null);
  const chu = goi?.content?.[0]?.text ?? "";
  const tho = bocJSON(chu);
  if (!tho) return json(502, { ok: false, ma: "AI_TRA_VE_KHONG_PHAI_JSON" });

  /* ── Kiểm khuôn TRƯỚC khi ghi ──
     Bước 4 trong phác thảo cũ ở gradingEngine.js, và là bước duy nhất có thể
     hỏng mà không ai thấy. Xem _shared/goiYPE.js. */
  const kq = kiemGoiY(tho, rubric);
  if (!kq.ok) {
    return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON", ly_do: kq.ly_do });
  }

  const { error: loiGhi } = await admin.from("pe_ai_goi_y").insert({
    answer_id: answerId,
    user_id: userId,
    model,
    ket_qua: kq.goiY,
    token_vao: goi?.usage?.input_tokens ?? null,
    token_ra: goi?.usage?.output_tokens ?? null,
  });

  /* Ghi hỏng thì VẪN trả gợi ý về. Học sinh đã chờ xong lời gọi và tiền token
     đã tiêu; nuốt kết quả vì một lỗi ghi là bắt họ trả giá hai lần. Nhưng nói
     ra rằng nó không được lưu, để "mở lại thấy mất" không thành một bí ẩn. */
  return json(200, {
    ok: true,
    goi_y: kq.goiY,
    bo: kq.bo,
    model,
    da_luu: !loiGhi,
    con_lai: Math.max(0, HAN_MUC - (daDung ?? 0) - 1),
  });
});
