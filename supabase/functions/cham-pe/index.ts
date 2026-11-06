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
 *   OPENAI_API_KEY                             (BẠN phải đặt — model mặc định là OpenAI)
 *   ANTHROPIC_API_KEY                          (chỉ khi PE_AI_MODEL là model claude-…)
 *   PE_AI_MODEL                                (tuỳ chọn, mặc định ở dưới)
 *   PE_AI_EFFORT                               (tuỳ chọn, chỉ OpenAI: none|low|medium|…, mặc định low)
 *
 * Đặt khoá:
 *   npx supabase secrets set OPENAI_API_KEY=sk-...
 *   npx supabase functions deploy cham-pe
 */

/* GHIM PHIÊN BẢN — cùng lý do đã ghi ở `grade/index.ts`.
   `@2` trỏ tới bản mới nhất lúc khởi động nguội, nên hành vi đổi được mà không
   ai deploy gì và không dòng git nào ghi lại. Dự án đã mất hai ngày vì đúng
   chuyện đó (28–30/08/2026). 2.112.4 là bản `@2` đang phân giải ra tại lúc
   ghim, tức ĐÚNG bản đang chạy. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
import { tranVip } from "../_shared/tranVip.ts";
// @ts-ignore — JS thuần, cố ý không có khai báo kiểu
import { kiemGoiY, kiemChamLuyen, gopDiemNhieuLuot, ganDiemGop } from "../_shared/goiYPE.js";
// @ts-ignore — JS thuần, dùng chung với scripts/check-chamai.mjs
import { dungLoiNhac, goiMoHinh, laOpenAI } from "../_shared/loiNhacPE.js";
// @ts-ignore — JS thuần, dùng chung với trình duyệt
import { chuThuan, kiemTraCoDinh } from "../_shared/loiViet.js";

/* Model mặc định. Đổi được bằng biến môi trường PE_AI_MODEL để thử model khác
   mà không phải deploy lại — nhưng GIÁ TRỊ MẶC ĐỊNH vẫn nằm trong git, để
   "đang chạy model nào" luôn có một câu trả lời đọc được từ mã nguồn. */
const MODEL_MAC_DINH = "gpt-6-luna";   // chủ dự án chọn 26/09 — rẻ nhất ($0,10 / $0,50 mỗi 1M token)

/* Nhà cung cấp suy ra từ TÊN model: `gpt-…` / `o…` → OpenAI (khoá
   OPENAI_API_KEY), còn lại → Anthropic (khoá ANTHROPIC_API_KEY). Đổi model
   bằng PE_AI_MODEL là đổi luôn nhà cung cấp, không cần sửa mã. */
/* `laOpenAI` nằm ở _shared/loiNhacPE.js, cùng lời gọi mô hình. */

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
/* 08/10, theo chủ dự án: 3 lượt AI chấm mỗi NGÀY (theo giờ Việt Nam) cho tài
   khoản thường, TÍNH CẢ lượt chấm bài thi thử; VIP không giới hạn (124).
   Đổi từ cửa sổ trượt 24 giờ sang ngày lịch vì « 3 lần/ngày » là thứ học sinh
   hiểu và đếm được; lượt mới mở lúc 0 giờ. */
const HAN_MUC = 3;
const CUA_SO_GIO = 24;
const dauNgayVN = () => {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) - 7 * 3600_000).toISOString();
};

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

  const model = Deno.env.get("PE_AI_MODEL") || MODEL_MAC_DINH;
  const KHOA = Deno.env.get(laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY");
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
  let rubric = than?.rubric;
  /* chinhThuc (08/10, theo chủ dự án): AI chấm LÀ điểm phần viết của bài thi
     thử — ghi thẳng answers.score/feedback. Chỉ cho câu CHƯA có điểm, nên mỗi
     bài tốn đúng một lượt gọi; vì vậy chế độ này không trừ vào hạn mức gợi ý. */
  const chinhThuc = than?.chinhThuc === true;
  /* luyenTap (06/11): chấm câu viết tự do ở màn Luyện tập, CÓ điểm theo thang DELF của trình độ
     bài (bản 2 cùng ngày, theo chủ dự án). Tìm câu trả lời theo attemptId + questionId (màn luyện
     tập không cầm id câu trả lời). Không ghi answers.score: điểm nằm trong pe_ai_goi_y. */
  const luyenTap = than?.luyenTap === true && !chinhThuc;
  if ((luyenTap ? !(than?.attemptId && than?.questionId) : !answerId) || !rubric?.criteria?.length) {
    return json(400, { ok: false, ma: "THIEU_THAM_SO" });
  }

  /* VIP còn hạn: không giới hạn lượt (124). Đọc thẳng profiles bằng service_role. */
  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  /* ── Hạn mức, đo TRƯỚC khi tiêu tiền ── */
  const tuLuc = dauNgayVN();
  const { count: daDung } = await admin
    .from("pe_ai_goi_y")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", tuLuc);

  if (!laVip && (daDung ?? 0) >= HAN_MUC) {
    /* Mã lỗi RIÊNG, không gộp vào "thử lại sau".
       "Thử lại sau" mời người ta bấm lại ngay, và lần bấm đó cũng hỏng. Giao
       diện cần nói được "hết lượt, "+giờ+" nữa có lại" — cùng bài học với
       DAILY_LIMIT_REACHED ở tao_the_tu_viet. */
    return json(429, {
      ok: false, ma: "HET_LUOT", han_muc: HAN_MUC, cua_so_gio: CUA_SO_GIO,
      thong_bao: `Bạn đã dùng hết ${HAN_MUC} lượt AI chấm hôm nay. Lượt mới mở lúc 0 giờ; gói VIP không giới hạn.`,
    });
  }
  if (laVip) { const tran = await tranVip(admin, userId, "cham-pe"); if (tran) return tran; }

  /* ── Bài viết + đề bài, đọc từ database ──
     Lọc theo attempts.user_id NGAY TRONG câu truy vấn: service_role bỏ qua
     RLS, nên không có hàng rào nào khác ở đây ngoài chính câu lệnh này. */
  let truyVan = admin
    .from("answers")
    .select("id, raw, score, attempt_id, question_id, attempts!inner(user_id, finished_at), questions!inner(type, prompt, exercises(level, title, meta, consigne))")
    .eq("attempts.user_id", userId);
  truyVan = luyenTap
    ? truyVan.eq("attempt_id", String(than.attemptId)).eq("question_id", String(than.questionId))
    : truyVan.eq("id", answerId);
  const { data: ans, error: loiA } = await truyVan.maybeSingle();

  if (loiA || !ans) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  if ((ans as any).questions?.type !== "open") {
    return json(400, { ok: false, ma: "KHONG_PHAI_TU_LUAN" });
  }
  if (!(ans as any).attempts?.finished_at) {
    /* Chấm bài chưa nộp là mở một cửa hậu: viết một câu, xin gợi ý, sửa theo
       gợi ý, rồi nộp. Bài thi khi đó không đo được gì nữa. */
    return json(400, { ok: false, ma: "CHUA_NOP" });
  }

  if (chinhThuc && (ans as any).score != null) return json(409, { ok: false, ma: "DA_CO_DIEM" });
  if (luyenTap && (ans as any).questions?.exercises?.meta?.ghiAm) return json(400, { ok: false, ma: "KHONG_PHAI_TU_LUAN" });
  const idCauTraLoi = (ans as any).id;
  /* Trình độ của bài LẤY TỪ DATABASE, không tin client: thang client gửi phải cùng trình độ, không
     thì AI chấm bài A2 bằng thang B1. Bài luyện tập không có phiếu điền nên bỏ tiêu chí « fiche »
     (A1) thay vì để AI chấm một thứ học sinh không được làm. */
  const capBai = String((ans as any).questions?.exercises?.level ?? "").slice(0, 2).toUpperCase();
  if (luyenTap) {
    if (capBai && String(rubric.level ?? "").slice(0, 2).toUpperCase() !== capBai) {
      return json(400, { ok: false, ma: "SAI_TRINH_DO", cap_bai: capBai });
    }
    rubric = { ...rubric, criteria: rubric.criteria.filter((c: any) => c.id !== "fiche") };
  }

  const tongToiDa = rubric.criteria.reduce((n: number, c: any) => n + (Number(c.max_score) || 0), 0);
  /* Phiếu điền (formulaire, A1) cùng lượt làm bài: gộp vào bài để AI chấm cả
     tiêu chí « điền phiếu », rồi ghi phiếu 0/0 điểm (đã tính trong bài viết). */
  let phieu: any[] = [];
  if (chinhThuc) {
    const { data } = await admin.from("answers").select("id, raw, questions!inner(type, payload)")
      .eq("attempt_id", (ans as any).attempt_id).eq("questions.type", "formulaire");
    phieu = data ?? [];
  }
  const vanPhieu = phieu.map((a: any) => {
    const champs = a.questions?.payload?.champs ?? [];
    const raw = a.raw && typeof a.raw === "object" ? a.raw : {};
    return "PHIẾU ĐIỀN:\n" + champs.map((c: any) => `- ${c.nhan}: ${String(raw[c.id] ?? "").trim() || "(bỏ trống)"}`).join("\n");
  }).join("\n\n");
  const ghiPhieu = () => phieu.length
    ? admin.from("answers").update({ score: 0, max_score: 0, feedback: "Chấm gộp với bài viết.", graded_at: new Date().toISOString() })
        .in("id", phieu.map((a: any) => a.id)).is("score", null)
    : Promise.resolve();

  /* Chữ thuần (bài luyện tập là HTML của KhungViet): CÙNG hàm trình duyệt dùng để tô lỗi. */
  const baiViet = chuThuan((ans as any).raw);
  if (baiViet.length < 20) {
    if (!chinhThuc) return json(400, { ok: false, ma: "BAI_QUA_NGAN" });
    /* Bỏ trống / quá ngắn: không gọi AI (không có gì để chấm), cho 0 kèm lý do. */
    await admin.from("answers").update({ score: 0, max_score: tongToiDa || 25,
      feedback: "Bài viết bỏ trống hoặc quá ngắn để chấm.", graded_at: new Date().toISOString() })
      .eq("id", answerId).is("score", null);
    await ghiPhieu();
    return json(200, { ok: true, chinh_thuc: true, tong: 0, tong_toi_da: tongToiDa || 25 });
  }
  const copie = (vanPhieu ? vanPhieu + "\n\nBÀI VIẾT:\n" : "") + baiViet.slice(0, TRAN_KY_TU);
  /* Kiểm tra cố định (06/11): máy đếm từ theo luật DELF và đọc số từ đề yêu cầu. Đưa vào lời
     nhắc như một SỰ THẬT đã đo, để mô hình khỏi tự đếm (và đếm sai). */
  /* Đề = consigne của BÀI + câu hỏi. Câu tự luận ở luyện tập thường chỉ có « Écrivez votre message. »,
     còn yêu cầu thật (số từ, các ý phải có) nằm ở consigne. Thiếu nó thì AI không biết đề đòi gì
     và máy không đọc được « 60 mots minimum » (lỗi thấy ở lượt thật đầu tiên, 06/11). */
  const consigne = String((ans as any).questions?.exercises?.consigne ?? "");
  const cauHoi = String((ans as any).questions?.prompt ?? "");
  const deBaiTho = consigne && !chuThuan(cauHoi).includes(chuThuan(consigne)) ? consigne + "<br>" + cauHoi : (cauHoi || consigne);
  const kt = kiemTraCoDinh((ans as any).raw, deBaiTho);
  /* ── Lời nhắc ── dựng ở _shared/loiNhacPE.js, dùng chung với scripts/check-chamai.mjs để bộ
     hiệu chỉnh đo đúng máy chấm đang chạy thật. Trình độ lấy từ bài (database) trước thang. */
  const capDo = String((capBai || rubric.level) ?? "B1").slice(0, 2).toUpperCase();
  const { heThong, heThongDiem, nguoiDung } = dungLoiNhac({
    capDo, rubric, luyenTap, kt, copie,
    deBai: chuThuan(deBaiTho).slice(0, 2000),
    tenBai: (ans as any).questions?.exercises?.title ?? "",
  });

  /* ── Chấm hai lượt (giai đoạn 2) ──
     Lượt 1 viết cả phiếu, lượt 2 là giám khảo thứ hai độc lập chỉ cho điểm. Hai lượt chạy SONG
     SONG nên học sinh không phải chờ gấp đôi. Lệch lớn thì chấm lượt 3, lấy trung vị. Lượt 2, 3
     hỏng thì lùi về số lượt còn lại, không làm hỏng cả lượt chấm. Xem goiYPE.js › gopDiemNhieuLuot. */
  const effort = Deno.env.get("PE_AI_EFFORT") || "low";
  const goi = (h: string, maxTok: number) => goiMoHinh({ model, khoa: KHOA, heThong: h, nguoiDung, maxTok, effort });
  const [l1, l2]: any[] = await Promise.all([goi(heThong, luyenTap ? 4000 : 2000), goi(heThongDiem, 600)]);
  if (!l1.ok) return json(502, { ok: false, ma: l1.ma, trang_thai: l1.trang_thai, chi_tiet: l1.chi_tiet });
  const cacLuot: any[] = [l1.tho];
  let tokVao = l1.vao, tokRa = l1.ra;
  if (l2.ok) { cacLuot.push(l2.tho); tokVao += l2.vao; tokRa += l2.ra; }
  let gop: any = gopDiemNhieuLuot(rubric, cacLuot);
  if (gop.can_luot_ba) {
    const l3: any = await goi(heThongDiem, 600);
    if (l3.ok) { cacLuot.push(l3.tho); tokVao += l3.vao; tokRa += l3.ra; gop = gopDiemNhieuLuot(rubric, cacLuot); }
  }
  const tho = ganDiemGop(l1.tho, gop.diem);

  /* ── Kiểm khuôn TRƯỚC khi ghi ──
     Bước 4 trong phác thảo cũ ở gradingEngine.js, và là bước duy nhất có thể
     hỏng mà không ai thấy. Xem _shared/goiYPE.js. */
  const kq: any = luyenTap ? kiemChamLuyen(tho, rubric, baiViet) : kiemGoiY(tho, rubric, baiViet);
  if (!kq.ok) {
    return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON", ly_do: kq.ly_do });
  }
  kq.goiY.kiem_tra = kt;
  kq.goiY.cham_doi = {
    so_luot: gop.so_luot, tong_cac_luot: gop.tong_cac_luot,
    lech_lon_nhat: gop.lech_lon_nhat, chua_chac: gop.chua_chac,
  };

  const { data: dongGhi, error: loiGhi } = await admin.from("pe_ai_goi_y").insert({
    answer_id: idCauTraLoi,
    user_id: userId,
    model,
    ket_qua: kq.goiY,
    token_vao: tokVao || null,
    token_ra: tokRa || null,
  }).select("id").maybeSingle();

  /* Chế độ chính thức: ghi điểm AI làm điểm câu này. Chỉ khi AI chấm ĐỦ mọi
     tiêu chí — thiếu tiêu chí nào thì tổng thấp giả, nên không ghi. */
  let daGhiDiem = false;
  if (chinhThuc && !kq.bo?.length) {
    const g: any = kq.goiY;
    const chiTiet = rubric.criteria.map((c: any) => {
      const t = g.tieu_chi?.[c.id];
      if (!t) return "";
      return [`▸ ${c.name ?? c.id} (${c.name_fr ?? ""}) : ${t.diem}/${c.max_score}`,
        t.diem_manh ? `  Điểm mạnh: ${t.diem_manh}` : "",
        t.can_cai_thien ? `  Cần cải thiện: ${t.can_cai_thien}` : "",
        t.trich_dan ? `  Trích bài: « ${t.trich_dan} »` : ""].filter(Boolean).join("\n");
    }).filter(Boolean).join("\n");
    const uuTien = (g.uu_tien ?? []).map((x: string, k: number) => `${k + 1}. ${x}`).join("\n");
    const { error: loiD } = await admin.from("answers").update({
      score: g.tong, max_score: g.tong_toi_da || tongToiDa,
      feedback: [`NHẬN XÉT CỦA GIÁM KHẢO AI · DELF ${capDo}`,
        gop.chua_chac ? `Điểm chưa chắc: ${gop.so_luot} lượt chấm AI lệch nhau (${gop.tong_cac_luot.join(" / ")}). Bạn có thể bấm « Tôi thấy điểm này chưa đúng » để giáo viên xem lại.` : "",
        `Số từ: ${kt.so_tu}${kt.toi_thieu != null ? ` (đề yêu cầu ${kt.toi_thieu}${kt.toi_da ? `–${kt.toi_da}` : " trở lên"})` : ""}`, g.tong_quat, g.nhan_dinh_trinh_do, chiTiet, uuTien ? `Ưu tiên sửa:\n${uuTien}` : ""].filter(Boolean).join("\n\n").slice(0, 6000),
      graded_at: new Date().toISOString(),
    }).eq("id", answerId).is("score", null);
    daGhiDiem = !loiD;
    if (daGhiDiem) await ghiPhieu();
  }

  /* Ghi hỏng thì VẪN trả gợi ý về. Học sinh đã chờ xong lời gọi và tiền token
     đã tiêu; nuốt kết quả vì một lỗi ghi là bắt họ trả giá hai lần. Nhưng nói
     ra rằng nó không được lưu, để "mở lại thấy mất" không thành một bí ẩn. */
  return json(200, {
    ok: true,
    goi_y: kq.goiY,
    bo: kq.bo,
    model,
    da_luu: !loiGhi,
    goi_y_id: dongGhi?.id ?? null,
    da_ghi_diem: daGhiDiem,
    con_lai: Math.max(0, HAN_MUC - (daDung ?? 0) - 1),
  });
});
